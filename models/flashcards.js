const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//Create Schema
const FlashCardsSchema = new Schema({
    UserId: {
        type: Number
    },
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
module.exports = users = mongoose.model("FlashCards", UserSchema, "FlashCards");