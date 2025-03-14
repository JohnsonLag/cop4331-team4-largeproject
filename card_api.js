require('express');
require('mongodb');

exports.setApp = function ( app, client )
{
    app.post('/api/addcard', async (req, res, next) =>
    {
        // incoming: userId, color
        // outgoing: error
        const { userId, card } = req.body;
        const newCard = {Card:card,UserId:userId};
        var error = '';
        try
        {
            const db = client.db();
            const result = db.collection('Cards').insertOne(newCard);
        }
        catch(e)
        {
            error = e.toString();
        }
        var ret = { error: error };
        res.status(200).json(ret);
    });

    app.post('/api/searchcards', async (req, res, next) =>
    {
        // incoming: userId, search
        // outgoing: results[], error
        var error = '';
        const { userId, search } = req.body;
        var _search = search.trim();
        const db = client.db();
        const results = await
        db.collection('Cards').find({"Card":{$regex:_search+'.*',
        $options:'r'}}).toArray();
        var _ret = [];
        for( var i=0; i<results.length; i++ )
        {
            _ret.push( results[i].Card );
        }
        var ret = {results:_ret, error:error};
        res.status(200).json(ret);
    });
}