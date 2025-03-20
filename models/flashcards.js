const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create Schema
const FlashCardSchema = new Schema({
    UserId: {
        type: Number,
        required: true
    },
    CardId: {
        type: Number,
        required: true
    },
    DeckId: {
        type: Number,
        required: true
    },
    Question: {
        type: String,
        required: true
    },
    Answer: {
        type: [String],
        required: true
    },
});
module.exports = notes = mongoose.model("FlashCards", FlashCardSchema, "FlashCards");