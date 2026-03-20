require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, '../client')));

// API routes
app.use('/api', authRoutes);

// Fallback to index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 OTP Auth server running at http://localhost:${PORT}`);
  console.log(`📧 DEV_MODE: ${process.env.DEV_MODE === 'true' ? 'ON (OTPs logged to console)' : 'OFF (real SMS/email)'}\n`);
});
