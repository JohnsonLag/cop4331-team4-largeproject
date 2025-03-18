require('express');
require('mongodb');

var JWTUtils = require('../JWTUtils.js');

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
            res.status(200).json(ret);
            return;
        }

        // Check if existing user
        // ... If username/login OR email exists
        const results = await Users.find({
            $or: [
                { Login: login },
                { Email: email },
            ]
        });

        if (results.length > 0) {
            console.log("HAD AADB BAD");
            error = 'Username or email address already exists';
            const ret = { id: -1, firstName: '', lastName: '', error: error };
            res.status(200).json(ret);
            return;
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
                Email: email,
                RequiresVerification: true,
                ResettingPassword: false,
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

        var token = null;
        var error = null;
        
        if ( results.length > 0 )
        {
            id = results[0].UserId;
            fn = results[0].FirstName;
            ln = results[0].LastName;

            try
            {
                token = JWTUtils.createToken( fn, ln, id );

            }
            catch (e)
            {
                error = e.message;
            }
        }
        else
        {
            error = "Login/Password incorrect";
        }

        const ret = { token: token, error: error };
        res.status(200).json(ret);
    });
}