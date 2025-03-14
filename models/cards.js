const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Create Schema
const CardSchema = new Schema({
    UserId: {
        type: Number
    },
    Card: {
        type: String,
    }
});
module.exports = cards = mongoose.model("Cards", CardSchema, "Cards");