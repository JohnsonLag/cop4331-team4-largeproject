require('express');
require('mongodb');

var token = require('../utils/JWTUtils.js');
const getNextNotesId = require("../utils/notesIdGenerator.js");

// Notes model
const Notes = require("../models/notes.js");

exports.setApp = function ( app, client )
{
    // Create
    app.post('/api/create_note', async (req, res, next) =>
    {
        // incoming: userId, title, jwtToken
        // outgoing: error
        const { userId, title, body, jwtToken } = req.body;

        // Check Json Web Token
        try
        {
            if ( token.isExpired(jwtToken))
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

        // Add a new note document
        const notesId = await getNextNotesId();
        var _body = [];
        _body.push(body);

        const newNote = new Notes({ 
            UserId: userId, 
            NoteId: notesId,
            Title: title, 
            Body: _body 
        });
        
        var error = '';
        try
        {
            newNote.save();
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
            errror = e;
        }

        // Return
        var ret = { error: error, jwtToken: refreshedToken };
        res.status(200).json(ret);
    });

    // Get single note 
    app.post('/api/note/:id', async (req, res, next) =>
    {
        // incoming: userId noteId jwtToken
        // outgoing: error
        const userId = req.body.userId;
        const jwtToken = req.body.jwtToken;
        const noteId = req.params.id;

        console.log(userId);
        console.log(jwtToken);
        console.log(noteId);
    });
}