require('express');
require('mongodb');

var token = require('./createJWT.js');

// Users model
const Users = require("./models/users.js");

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
        const db = client.db('MERNSTACK');
        const results = await db.collection('Users').find({ Login: login }).toArray();

        if (results.length > 0) {
            error = 'Username already exists';
            const ret = { id: -1, firstName: '', lastName: '', error: error };
            return res.status(409).json(ret);
        }

        // Insert new user
        const newUser = {
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

        const ret = { firstName: firstName, lastName: lastName, error: error };
        res.status(200).json(ret);
    });

    // Retrieve
    app.post('/api/login', async (req, res, next) =>
    {
        // incoming: login, password
        // outgoing: id, firstName, lastName, error

        var error = '';

        const { login, password } = req.body;

        console.log(req.body);

        console.log(login);
        console.log(password);

        const results = await Users.find({ Login: login, Password: password});
        console.log(results);

        var id = -1;
        var fn = '';
        var ln = '';

        var ret;
        
        if ( results.length > 0 )
        {
            id = results[0].UserId;
            fn = results[0].FirstName;
            ln = results[0].LastName;

            try
            {
                const token = require("./createJWT.js");
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

        // var ret = { id:id, firstName:fn, lastName:ln, error:''};
        res.status(200).json(ret);
    });
}