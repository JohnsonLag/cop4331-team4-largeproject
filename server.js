require('dotenv').config();
const url = process.env.MONGODB_URI;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url);
client.connect();


app.post('/api/addcard', async (req, res, next) =>
{
    // incoming: userId, color
    // outgoing: error
    const { userId, card } = req.body;
    const newCard = {Card:card,UserId:userId};
    var error = '';

    try
    {
        const db = client.db('MERNSTACK');
        const result = db.collection('Cards').insertOne(newCard);
    }
    catch(e)
    {
        error = e.toString();
    }

    var ret = { error: error };
    res.status(200).json(ret);
});

app.post('/api/login', async (req, res, next) =>
{
    // incoming: login, password
    // outgoing: id, firstName, lastName, error

    var error = '';

    const { login, password } = req.body;
    
    const db = client.db('MERNSTACK');

    const results = await db.collection('Users').find({Login:login,Password:password}).toArray();

    var id = -1;
    var fn = '';
    var ln = '';
    
    if( results.length > 0 )
    {
        id = results[0].UserId;
        fn = results[0].FirstName;
        ln = results[0].LastName;
    }

    var ret = { id:id, firstName:fn, lastName:ln, error:''};
    res.status(200).json(ret);
});

app.post('/api/signup', async (req, res, next) => {
    // incoming: login, password, firstName, lastName
    // outoing: id, firstName, lastName, error

    let error = '';

    const { login, password, firstName, lastName } = req.body;

    const db = client.db('MERNSTACK');

    const results = await db.collection('Users').find({ Login: login }).toArray();

    if (results.length > 0) {
        error = 'Username already exists';
        const ret = { id: -1, firstName: '', lastName: '', error: error };
        return res.status(409).json(ret);
    }

    let newUserId = 1;
    const lastUserArr = await db.collection('Users').find({}).sort({ UserId: -1 }).limit(1).toArray();
    if (lastUserArr.length > 0) {
        newUserId = lastUserArr[0].UserId + 1;
    }

    const newUser = {
        UserId: newUserId,
        Login: login,
        Password: password,
        FirstName: firstName,
        LastName: lastName
    };

    try {
        await db.collection('Users').insertOne(newUser);
    } catch (e) {
        error = e.toString();
    }

    const ret = { id: newUserId, firstName: firstName, lastName: lastName, error: error };
    res.status(200).json(ret);
});


app.post('/api/searchcards', async (req, res, next) =>
{
    // incoming: userId, search
    // outgoing: results[], error
    var error = '';
    const { userId, search } = req.body;
    var _search = search.trim();
    const db = client.db('MERNSTACK');
    const results = await db.collection('Cards').find({"Card":{$regex:_search+'.*', $options:'i'}}).toArray();

    var _ret = [];
    for( var i=0; i<results.length; i++ )
    {
        _ret.push( results[i].Card );
    }

    var ret = {results:_ret, error:error};
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
