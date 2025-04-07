require('express');
require('mongodb');

var token = require('../utils/JWTUtils.js');
const getNextId = require("../utils/idGenerator.js");

// FlashCardDecks model
const FlashCardDecks = require("../models/flashcarddecks.js");
const FlashCards = require("../models/flashcards.js");

// Variables for scoring system
const min_confidence = -5;
const max_confidence = 5;

exports.setApp = function ( app, client )
{
    // Create
    app.post('/api/add_flash_card', async (req, res, next) =>
    {
        // incoming: userId, deckId, question, answer, jwtToken
        // outgoing: cardId, error, jwtToken
        const { userId, deckId, question, answer, jwtToken } = req.body;

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

        // Find corresponding flashcard deck
        const deck = await FlashCardDecks.findOne({
            UserId: userId,
            DeckId: deckId
        })

        // Add a new flash card
        const cardId = await getNextId( "cardId" );
        
        const newCard = new FlashCards({
            UserId: userId,
            CardId: cardId,
            DeckId: deckId,
            Question: question,
            Answer: answer,
        })

        var error = '';
        try
        {
            // console.log(deck);

            newCard.save();

            // Update number of cards in deck
            deck.NumCards += 1;
            deck.save();
        }
        catch (e)
        {
            error = e.toString();
        }

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

        // Return
        var ret = { cardId: cardId, error: error, jwtToken: refreshedToken };
        res.status(200).json(ret);
    });

    // Search / Retrieve flash cards
    app.post('/api/search_flash_cards/', async (req, res, next) =>
    {
        // incoming: userId, deckId, search, jwtToken
        // outgoing: results[[title]], error
        var error = '';
        const { userId, deckId, search, jwtToken } = req.body;

        // Check Json Web Token
        try
        {
            if( token.isExpired(jwtToken))
            {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(200).json(r);
                return;
            }
        }
        catch(e)
        {
            error = e.toString();
            console.log(e.message);
        }

        // Retrieve decks using the search query
        var _ret = [];
        try
        {
            var _search = search.trim();

            const results = await FlashCards.find({
                "UserId": userId,
                "DeckId": deckId,
                "Question": { $regex: _search + '.*', $options: 'i' }
            });
            _ret = results;
        }
        catch (e)
        {
            error = e.toString();
            console.log(e);
        }

        // Refresh token
        var refreshedToken = null;
        try
        {
            refreshedToken = token.refresh(jwtToken);
        }
        catch(e)
        {
            error = e.toString();
            console.log(e.message);
        }

        var ret = { results: _ret, error: error, jwtToken: refreshedToken };
        res.status(200).json(ret);
    });

    // Fetch flashcards due for review
    app.post('/api/get_cards_for_review', async(req, res, next) => {
        // incoming: userId, deckId, jwtToken
        // outgoing: cards[], error, jwtToken
        const { userId, deckId, jwtToken } = req.body;

        // Check Json Web Token
        try
        {
            if( token.isExpired(jwtToken))
            {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(200).json(r);
                return;
            }
        }
        catch(e)
        {
            console.log(e.message);
        }

        // Fetch flashcards
        let error = '';
        let cards = [];
        try
        {

            const query = {
                UserId: userId,
                DeckId: deckId,
            };

            cards = await FlashCards.find(query).sort({ ConfidenceScore: 1 });
        }
        catch (e)
        {
            error = e.toString();
            console.log(e);
        }

        // Refresh token
        var refreshedToken = null;
        try
        {
            refreshedToken = token.refresh(jwtToken);
        }
        catch(e)
        {
            console.log(e.message);
        }

        // Return
        res.status(200).json({ cards: cards, error: error, jwtToken: refreshedToken });
    });

    // Change confidence score 
    app.post('/api/rate_flash_card', async (req, res, next) => 
    {
        // incoming: userId, deckId, cardId, confidence, jwtToken
        // outgoing: error, newScore, jwtToken
        const { userId, deckId, cardId, confidence, jwtToken } = req.body;

        // Check Json Web Token
        try
        {
            if( token.isExpired(jwtToken))
            {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(200).json(r);
                return;
            }
        }
        catch(e)
        {
            console.log(e.message);
        }

        // Update flashcard's confidence
        let error = 0;
        let newScore = 0;
        try
        {
            const card = await FlashCards.findOne({
                UserId: userId,
                DeckId: deckId,
                CardId: cardId,
            });

            if (!card)
            {
                error = "Card not found or does not exist!";
            }
            else
            {
                // Calculate new score and clamp
                newScore = card.ConfidenceScore + confidence;
                newScore = Math.max(min_confidence, Math.min(max_confidence, newScore));

                // Update the card
                await FlashCards.findOneAndUpdate(
                    { UserId: userId, DeckId: deckId, CardId: cardId },
                    {
                        ConfidenceScore: newScore,
                        LastReviewed: new Date(),
                        $inc: { ReviewCount: 1}, // Increment review count by 1
                    }
                )
            }
        }
        catch (e)
        {
            error = e.toString();
            console.log(e);
        }

        // Refresh token
        var refreshedToken = null;
        try
        {
            refreshedToken = token.refresh(jwtToken);
        }
        catch(e)
        {
            console.log(e.message);
        }

        // Return
        res.status(200).json({ error: error, newScore: newScore, jwtToken: refreshedToken });

    });


    // Update
    app.post('/api/update_flashcard', async (req, res, next) =>
    {
        // incoming: userId, cardId, question, answer, jwtToken
        // outgoing: cardId, error, jwtToken
        const { userId, cardId, question, answer, jwtToken } = req.body;

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

        // Update flash card
        var error = '';
        try 
        {
            // Find the deck and update it
            const updatedCard = await FlashCards.findOneAndUpdate(
                { UserId: userId, CardId: cardId },
                { 
                    $set: { 
                        Question: question,
                        Answer: answer,
                    } 
                },
                { new: true }  // Return the updated document
            );
    
            if (!updatedCard) {
                error = "Flashcard not found or you don't have permission to edit it";
            }
        }
        catch (e)
        {
            error = e.toString();
            console.log(e);
        }

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

        // Return
        var ret = { cardId: cardId, error: error, jwtToken: refreshedToken };
        res.status(200).json(ret);
    });

    // Delete
    app.post('/api/delete_flash_card', async (req, res, next) => 
    {
        // incoming: userId, deckId, cardId, jwtToken
        // outgoing: error
        const { userId, deckId, cardId, jwtToken } = req.body;

        // Check Json Web Token
        try
        {
            if( token.isExpired(jwtToken))
            {
                var r = {error:'The JWT is no longer valid', jwtToken: ''};
                res.status(200).json(r);
                return;
            }
        }
        catch(e)
        {
            console.log(e.message);
        }

        // Find the corresponding deck
        const deck = await FlashCardDecks.findOne({
            UserId: userId,
            DeckId: deckId
        })

        // Delete the flashcard
        var error = "";
        try 
        {
            await FlashCards.findOneAndDelete({ UserId: userId, CardId: cardId, DeckId: deckId });

            // Update the number of cards in the deck
            deck.NumCards -= 1;
            deck.save();
        }
        catch (e)
        {
            console.log(e);
        }

        // Refresh token
        var refreshedToken = null;
        try
        {
            refreshedToken = token.refresh(jwtToken);
        }
        catch(e)
        {
            console.log(e.message);
        }

        // Return
        res.status(200).json({ error: error, jwtToken: refreshedToken });
    });
}