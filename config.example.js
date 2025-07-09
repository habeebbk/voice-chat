// Example configuration file
// Copy this to config.js and modify as needed

module.exports = {
  // Server settings
  port: process.env.PORT || 3001,
  host: '0.0.0.0', // Listen on all network interfaces
  
  // WebRTC settings
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  
  // Client settings
  clientUrl: process.env.REACT_APP_SERVER_URL || 'http://localhost:3001',
  
  // Room settings
  maxRoomSize: 10, // Maximum users per room
  roomTimeout: 300000, // 5 minutes - auto-cleanup empty rooms
  
  // Development settings
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
}; 