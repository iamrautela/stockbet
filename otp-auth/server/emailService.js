const nodemailer = require('nodemailer');

/**
 * Send OTP via email using Nodemailer SMTP.
 * In DEV_MODE, just logs the OTP to console.
 */
async function sendEmailOTP(email, otp) {
  if (process.env.DEV_MODE === 'true') {
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"StockBet Auth" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #1a1a1a; margin-bottom: 8px;">Your OTP Code</h2>
        <p style="color: #555; margin-bottom: 24px;">Use the code below to verify your identity. It expires in <strong>5 minutes</strong>.</p>
        <div style="background: #fff; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; text-align: center;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #10b981;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 16px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendEmailOTP };
