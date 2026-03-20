/**
 * Send OTP via SMS using Twilio.
 * In DEV_MODE, just logs the OTP to console.
 */
async function sendSmsOTP(phone, otp) {
  if (process.env.DEV_MODE === 'true') {
    console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
    return;
  }

  const twilio = require('twilio');
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: `Your OTP is: ${otp}. It expires in 5 minutes. Do not share it with anyone.`,
    from: process.env.TWILIO_FROM_NUMBER,
    to: phone,
  });
}

module.exports = { sendSmsOTP };
