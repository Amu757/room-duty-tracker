const { Schema, model } = require('mongoose');

// One record per (date, duty).
// s: done | miss | cover | skip
// a: assigned person   b: person who covered   z: settled / paid
const schema = new Schema({
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  duty: { type: Number, required: true, min: 0, max: 5 },
  s: { type: String, required: true, enum: ['done', 'miss', 'cover', 'skip'] },
  a: { type: String, required: true },
  b: { type: String, default: '' },
  z: { type: Boolean, default: false },
}, { timestamps: true });

schema.index({ date: 1, duty: 1 }, { unique: true });
module.exports = model('Log', schema);
