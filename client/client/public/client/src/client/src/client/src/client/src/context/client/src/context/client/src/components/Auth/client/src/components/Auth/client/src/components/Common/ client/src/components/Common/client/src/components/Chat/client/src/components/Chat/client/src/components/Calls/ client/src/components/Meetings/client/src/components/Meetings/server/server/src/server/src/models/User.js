const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  avatar: { type: String },
  status: { type: String, enum: ['online', 'offline', 'busy'], default: 'offline' },
  isVerified: { type: Boolean, default: false },
  balance: { type: Number, default: 0 },
  adsPosted: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date },
  isPremium: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);
