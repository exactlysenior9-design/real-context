const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  hostId: { type: String, required: true },
  hostName: { type: String, required: true },
  type: { type: String, enum: ['video', 'voice'], default: 'video' },
  maxParticipants: { type: Number, default: 100 },
  participants: [{
    userId: String,
    userName: String,
    joinedAt: Date
  }],
  status: { type: String, enum: ['scheduled', 'active', 'ended'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  startedAt: Date,
  endedAt: Date
});

module.exports = mongoose.model('Meeting', MeetingSchema);
