// In-memory OTP store using a Map
// Each entry: contact -> { otp, expiresAt }
const store = new Map();

// OTP expiry: 5 minutes
const OTP_TTL_MS = 5 * 60 * 1000;

function saveOTP(contact, otp) {
  store.set(contact, {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
}

function getOTP(contact) {
  return store.get(contact) || null;
}

function deleteOTP(contact) {
  store.delete(contact);
}

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { saveOTP, getOTP, deleteOTP, generateOTP };
