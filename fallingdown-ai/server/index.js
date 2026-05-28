require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const proxyRoutes = require('./routes/proxy');
const leadRoutes = require('./routes/leads');
const authRoutes = require('./routes/auth');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use('/api', proxyRoutes); // Proxy ML routes
app.use('/api/leads', leadRoutes); // Native MongoDB routes
app.use('/api/auth', authRoutes); // Auth routes

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Gateway Server running on port ${PORT}`);
});
