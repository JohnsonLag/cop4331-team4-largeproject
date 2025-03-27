require('express');
require('mongodb');

var token = require('../utils/JWTUtils.js');
const getNextId = require("../utils/idGenerator.js");

// FlashCardDecks model
const FlashCardDecks = require("../models/flashcarddecks.js");

exports.setApp = function ( app, client )
{
    // Create
    app.post('/api/create_flashcard_deck', async (req, res, next) =>
    {
        // incoming: userId, title, jwtToken
        // outgoing: deckId, error, jwtToken
        const { userId, title, jwtToken } = req.body;

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

        // Add a new flash card deck
        const deckId = await getNextId( "deckId" );

        const newDeck = new FlashCardDecks({
            UserId: userId,
            DeckId: deckId,
            Title: title,
            NumCards: 0,
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
        var ret = { deckId: deckId, error: error, jwtToken: refreshedToken };
        res.status(200).json(ret);
    });

    // Search flash card decks
    app.post('/api/search_flashcard_decks/', async (req, res, next) =>
    {
        // incoming: userId, search, jwtToken
        // outgoing: results[[title]], error
        var error = '';
        const { userId, search, jwtToken } = req.body;

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

            const results = await FlashCardDecks.find({
                "UserId": userId,
                "Title": { $regex: _search + '.*', $options: 'i' }
            });

            for ( var i = 0; i < results.length; i++ )
            {
                _ret.push([
                    results[i].UserId,
                    results[i].DeckId,
                    results[i].Title,
                    results[i].NumCards,
                ]);
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
            error = e.toString();
            console.log(e.message);
        }

        var ret = { results: _ret, error: error, jwtToken: refreshedToken };
        res.status(200).json(ret);
    });

    // Update
    app.post('/api/update_flashcard_deck', async (req, res, next) =>
    {
        // incoming: userId, deckId, title, jwtToken
        // outgoing: deckId, error, jwtToken
        const { userId, deckId, title, jwtToken } = req.body;

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

        // Update flash card deck
        var error = '';
        try 
        {
            // Find the note and update it
            const updatedDeck = await FlashCardDecks.findOneAndUpdate(
                { UserId: userId, DeckId: deckId },
                { 
                    $set: { 
                        Title: title,
                    } 
                },
                { new: true }  // Return the updated document
            );
    
            if (!updatedDeck) {
                error = "Note not found or you don't have permission to edit it";
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
        var ret = { deckId: deckId, error: error, jwtToken: refreshedToken };
        res.status(200).json(ret);
    });

    // Delete
    app.post('/api/delete_flashcard_deck', async (req, res, next) => 
    {
        // incoming: userId deckId jwtToken
        // outgoing: error
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

        // Delete the deck
        var error = "";
        try 
        {
            await FlashCardDecks.findOneAndDelete({ UserId: userId, DeckId: deckId });
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

        // Return
        res.status(200).json({ error: error, jwtToken: refreshedToken });
    });
}