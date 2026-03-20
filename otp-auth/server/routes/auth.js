const express = require('express');
const crypto = require('crypto');
const { saveOTP, getOTP, deleteOTP, generateOTP } = require('../otpStore');
const { sendEmailOTP } = require('../emailService');
const { sendSmsOTP } = require('../smsService');

const router = express.Router();

// Detect if contact is email or phone
function isEmail(contact) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
}

function isPhone(contact) {
  return /^\+?[1-9]\d{7,14}$/.test(contact);
}

// POST /api/send-otp
router.post('/send-otp', async (req, res) => {
  const { contact } = req.body;

  if (!contact) {
    return res.status(400).json({ success: false, message: 'Contact is required' });
  }

  const normalized = contact.trim().toLowerCase();

  if (!isEmail(normalized) && !isPhone(contact.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address or phone number (E.164 format, e.g. +919876543210)',
    });
  }

  try {
    const otp = generateOTP();
    saveOTP(normalized, otp);

    if (isEmail(normalized)) {
      await sendEmailOTP(normalized, otp);
    } else {
      await sendSmsOTP(contact.trim(), otp);
    }

    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending OTP:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// POST /api/verify-otp
router.post('/verify-otp', (req, res) => {
  const { contact, otp } = req.body;

  if (!contact || !otp) {
    return res.status(400).json({ success: false, message: 'Contact and OTP are required' });
  }

  const normalized = contact.trim().toLowerCase();
  const stored = getOTP(normalized);

  // No OTP found
  if (!stored) {
    return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
  }

  // OTP expired
  if (Date.now() > stored.expiresAt) {
    deleteOTP(normalized);
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  // OTP mismatch
  if (stored.otp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
  }

  // Success — delete OTP and return session token
  deleteOTP(normalized);
  const token = crypto.randomBytes(32).toString('hex');

  return res.json({
    success: true,
    token,
    message: 'OTP verified successfully',
  });
});

module.exports = router;
