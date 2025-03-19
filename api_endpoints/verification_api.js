require('express');
require('mongodb');

const jwt = require("jsonwebtoken");

var JWTUtils = require('../utils/JWTUtils.js');

// Users model
const Users = require("../models/users.js");

exports.setApp = function ( app, client )
{
    app.get('/api/verify_email', async (req, res, next) => {
        // incoming (from req.query, meaning the link): token
        const { token } = req.query;

        try
        {
            // Decode token 
            const decoded_token = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            // Get corresponding user
            const user = await Users.findOne({ UserId: decoded_token.userId })

            // If invalid user
            if (!user)
            {
                return res.status(400).json({ message: "Invalid verification code"});
            }

            // Otherwise, verify user
            user.Verified = true;
            user.VerificationToken = undefined;
            await user.save();
            res.redirect("http://coolestappever.xyz/")
        }
        catch (e)
        {
            res.status(500).json({ error: e.message });
        }
    });
}