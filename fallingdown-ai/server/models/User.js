const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  passcode: {
    type: String, // Hashed 4-digit PIN for quick access
  },
  role: {
    type: String,
    required: true,
    enum: ['family', 'caregiver', 'administrator'],
    default: 'caregiver',
  }
}, {
  timestamps: true,
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Compare passcode
userSchema.methods.matchPasscode = async function (enteredPasscode) {
  if (!this.passcode) return false;
  return await bcrypt.compare(enteredPasscode, this.passcode);
};

// Hash password and passcode before saving
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isModified('passcode') && this.passcode) {
    const salt = await bcrypt.genSalt(10);
    this.passcode = await bcrypt.hash(this.passcode, salt);
  }
});

module.exports = mongoose.model('User', userSchema);
