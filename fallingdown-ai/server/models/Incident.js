const mongoose = require('mongoose');

const incidentSchema = mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  movement_status: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  image_filename: {
    type: String,
  },
  is_critical: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Incident', incidentSchema);
