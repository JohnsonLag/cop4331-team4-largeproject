require('express');
require('mongodb');

var token = require('../JWTUtils.js');

// Users model
const Users = require("../models/users.js");

// UserId generator
const getNextUserId = require("../userIdGenerator.js");

/* UTIL FUNCTIONS */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
    return emailRegex.test(email);
}


exports.setApp = function ( app, client )
{
    /* USERS */
    // Create
    app.post('/api/signup', async (req, res, next) => {
        // incoming: login, password, firstName, lastName, email
        // outoing: id, firstName, lastName, error

        let error = '';

        const { login, password, firstName, lastName, email } = req.body;

        // Check validity of email using regex
        if (!isValidEmail(email)){
            error = 'Invalid email! please use format: user@email.com'
            const ret = { id: -1, firstName: '', lastName: '', error: error};
            return res.status(409).json(ret);
        }

        // Check if existing user
        const results = await Users.find({ Login: login });

        if (results.length > 0) {
            error = 'Username already exists';
            const ret = { id: -1, firstName: '', lastName: '', error: error };
            return res.status(409).json(ret);
        }

        // Insert new user
        var userId = null;
        try {
            // Generate new userId
            userId = await getNextUserId();

            const newUser = new Users({
                UserId: userId,
                Login: login,
                Password: password,
                FirstName: firstName,
                LastName: lastName,
                Email: email
            });

            newUser.save();
        } catch (e) {
            error = e.toString();
        }

        const ret = { userId: userId, firstName: firstName, lastName: lastName, error: error };
        res.status(200).json(ret);
    });

    // Retrieve
    app.post('/api/login', async (req, res, next) =>
    {
        // incoming: login, password
        // outgoing: id, firstName, lastName, error

        var error = '';

        const { login, password } = req.body;

        const results = await Users.find({ Login: login, Password: password});

        var id = -1;
        var fn = '';
        var ln = '';

        var ret = null;
        
        if ( results.length > 0 )
        {
            id = results[0].UserId;
            fn = results[0].FirstName;
            ln = results[0].LastName;

            try
            {
                ret = token.createToken( fn, ln, id );
            }
            catch (e)
            {
                ret = { error: e.message };
            }
        }
        else
        {
            ret = { error: "Login/Password incorrect"};
        }

        res.status(200).json(ret);
    });
}