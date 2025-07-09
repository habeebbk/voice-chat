# 🎙️ Voice Chat - Real-time Calling System

A modern, WebRTC-based real-time calling system designed to work over LAN/WiFi networks. This application provides high-quality voice communication with a beautiful, responsive interface.

## ✨ Features

- **Real-time Voice Calling**: Crystal clear audio communication using WebRTC
- **Room-based System**: Create or join rooms for group calls
- **LAN/WiFi Support**: Works seamlessly on local networks
- **Modern UI**: Beautiful, responsive interface with smooth animations
- **Mute/Unmute**: Control your audio during calls
- **User Management**: See who's in the room and their connection status
- **Cross-platform**: Works on any device with a modern browser

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or download the project**
   ```bash
   # If you have the files, just navigate to the project directory
   cd voice_chat
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start the application**
   ```bash
   # Start both server and client in development mode
   npm run dev
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Start server
   npm run server
   
   # Terminal 2 - Start client
   npm run client
   ```

4. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - The server will be running on `http://localhost:3001`

## 🌐 LAN/WiFi Usage

### For Local Network Access

1. **Find your computer's IP address**:
   - **Windows**: Open Command Prompt and type `ipconfig`
   - **Mac/Linux**: Open Terminal and type `ifconfig` or `ip addr`

2. **Share the IP address** with others on your network:
   - Example: `
   http://192.168.1.100:3000`
   - Make sure all devices are on the same WiFi/LAN network

3. **Firewall settings**:
   - Ensure port 3000 and 3001 are open on your computer
   - Windows users may need to allow the application through Windows Firewall

### Network Requirements

- All devices must be on the same local network (WiFi or LAN)
- Modern browsers with WebRTC support
- Microphone permissions enabled

## 📱 How to Use

### Joining a Call

1. **Enter Room Details**:
   - Enter a Room ID (or click "Generate" for a random one)
   - Enter your name
   - Click "Join Room"

2. **Grant Permissions**:
   - Allow microphone access when prompted
   - The browser will request permission to use your microphone

3. **Start Talking**:
   - Once connected, you'll see other participants
   - Use the mute/unmute button to control your audio
   - Click "End Call" to leave the room

### Creating a Room

1. Click the "Generate" button to create a random room ID
2. Share this room ID with others you want to call
3. Have them enter the same room ID to join

### During a Call

- **Mute/Unmute**: Click the microphone button to toggle your audio
- **End Call**: Click the red phone button to leave the room
- **See Participants**: View all connected users in the room
- **Connection Status**: Green indicators show who's online

## 🛠️ Technical Details

### Architecture

- **Backend**: Node.js with Express and Socket.IO
- **Frontend**: React with modern hooks and WebRTC
- **Signaling**: Socket.IO for WebRTC signaling
- **Audio**: WebRTC peer-to-peer audio streaming
- **Styling**: Modern CSS with gradients and animations

### WebRTC Features

- **STUN Servers**: Google's public STUN servers for NAT traversal
- **Peer-to-Peer**: Direct audio streaming between participants
- **Automatic Reconnection**: Handles network interruptions gracefully
- **Audio Quality**: Optimized for voice communication

### Security

- **HTTPS Recommended**: For production use, enable HTTPS
- **Local Network**: Designed for trusted local networks
- **No External Dependencies**: Works entirely on your local network

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=development
```

### Customization

- **Server Port**: Change `PORT` in `.env` or `server/index.js`
- **Client URL**: Update `SERVER_URL` in `client/src/App.js`
- **STUN Servers**: Modify ICE servers in `createPeerConnection()`

## 🚀 Production Deployment

### Build for Production

```bash
# Build the React app
npm run build

# Start the production server
npm start
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

1. **Microphone not working**:
   - Check browser permissions
   - Ensure microphone is not being used by other applications
   - Try refreshing the page

2. **Can't hear others**:
   - Check your system volume
   - Ensure browser audio is not muted
   - Check if others are muted

3. **Connection issues**:
   - Verify all devices are on the same network
   - Check firewall settings
   - Try using a different browser

4. **Room not found**:
   - Double-check the room ID
   - Ensure the room creator is still online
   - Try creating a new room

### Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Limited support (use desktop for best experience)

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure all prerequisites are met
4. Try using a different browser or device

---

**Enjoy your real-time voice calling experience! 🎉** 