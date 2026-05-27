const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, passcode, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      passcode,
      role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPasscode: !!user.passcode,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Authenticate user & get token (Standard Login)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPasscode: !!user.passcode,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Authenticate user & get token (Passcode Login)
// @route   POST /api/auth/login-passcode
// @access  Public
router.post('/login-passcode', async (req, res) => {
  const { email, passcode } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.passcode) {
      return res.status(400).json({ error: 'Quick Passcode not set up for this account' });
    }

    if (await user.matchPasscode(passcode)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPasscode: true,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: 'Invalid passcode PIN' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    SSO Mock authentication (Google / Microsoft)
// @route   POST /api/auth/sso
// @access  Public
router.post('/sso', async (req, res) => {
  const { provider, email, name } = req.body;

  try {
    if (!email || !name) {
      return res.status(400).json({ error: 'SSO request missing name or email' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create user with a dummy password and role caregiver
      // In a real SSO, this user is authenticated by the provider (e.g. Google)
      const dummyPassword = Math.random().toString(36).substring(2, 15);
      user = await User.create({
        name,
        email,
        password: dummyPassword,
        role: 'caregiver'
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasPasscode: !!user.passcode,
      token: generateToken(user._id),
      ssoProvider: provider
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// @desc    Get all users (for SSO chooser)
// @route   GET /api/auth/users
// @access  Public
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
