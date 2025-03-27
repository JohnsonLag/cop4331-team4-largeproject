const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Import utils
var token = require('../utils/JWTUtils.js'); 
const getNextId = require("../utils/idGenerator.js");

// Import models
const FlashCard = require('../models/flashcards.js');
const FlashCardDecks = require('../models/flashcarddecks.js');
const Counter = require('../models/counter.js');

// Helper function to get the next sequence value
const getNextSequence = async (name, increment = 1) => {
    const result = await Counter.findOneAndUpdate(
        { _id: name },
        { $inc: { sequence_value: increment } },
        { new: true, upsert: true }
    );
    return result.sequence_value;
};

exports.setApp = function ( app, client )
{
    // Save LLM generated flashcards
    app.post('/api/flashcards/save_generated_cards', async (req, res) => 
    {
        const session = await mongoose.startSession();
        session.startTransaction();

        var error = "";

        try {
            // incoming: flashcards[], userId, deckId (optional), jwtToken
            // outgoing: error, ..., jwtToken
            const { flashcards, userId, deckId, jwtToken } = req.body;

            // Check Json Web Token
            try
            {
                if ( token.isExpired(jwtToken) )
                {
                    var r = { error:"The JWT is no longer valid", jwtToken: ""};
                    res.status(200).json(r);
                    return;
                }
            }
            catch (e)
            {
                console.log(e.message);
            }

            // Validate input
            if (!Array.isArray(flashcards) || !userId || !deckId) {
                await session.abortTransaction();
                session.endSession();

                error = 'Missing required fields: flashcards array, userId, or deckId';

                return res.status(400).json({
                    error: error,
                    savedCount: -1,
                    firstCardId: -1,
                    lastCardId: -1,
                    jwtToken: "",
                });
            }

            // If the user didn't supply a deckId, generate a new deck
            var newDeckId;
            if (deckId == -1)
            {
                newDeckId = await getNextId( "deckId" );

                const newDeck = new FlashCardDecks({
                    UserId: userId,
                    DeckId: newDeckId,
                    Title: "Newly generated deck",
                    NumCards: flashcards.length,
                })
                
                var error = '';
                try
                {
                    newDeck.save();
                }
                catch (e)
                {
                    error = e.toString();
                }
            }
            else
            {
                newDeckId = deckId;
            }

            // Get the last cardId from global sequence
            const lastCardId = await getNextSequence('CardId', flashcards.length);

            // Calculate first cardId in the batch
            const firstCardId = lastCardId - flashcards.length + 1;

            // Prepare documents (adjusting for sequence starting point)
            const cardsToInsert = flashcards.map((card, index) => ({
                UserId: userId,
                DeckId: newDeckId,
                CardId: firstCardId + index, // Calculate sequential IDs
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
            try
            {
                refreshedToken = token.refresh(jwtToken);
            }
            catch(e)
            {
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
        } 
        catch (error) 
        {
            await session.abortTransaction();
            session.endSession();
            console.error('Error saving flashcards:', error);

            error = 'Internal server error';

            res.status(200).json({
                error: error,
                savedCount: -1,
                firstCardId: -1,
                lastCardId: -1,
                jwtToken: "",
            });
        }
    });
}