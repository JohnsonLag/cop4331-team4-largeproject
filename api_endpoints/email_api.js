require('express');
require('mongodb');

var JWTUtils = require('../JWTUtils.js');

// Users model
const Users = require("../models/users.js");

exports.setApp = function ( app, client )
{
    app.post('/api/sendVerificationEmail', async (req, res, next) => {
        // incoming: email, userId

        // Find user in collection

        // Check if they need email verification

        // TODO

        let error = '';

    });
}