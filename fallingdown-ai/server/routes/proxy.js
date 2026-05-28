const express = require('express');
const axios = require('axios');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { Blob } = require('buffer');

const upload = multer({ dest: 'uploads/' });

const ML_BASE = 'http://localhost:5000';

// Helper to get headers with X-API-Key
const getHeaders = () => {
  return {
    'X-API-Key': process.env.API_KEY || ''
  };
};

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
    const response = await axios.post(`${ML_BASE}/api/incident`, req.body, {
      headers: getHeaders()
    });
    res.json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const msg = error.response && error.response.data ? error.response.data.error : error.message;
    res.status(status).json({ error: msg });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the uploaded file into a buffer and wrap it in a Blob
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileBlob = new Blob([fileBuffer], { type: req.file.mimetype });

    const formData = new FormData();
    formData.append('file', fileBlob, req.file.originalname);

    const response = await axios.post(`${ML_BASE}/api/upload`, formData, {
      headers: {
        ...getHeaders()
      }
    });

    // Clean up temporary local file
    fs.unlinkSync(req.file.path);

    res.json(response.data);
  } catch (error) {
    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }
    }
    const status = error.response ? error.response.status : 500;
    const msg = error.response && error.response.data ? error.response.data.error : error.message;
    res.status(status).json({ error: msg });
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
    const response = await axios.delete(`${ML_BASE}/api/incident/${req.params.id}`, {
      headers: getHeaders()
    });
    res.json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const msg = error.response && error.response.data ? error.response.data.error : error.message;
    res.status(status).json({ error: msg });
  }
});

router.delete('/incident/:id/image', async (req, res) => {
  try {
    const response = await axios.delete(`${ML_BASE}/api/incident/${req.params.id}/image`, {
      headers: getHeaders()
    });
    res.json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const msg = error.response && error.response.data ? error.response.data.error : error.message;
    res.status(status).json({ error: msg });
  }
});

module.exports = router;
