const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// @route   POST /api/leads
// @desc    Register a new lead
// @access  Public
router.post('/', async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    const savedLead = await newLead.save();
    res.status(201).json(savedLead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/leads
// @desc    Get all leads
// @access  Public (Should be private in production)
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
