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

// API Endpoints
var user_api = require('./api_endpoints/user_api.js');
user_api.setApp(app, mongoose);

var verification_api = require('./api_endpoints/verification_api.js');
verification_api.setApp(app, mongoose);

var notes_api = require('./api_endpoints/note_api.js');
notes_api.setApp(app, mongoose);

var decks_api = require('./api_endpoints/flashcarddeck_api.js');
decks_api.setApp(app, mongoose);

var flashcards_api = require('./api_endpoints/flashcard_api.js');
flashcards_api.setApp(app, mongoose);

var llm_integration_api = require('./api_endpoints/llm_integration_api.js');
llm_integration_api.setApp(app, mongoose);

var password_reset_api = require('./api_endpoints/password_reset_api.js');
password_reset_api.setApp(app, mongoose);


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

if (process.env.NODE_ENV !== 'test') {
    app.listen(5000); // start Node + Express server on port 5000
}

module.exports = app;