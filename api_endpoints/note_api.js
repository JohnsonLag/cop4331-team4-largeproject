require('express');
require('mongodb');

var token = require('../createJWT.js');

// Notes model
const Cards = require("../models/notes.js");

exports.setApp = function ( app, client )
{
    /* NOTES */
    // Create
    app.post('/api/addnote', async (req, res, next) =>
    {
        // incoming: userId, title
        // outgoing: error
        const { userId, title } = req.body;
    
        // Initiate db
        const db = client.db('MERNSTACK');
    
        // Check if a note with the same title already exists
        let existingNote = await db.collection('Notes').findOne({ Title: title });
        if (existingNote)
        {
            error = 'Notes name already exists already exists';
            const ret = { id: -1, error: error };
            return res.status(409).json(ret);
        }
    
        const newNote = {
            Title: title,
            UserId: new ObjectId(userId)};
        var error = '';
    
        try
        {
            const result = db.collection('Notes').insertOne(newNote);
        }
        catch(e)
        {
            error = e.toString();
        }
    
        var ret = { error: error };
        res.status(200).json(ret);
    });
    
    // Retrieve
    app.post('/api/searchnotes', async (req, res, next) =>
    {
        // incoming: userId, search
        // outgoing: results[], error
        var error = '';
        const { userId, search } = req.body;
        var _search = search.trim();
        const db = client.db('MERNSTACK');
        // NOTE: Right now, the search function bases the search
        //  on the titles of the Notes
        //  We could potentially change this in the future to also search the body
        //  of the text
        const results = await db.collection('Notes').find({
            UserId: new ObjectId(userId),
            Title: { $regex: _search + '.*', $options: 'i' },
        }).toArray();
    
        var _ret = [];
        for( var i=0; i < results.length; i++ )
        {
            _ret.push(results[i]);
        }
    
        var ret = {results: _ret , error: error};
        res.status(200).json(ret);
    });
    
    // Update
    
    // Delete
    app.post('/api/deletenote', async (req, res, next) =>
    {
        // incoming: ObjectId
        const { id } = req.body;
        let error = '';
    
        try {
            // Initiate db
            const db = client.db('MERNSTACK');
    
            // Delete note with matching ObjectId
            let result = await db.collection('Notes').deleteOne({
                _id: new ObjectId(id),
            });
    
            // If no document was deleted
            if (result.deletedCount == 0) {
                error = 'Note not found';
            }
        } catch (e) {
            error = e.toString();
        }
    
        var ret = { error: error };
        res.status(200).json(ret);
    });
}