require('express');
require('mongodb');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const sgTransport = require('nodemailer-sendgrid-transport');
var JWTUtils = require('../utils/JWTUtils.js');
const pathGen = require('../utils/generatePath.js');

// Users model
const Users = require("../models/users.js");

// Use SendGrid 
const transporter = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

exports.setApp = function ( app, client )
{
    app.post('/api/forgot_password', async (req, res, next) => {
        try {
            const { email } = req.body;
            const user = await Users.findOne({ Email : email });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Generate temp. password reset token
            const token = crypto.randomBytes(20).toString('hex');

            // Set token and expiration date
            user.ResetPasswordToken = token;
            user.ResetPasswordTokenExpires = Date.now() + 3600000;
            user.save();

            // Create reset link
            const resetLink = pathGen.generateEmailPath(`reset-password?token=${token}`);

            console.log(resetLink)

            // Create email
            const mailOptions = {
                to: email,
                from: 'clarity-notesapp@outlook.com',
                subject: 'Clarity - Forgot Password',
                html: `<p>Please click the following link to reset your password:</p>
                       <a href="${resetLink}">Reset Password</a>`,
              };

            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: "Password reset email sent" });
        }
        catch (error) {
            res.status(500).json({ message: "Error sending email", error});
        }
    });

    app.post('/api/reset_password', async (req, res) => {
        try {
            const { token, email, newPassword } = req.body;

            const user = await Users.findOneAndUpdate(
                {
                    Email: email,
                    ResetPasswordToken: token,
                    ResetPasswordTokenExpires: { $gt: Date.now() }
                },
                { 
                    $set: {
                        Password: newPassword,
                        ResetPasswordToken: null,
                        ResetPasswordTokenExpires: null,
                    }
                },
                { new: true },
            );

            if (!user) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }


            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error resetting password', error });
        }
    });

    app.post("/api/verify_reset_token", async (req, res) => {
        const { token } = req.body;

        var error = '';
        var valid = false;

        try {
            const user = await Users.findOne({
                ResetPasswordToken: token,
                ResetPasswordTokenExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(200).json({ error: error, valid: false });
            }

            console.log(user.toString());
            res.status(200).json({ error: error, valid: true });
        } catch (err) {
            error = err;
            res.status(200).json({ error: err, valid: valid  });
        }
    });
}