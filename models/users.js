const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//Create Schema
const UserSchema = new Schema({
    UserId: {
        type: Number,
        unique: true,
        required: true,
    },
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    Login: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Verified: {
        type: Boolean,
        required: true
    },
    VerificationToken: {
        type: String,
        required: false
    },
    ResetPasswordToken: {
        type: String,
        required: false
    },
    ResetPasswordTokenExpires: {
        type: Date,
        required: false
    }
});
module.exports = users = mongoose.model("Users", UserSchema, "Users");