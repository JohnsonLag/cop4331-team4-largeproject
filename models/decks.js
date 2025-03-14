const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//Create Schema
const DecksSchema = new Schema({
    UserId: {
        type: Number
    },
    Name: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
});
module.exports = users = mongoose.model("Decks", UserSchema, "Decks");