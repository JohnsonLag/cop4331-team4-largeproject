require('express');
require('mongodb');

var token = require('../utils/JWTUtils.js');

// Notes model
const Notes = require("../models/notes.js");

exports.setApp = function ( app, client )
{
    // Create
    app.post('/api/addnote', async (req, res, next) =>
    {
        // incoming: userId, title, jwtToken
        // outgoing: error
        const { userId, title, jwtToken } = req.body;

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
        const newNote = new Notes({ UserId: userId, Title: title, Body: [] });
        
    });
    
    // Retrieve
    app.post('/api/searchnotes', async (req, res, next) =>
    {
        
    });
    
    // Change line of note

    // Delete line from note
    
    // Delete Note
    app.post('/api/deletenote', async (req, res, next) =>
    {

    });
}