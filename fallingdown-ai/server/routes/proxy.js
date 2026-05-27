const express = require('express');
const axios = require('axios');
const router = express.Router();
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const ML_BASE = 'http://localhost:5000';

router.get('/status', async (req, res) => {
  try {
    const response = await axios.get(`${ML_BASE}/api/status`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ error: 'ML Backend Offline' });
  }
});

router.post('/incident', async (req, res) => {
  try {
    const response = await axios.post(`${ML_BASE}/api/incident`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // In a real scenario, we'd forward the file properly using FormData
    res.json({ message: 'Gateway proxy upload currently simulated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const response = await axios.get(`${ML_BASE}/api/logs`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ error: 'ML Backend Offline' });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const response = await axios.post(`${ML_BASE}/api/chat`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/incident/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${ML_BASE}/api/incident/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/incident/:id/image', async (req, res) => {
  try {
    const response = await axios.delete(`${ML_BASE}/api/incident/${req.params.id}/image`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
