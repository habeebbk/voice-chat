const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Store active users and rooms
const users = new Map();
const rooms = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join user to a room
  socket.on('join-room', (data) => {
    const { roomId, username } = data;
    
    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    // Add user to room
    rooms.get(roomId).add(socket.id);
    users.set(socket.id, { roomId, username });
    
    socket.join(roomId);
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      username
    });
    
    // Send current users in room to the new user
    const roomUsers = Array.from(rooms.get(roomId))
      .filter(id => id !== socket.id)
      .map(id => ({
        userId: id,
        username: users.get(id)?.username || 'Unknown'
      }));
    
    socket.emit('room-users', roomUsers);
    
    console.log(`${username} joined room: ${roomId}`);
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    const { target, offer } = data;
    socket.to(target).emit('offer', {
      offer,
      from: socket.id
    });
  });

  socket.on('answer', (data) => {
    const { target, answer } = data;
    socket.to(target).emit('answer', {
      answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    const { target, candidate } = data;
    socket.to(target).emit('ice-candidate', {
      candidate,
      from: socket.id
    });
  });

  // Chat message handling
  socket.on('chat-message', (data) => {
    const user = users.get(socket.id);
    if (user) {
      const { roomId, username } = user;
      io.to(roomId).emit('chat-message', {
        userId: socket.id,
        username,
        message: data.message,
        timestamp: Date.now()
      });
    }
  });

  // Handle user leaving
  socket.on('leave-room', () => {
    const user = users.get(socket.id);
    if (user) {
      const { roomId, username } = user;
      
      // Remove from room
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        
        // Delete room if empty
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
        }
      }
      
      // Notify others
      socket.to(roomId).emit('user-left', {
        userId: socket.id,
        username
      });
      
      users.delete(socket.id);
      console.log(`${username} left room: ${roomId}`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const { roomId, username } = user;
      
      // Remove from room
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        
        // Delete room if empty
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
        }
      }
      
      // Notify others
      socket.to(roomId).emit('user-left', {
        userId: socket.id,
        username
      });
      
      users.delete(socket.id);
      console.log(`${username} disconnected from room: ${roomId}`);
    }
  });
});

// API Routes
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.keys()).map(roomId => ({
    id: roomId,
    userCount: rooms.get(roomId).size
  }));
  res.json(roomList);
});

app.get('/api/rooms/:roomId/users', (req, res) => {
  const { roomId } = req.params;
  if (rooms.has(roomId)) {
    const userList = Array.from(rooms.get(roomId)).map(userId => ({
      userId,
      username: users.get(userId)?.username || 'Unknown'
    }));
    res.json(userList);
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the app at: http://localhost:${PORT}`);
  console.log(`For LAN access, use your computer's IP address`);
}); 