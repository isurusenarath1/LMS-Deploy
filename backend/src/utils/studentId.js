const Counter = require('../models/Counter');

/**
 * Atomically increments and returns the next student sequence number.
 * Returns formatted ID like PPP0001
 */
async function generateStudentId() {
  // Use findOneAndUpdate with upsert to atomically increment
  const updated = await Counter.findOneAndUpdate(
    { name: 'studentId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = updated.seq || 1;
  const formatted = `PPP${String(seq).padStart(4, '0')}`;
  return formatted;
}

module.exports = {
  generateStudentId
};
