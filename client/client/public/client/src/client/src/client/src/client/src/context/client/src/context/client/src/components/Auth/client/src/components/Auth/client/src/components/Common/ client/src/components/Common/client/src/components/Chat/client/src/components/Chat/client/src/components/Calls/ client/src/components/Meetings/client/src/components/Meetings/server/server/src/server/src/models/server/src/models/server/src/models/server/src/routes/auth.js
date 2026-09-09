const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  
  try {
    const otp = generateOTP();
    otpStore.set(phoneNumber, { otp, expires: Date.now() + 5 * 60 * 1000 });
    
    await client.messages.create({
      body: `Your pChat verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phoneNumber, otp, isSignUp, name } = req.body;
  
  try {
    const stored = otpStore.get(phoneNumber);
    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    otpStore.delete(phoneNumber);
    
    if (isSignUp) {
      // Create new user
      const user = new User({
        phone: phoneNumber,
        name: name || 'User',
        isVerified: true
      });
      await user.save();
      
      const token = jwt.sign(
        { id: user._id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          balance: user.balance
        }
      });
    } else {
      // Login existing user
      const user = await User.findOne({ phone: phoneNumber });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      user.status = 'online';
      await user.save();
      
      const token = jwt.sign(
        { id: user._id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          balance: user.balance
        }
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
