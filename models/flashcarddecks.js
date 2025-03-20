const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//Create Schema
const FlashCardDeckSchema = new Schema({
    UserId: {
        type: Number,
        required: true
    },
    DeckId: {
        type: Number,
        required: true
    },
    Title: {
        type: String,
        required: true
    },
    NumCards: {
        type: Number,
        required: true
    },
});
module.exports = notes = mongoose.model("FlashCardDecks", FlashCardSchema, "FlashCardDecks");