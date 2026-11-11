const { Schema, model } = require('mongoose');

// One single document (key = "main") holding the weekly duty chart:
// grid[dayIndex 0=Mon..6=Sun][dutyIndex 0..5] = person name
module.exports = model('Chart', new Schema({
  key: { type: String, default: 'main', unique: true },
  grid: { type: [[String]], required: true },
}));
