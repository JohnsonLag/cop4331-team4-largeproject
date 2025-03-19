const Counter = require('../models/counter');

async function getNextUserId() {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'userId' }, // Identifier for the counter
    { $inc: { sequence_value: 1 } }, // Increment the sequence_value by 1
    { new: true, upsert: true } // Create the document if it doesn't exist
  );
  return counter.sequence_value;
}

module.exports = getNextUserId;