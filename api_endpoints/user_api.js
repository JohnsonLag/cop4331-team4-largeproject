require('express');
require('mongodb');

var JWTUtils = require('../utils/JWTUtils.js');

// Users model
const Users = require("../models/users.js");

// UserId generator
const getNextId = require("../utils/idGenerator.js");
const { sendVerificationEmail } = require('../utils/sendEmail.js');

// Email & password validator
const validator = require("../utils/validateRegex.js");


exports.setApp = function ( app, client )
{
    /* USERS */
    // Create
    app.post('/api/signup', async (req, res, next) => {
        // incoming: login, password, firstName, lastName, email
        // outoing: id, firstName, lastName, error

        var error = '';

        const { login, password, firstName, lastName, email } = req.body;

        // Check validity of email using regex
        if (!validator.isValidEmail(email)) {
            error = 'Invalid email! Please use format: user@email.com'
            const ret = { id: -1, firstName: '', lastName: '', error: error };
            res.status(200).json(ret);
            return;
        }

        // Check validity of password using regex
        if (!validator.isValidPassword(password)) {
            error = 'Invalid password! Please include at least eight characters, ' +
                'at least one letter, and at least one number.';
            const ret = { id: -1, firstName: '', lastName: '', error: error };
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
            error = 'Username or email address already exists';
            const ret = { id: -1, firstName: '', lastName: '', error: error };
            res.status(200).json(ret);
            return;
        }

        // Insert new user
        var userId = -1;
        try {
            // Generate new userId
            userId = await getNextId( "userId" );

            // Generate new token for verification
            const verificationToken = JWTUtils.createVerificationToken(userId);

            // If creating verification token failed
            if (error in verificationToken)
            {
                console.log("ERROR: Could not generate verification code for user sign up!");
                const ret = { userId: -1, firstName: "", lastName: "", error: verificationToken.error }
                res.status(200).json(ret);
            }

            // Create new user
            const newUser = new Users({
                UserId: userId,
                Login: login,
                Password: password,
                FirstName: firstName,
                LastName: lastName,
                Email: email,
                Verified: false,
                VerificationToken: verificationToken.accessToken
            });
            newUser.save();

            // Send the verification email
            await sendVerificationEmail(email, verificationToken.accessToken);

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

        var token = null;
        var error = '';

        const { login, password } = req.body;

        const results = await Users.find({ Login: login, Password: password});

        var id = -1;
        var fn = '';
        var ln = '';
        
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
                error = e.toString();
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