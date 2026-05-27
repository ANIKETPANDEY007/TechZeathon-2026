const mongoose = require('mongoose');

const leadSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  facilityName: {
    type: String,
  },
  numberOfBeds: {
    type: String,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Lead', leadSchema);
