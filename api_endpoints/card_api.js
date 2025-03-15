require('express');
require('mongodb');

var token = require('../JWTUtils.js');

// Cards model
const Cards = require("../models/cards.js");

exports.setApp = function ( app, client )
{
    app.post('/api/addcard', async (req, res, next) =>
    {
        // incoming: userId, color, jwtToken
        // outgoing: error
        const { userId, card, jwtToken } = req.body;

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

        // Add a new card
        const newCard = new Cards({ Card: card, UserId: userId });
        var error = '';
        try
        {
            // const db = client.db();
            // const result = db.collection('Cards').insertOne(newCard);
            newCard.save();
        }
        catch(e)
        {
            error = e.toString();   
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

        var ret = { error: error, jwtToken: refreshedToken };
        res.status(200).json(ret);
    });

    app.post('/api/searchcards', async (req, res, next) =>
    {
        // incoming: userId, jwtToken
        // outgoing: results[], error
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
            console.log(e.message);
        }

        // Retrieve cards using search query
        var _ret = [];
        try
        {
            var _search = search.trim();
    
            const results = await Cards.find({"UserId": userId ,"Card": { $regex: _search + '.*', $options: 'i' } });

            for( var i=0; i < results.length; i++ )
            {
                _ret.push( results[i].Card );
            }
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

        var ret = { results: _ret, error: error, jwtToken: refreshedToken };

        res.status(200).json(ret);
    });
}