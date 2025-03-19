const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//Create Schema
const NoteSchema = new Schema({
    UserId: {
        type: Number,
        required: true
    },
    NoteId: {
        type: Number,
        required: true
    },
    Title: {
        type: String,
        required: true
    },
    Body: {
        type: [String],
        required: true
    },
});
module.exports = users = mongoose.model("Notes", UserSchema, "Notes");