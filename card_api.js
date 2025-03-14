require('express');
require('mongodb');

var token = require('./createJWT.js');

// Cards model
const Card = require("./models/card.js");

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

        // const newCard = {Card:card,UserId:userId};
        const newCard = new Card({ Card: card, UserId: userId });

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

        var _search = search.trim();
        const db = client.db();
        const results = await db.collection('Cards').find({"Card":{$regex:_search+'.*',
            $options:'r'}}).toArray();
        var _ret = [];

        for( var i=0; i<results.length; i++ )
        {
            _ret.push( results[i].Card );
        }

        var refreshedToken = null;
        try
        {
            refreshedToken = token.refresh(jwtToken);
        }
        catch(e)
        {
            console.log(e.message);
        }

        var ret = { results:_ret, error: error, jwtToken: refreshedToken };
        res.status(200).json(ret);
    });
}