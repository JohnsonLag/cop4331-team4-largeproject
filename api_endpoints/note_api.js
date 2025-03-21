require('express');
require('mongodb');

var token = require('../utils/JWTUtils.js');
const getNextId = require("../utils/idGenerator.js");

// Notes model
const Notes = require("../models/notes.js");

exports.setApp = function ( app, client )
{
    // Create
    app.post('/api/create_note', async (req, res, next) =>
    {
        // incoming: userId, title, jwtToken
        // outgoing: noteId, error, jwtToken
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
            error = e.toString();
            console.log(e.message);
        }

        // Add a new note document
        const notesId = await getNextId( "notesId" );
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
            error = e.toString();
        }

        // Return
        var ret = { notesId: notesId, error: error, jwtToken: refreshedToken };
        res.status(200).json(ret);
    });

    // Search notes
    app.post('/api/search_notes/', async (req, res, next) =>
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

        // Retrieve notes using the search query
        var _ret = [];
        try
        {
            var _search = search.trim();

            const results = await Notes.find({
                "UserId": userId, 
                "Title": { $regex: _search + '.*', $options: 'i' }
            });

            for ( var i = 0; i < results.length; i++ )
            {
                _ret.push([results[i].Title, results[i].Body.length])
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

    // Get single note 
    app.post('/api/note/:id', async (req, res, next) =>
    {
        // incoming: userId noteId jwtToken
        // outgoing: error
        const userId = req.body.userId;
        const jwtToken = req.body.jwtToken;
        const noteId = req.params.id;

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

        // Get the note
        var error = "";
        var note = null;
        try
        {
            note = await Notes.findOne({ UserId: userId, NoteId: noteId });
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

        // If the query returned a valid note...
        if (note)
        {
            var ret = { 
                userId: note.UserId, 
                noteId: note.NoteId, 
                title: note.Title,
                body: note.Body,
                error: error, 
                jwtToken: refreshedToken 
            };
            res.status(200).json(ret);
        }
        else
        {
            var ret = { 
                userId: null,
                noteId: null, 
                title: null,
                body: null,
                error: error, 
                jwtToken: refreshedToken 
            };
            res.status(200).json(ret);
        }
    });
}