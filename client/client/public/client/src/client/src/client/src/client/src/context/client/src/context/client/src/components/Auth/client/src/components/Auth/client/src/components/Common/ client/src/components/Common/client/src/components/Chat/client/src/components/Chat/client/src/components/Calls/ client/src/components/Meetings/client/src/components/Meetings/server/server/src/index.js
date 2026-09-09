const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Models
const User = require('./models/User');
const Message = require('./models/Message');
const Meeting = require('./models/Meeting');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/status', require('./routes/status'));

// Socket.IO
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('authenticate', (userId) => {
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    io.emit('userOnline', userId);
    console.log(`User ${userId} authenticated`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const message = new Message({
        senderId: data.senderId,
        receiverId: data.receiverId,
        text: data.text,
        timestamp: data.timestamp || new Date()
      });
      await message.save();

      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', message);
      }
      
      // Send back to sender
      socket.emit('messageSent', message);
    } catch (error) {
      console.error('Send message error:', error);
    }
  });

  socket.on('call-request', (data) => {
    const receiverSocketId = onlineUsers.get(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incoming-call', {
        from: socket.userId,
        signal: data.signal
      });
    }
  });

  socket.on('call-accepted', (data) => {
    const callerSocketId = onlineUsers.get(data.to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-accepted', {
        from: socket.userId,
        signal: data.signal
      });
    }
  });

  socket.on('join-meeting', async (data) => {
    try {
      const meeting = await Meeting.findById(data.meetingId);
      if (!meeting) {
        socket.emit('meeting-error', { message: 'Meeting not found' });
        return;
      }

      if (meeting.participants.length >= meeting.maxParticipants) {
        socket.emit('meeting-error', { message: 'Meeting is full' });
        return;
      }

      meeting.participants.push({
        userId: data.userId,
        userName: data.userName,
        joinedAt: new Date()
      });
      await meeting.save();

      socket.join(`meeting_${data.meetingId}`);
      io.to(`meeting_${data.meetingId}`).emit('participant-joined', {
        userId: data.userId,
        userName: data.userName
      });
      
      socket.emit('meeting-joined', {
        meetingId: data.meetingId,
        participants: meeting.participants
      });
    } catch (error) {
      console.error('Join meeting error:', error);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('userOffline', socket.userId);
    }
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
