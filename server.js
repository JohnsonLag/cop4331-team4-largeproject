// REMEMBER: You must add an .env file with the MongoDB
//           connection string to this directory to be able to access the database
require('dotenv').config();

// To use MongoDB ObjectId
const { ObjectId } = require('mongodb');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const url = process.env.MONGODB_URI;
const mongoose = require("mongoose");
mongoose.connect(url).then(() => console.log("Mongo DB connected")).catch(err => console.log(err));
client.connect();

var card_api = require('./card_api.js');
card_api.setApp(app, mongoose);
var user_api = require('./user_api.js');
user_api.setApp(app, mongoose);

/* UTIL FUNCTIONS */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
    return emailRegex.test(email);
}

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
        console.log(results[i]);
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





app.use((req, res, next) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.listen(5000); // start Node + Express server on port 5000
