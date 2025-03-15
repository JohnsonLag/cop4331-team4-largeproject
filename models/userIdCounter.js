const mongoose = require('mongoose');

const UserIdCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Identifier for the counter (e.g., "userId")
  sequence_value: { type: Number, default: 0 }, // Current value of the counter
});

module.exports = userIdCounter = mongoose.model("UserIdCounter", UserIdCounterSchema, "UserIdCounter");