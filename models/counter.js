const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Identifier for the counter (e.g., "userId")
  sequence_value: { type: Number, default: 0 }, // Current value of the counter
});

module.exports = counter = mongoose.model("Counter", CounterSchema, "Counter");