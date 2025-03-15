const UserIdCounter = require('./models/userIdCounter');

async function getNextUserId() {
  const counter = await UserIdCounter.findOneAndUpdate(
    { _id: 'userId' }, // Identifier for the counter
    { $inc: { sequence_value: 1 } }, // Increment the sequence_value by 1
    { new: true, upsert: true } // Create the document if it doesn't exist
  );
  return counter.sequence_value;
}

module.exports = getNextUserId;