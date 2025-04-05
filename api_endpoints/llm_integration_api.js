// llm_integration_api.js

const express = require('express');
const mongoose = require('mongoose');

// Import utilities and models
var token = require('../utils/JWTUtils.js');
const getNextId = require("../utils/idGenerator.js");

const FlashCard = require('../models/flashcards.js');
const FlashCardDecks = require('../models/flashcarddecks.js');
const Counter = require('../models/counter.js');
const Note = require('../models/notes.js');

// Import Google GenAI
const { GoogleGenAI } = require('@google/genai');

// Include jsonrepair to clean up llm output
const { jsonrepair } = require('jsonrepair');

// Include axios for API calling inside gen_cards API
const axios = require('axios');

// Helper function to get the next sequence value
const getNextSequence = async (name, increment = 1) => {
    const result = await Counter.findOneAndUpdate(
        { _id: name },
        { $inc: { sequence_value: increment } },
        { new: true, upsert: true }
    );
    return result.sequence_value;
};

exports.setApp = function (app, client) {
    app.post('/api/flashcards/save_generated_cards', async (req, res) => {
        // incoming: flashcards[], title, userId, deckId (optional), jwtToken
        // outgoing: error, savedCount, firstCardId, lastCardId, jwtToken

        const session = await mongoose.startSession();
        session.startTransaction();

        var error = "";

        try {
            // Incoming: flashcards[], userId, deckId (optional), jwtToken
            const { flashcards, title, userId, deckId, jwtToken } = req.body;

            // Check JSON Web Token
            try {
                if (token.isExpired(jwtToken)) {
                    var r = { error: "The JWT is no longer valid", jwtToken: "" };
                    res.status(200).json(r);
                    return;
                }
            } catch (e) {
                console.log(e.message);
            }

            // Validate input
            if (!Array.isArray(flashcards) || !userId || !deckId) {
                await session.abortTransaction();
                session.endSession();

                error = 'Missing required fields: flashcards array, userId, or deckId';

                return res.status(400).json({
                    error: error,
                    title: "",
                    savedCount: -1,
                    firstCardId: -1,
                    lastCardId: -1,
                    jwtToken: "",
                });
            }

            // If the user didn't supply a deckId (-1 indicates a new deck), generate a new deck
            var newDeckId;
            if (deckId == -1) {
                newDeckId = await getNextId("deckId");

                const newDeck = new FlashCardDecks({
                    UserId: userId,
                    DeckId: newDeckId,
                    Title: title,
                    NumCards: flashcards.length,
                });

                try {
                    await newDeck.save();
                } catch (e) {
                    error = e.toString();
                }
            } else {
                // Update a preexising deck

                newDeckId = deckId;
                // Find deck and update num cards
                await FlashCardDecks.findOneAndUpdate(
                    {
                        UserId: userId,
                        DeckId: deckId,
                    },
                    { $inc: { NumCards: flashcards.length } }
                );
            }

            // Get the last cardId from global sequence
            const lastCardId = await getNextSequence('cardId', flashcards.length);

            // Calculate first cardId in the batch
            const firstCardId = lastCardId - flashcards.length + 1;

            // Prepare documents (adjusting for sequential CardId)
            const cardsToInsert = flashcards.map((card, index) => ({
                UserId: userId,
                DeckId: newDeckId,
                CardId: firstCardId + index,
                Question: card.question,
                Answer: card.answer,
                ConfidenceScore: 0,
                LastReviewed: null,
                ReviewCount: 0
            }));

            // Insert all cards
            const result = await FlashCard.insertMany(cardsToInsert, { session });
            await session.commitTransaction();
            session.endSession();

            // Refresh the token
            var refreshedToken = null;
            try {
                refreshedToken = token.refresh(jwtToken);
            } catch (e) {
                console.log(e.message);
                error = e.toString();
            }

            res.status(200).json({
                error: error,
                savedCount: result.length,
                firstCardId: firstCardId,
                lastCardId: lastCardId,
                jwtToken: refreshedToken,
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error('Error saving flashcards:', error);
            error = 'Internal server error';
            res.status(500).json({
                error: error,
                savedCount: -1,
                firstCardId: -1,
                lastCardId: -1,
                jwtToken: "",
            });
        }
    });

    app.post('/api/flashcards/generate_from_note', async (req, res) => {
        // incoming: noteId, jwtToken
        // outgoing: error OR message, flashcards and saveDetails

        try {
            // Check the noteId
            const { noteId, jwtToken } = req.body;
            if (noteId === undefined || noteId === null) {
                return res.status(400).json({ error: 'Missing noteId' });
            }

            // Find the note, using just NoteId
            const note = await Note.findOne({ NoteId: noteId }).exec();
            if (!note) {
                return res.status(404).json({ error: 'Note not found' });
            }

            // Combine note body content, if it is missing throw error, the LLM cant make cards
            const noteContent = Array.isArray(note.Body) ? note.Body.join(" ") : note.Body;
            if (!note) {
                return res.status(404).json({ error: 'Note body missing' });
            }

            const promptText = `I am going to provide information, 
                create notecards that are relevant to the information with a question and answer. 
                Create enough cards to sufficiently display all critical information, 
                depending on the size of the information. 
                The output you create needs to be in a strict json format of type 
                { "flashcards": [ {"question": "<your question>", "answer": "<your answer>" } ] } . 
                Output no extra characters besides the json. 
                Output nothing besides the designated JSON. 
                Do not include triple backticks, code fences, 
                or ANY text outside the json. Here is the information: ${noteContent}`;

            // Define the model
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

            // Call the model (promptText and systemInstruction act similar here)
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: promptText,
                config: {
                    temperature: 0.0,
                    systemInstruction: 'Output nothing besides the designated JSON. Do not include triple backticks, code fences, or ANY text outside the json.'
                }
            });

            // Parse the output (jsonrepair helps clean this up)
            let flashcardData;
            try {
                const repaired = jsonrepair(response.text);
                flashcardData = JSON.parse(repaired);
            } catch (err) {
                console.error('Error parsing generated flashcard data:', err, response.text);
                return res.status(500).json({
                    error: 'Invalid JSON from LLM',
                    details: err.message
                });
            }

            // Create a deck title
            const response2 = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: noteContent,
                config: {
                    temperature: 0.0,
                    systemInstruction: 'Given the text, create a name for a deck of flashcards holding this information, output nothing except for the name you create'
                }
            });
            flashcardDeckTitle = response2.text;

            // Saving logic
            const url = 'http://localhost:5000/api/flashcards/save_generated_cards';
            // For live deployment-
            // const url = 'http://coolestappever.xyz/api/flashcards/save_generated_cards';

            const userId = note.UserId;
            const deckId = -1;

            // Refresh the token
            var refreshedToken = null;
            try {
                refreshedToken = token.refresh(jwtToken);
            } catch (e) {
                console.log(e.message);
                error = e.toString();
            }

            const saveResponse = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flashcards: flashcardData.flashcards,
                    title: flashcardDeckTitle,
                    userId,
                    deckId,
                    jwtToken
                })
            });

            const saveDetails = await saveResponse.json();

            // Return the generated flashcards
            return res.status(200).json({
                message: 'Flashcards generated and saved successfully',
                flashcards: flashcardData.flashcards,
                saveDetails
            });
        } catch (error) {
            console.error('Error generating flashcards from note:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    });

};