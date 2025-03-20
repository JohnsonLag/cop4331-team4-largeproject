require('express');
require('mongodb');

var token = require('../utils/JWTUtils.js');
const getNextDeckId = require("../utils/deckIdGenerator.js");

// FlashCardDecks model
const FlashCardDecks = require("../models/flashcarddecks.js");

exports.setApp = function ( app, client )
{
    // Create
    app.post('/api/create_flashcard_deck', async (req, res, next) =>
    {
        // incoming: userId, jwtToken
        // outgoing: error
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
        const deckId = await getNextDeckId();

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
        var ret = { error: error, jwtToken: refreshedToken };
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
                _ret.push([results[i].Title, results[i].NumCards]);
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