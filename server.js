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
var card_api = require('./api_endpoints/card_api.js');
card_api.setApp(app, mongoose);

var user_api = require('./api_endpoints/user_api.js');
user_api.setApp(app, mongoose);

var verification_api = require('./api_endpoints/verification_api.js');
verification_api.setApp(app, mongoose);


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
