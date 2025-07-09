import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Phone, PhoneOff, Mic, MicOff, Users, Settings, Send } from 'lucide-react';
import './App.css';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3002';

function App() {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [users, setUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [peerConnections, setPeerConnections] = useState(new Map());
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const localVideoRef = useRef();
  const remoteVideoRefs = useRef(new Map());
  const chatEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('room-users', handleRoomUsers);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('chat-message', handleChatMessage);

    return () => {
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('room-users');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('chat-message');
    };
  }, [socket]);

  const handleUserJoined = (data) => {
    setUsers(prev => [...prev, data]);
    setSuccess(`${data.username} joined the room`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleUserLeft = (data) => {
    setUsers(prev => prev.filter(user => user.userId !== data.userId));
    setSuccess(`${data.username} left the room`);
    setTimeout(() => setSuccess(''), 3000);
    
    // Clean up peer connection
    if (peerConnections.has(data.userId)) {
      peerConnections.get(data.userId).close();
      const newPeerConnections = new Map(peerConnections);
      newPeerConnections.delete(data.userId);
      setPeerConnections(newPeerConnections);
    }
  };

  const handleRoomUsers = (roomUsers) => {
    setUsers(roomUsers);
  };

  const handleOffer = async (data) => {
    const { offer, from } = data;
    const peerConnection = createPeerConnection(from);
    
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      socket.emit('answer', {
        target: from,
        answer: answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (data) => {
    const { answer, from } = data;
    const peerConnection = peerConnections.get(from);
    
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  };

  const handleIceCandidate = async (data) => {
    const { candidate, from } = data;
    const peerConnection = peerConnections.get(from);
    
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const handleChatMessage = (data) => {
    setChatMessages(prev => [...prev, data]);
    setTimeout(() => {
      if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const createPeerConnection = (userId) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: userId,
          candidate: event.candidate
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const remoteStream = new MediaStream();
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
      
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.set(userId, remoteStream);
        return newStreams;
      });
    };

    const newPeerConnections = new Map(peerConnections);
    newPeerConnections.set(userId, peerConnection);
    setPeerConnections(newPeerConnections);

    return peerConnection;
  };

  const joinRoom = async () => {
    if (!roomId.trim() || !username.trim()) {
      setError('Please enter both room ID and username');
      return;
    }

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      socket.emit('join-room', { roomId, username });
      setIsInRoom(true);
      setIsCallActive(true);
      setError('');
      setSuccess('Successfully joined the room!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Error accessing media devices:', error);
    }
  };

  const leaveRoom = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Close all peer connections
    peerConnections.forEach(connection => {
      connection.close();
    });
    setPeerConnections(new Map());
    setRemoteStreams(new Map());

    socket.emit('leave-room');
    setIsInRoom(false);
    setIsCallActive(false);
    setUsers([]);
    setError('');
    setSuccess('Left the room successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!isMuted);
      }
    }
  };

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit('chat-message', { message: chatInput });
    setChatInput("");
  };

  if (!isInRoom) {
    return (
      <div className="container">
        <div className="card">
          <div className="room-info">
            <h2>🎙️ Voice Chat</h2>
            <p>Join a room to start calling with others on your LAN/WiFi network</p>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div className="form-group">
            <label htmlFor="roomId">Room ID</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                id="roomId"
                className="input"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
              />
              <button className="btn" onClick={generateRoomId}>
                Generate
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Your Name</label>
            <input
              type="text"
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <button className="btn btn-success" onClick={joinRoom}>
            <Phone style={{ marginRight: '8px' }} />
            Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="room-info">
          <h2>Room: {roomId}</h2>
          <p>
            <Users style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {users.length + 1} participants
          </p>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="main-content" style={{ display: 'flex', gap: 32 }}>
          <div style={{ flex: 2 }}>
            <div className="user-list">
              <div className="user-card connected">
                <div className="status-indicator online"></div>
                <h3>{username} (You)</h3>
                <p>Connected</p>
                {localStream && (
                  <audio ref={localVideoRef} autoPlay muted />
                )}
              </div>
              
              {users.map(user => (
                <div key={user.userId} className="user-card">
                  <div className="status-indicator online"></div>
                  <h3>{user.username}</h3>
                  <p>Connected</p>
                  {remoteStreams.has(user.userId) && (
                    <audio 
                      ref={el => {
                        if (el) {
                          el.srcObject = remoteStreams.get(user.userId);
                          el.play();
                        }
                      }}
                      autoPlay
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="controls">
              <button 
                className={`control-btn ${isMuted ? 'mute' : 'unmute'}`}
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff /> : <Mic />}
              </button>
              
              <button 
                className="control-btn end-call"
                onClick={leaveRoom}
                title="End Call"
              >
                <PhoneOff />
              </button>
            </div>
          </div>
          <div className="chat-panel" style={{ flex: 1, minWidth: 300, maxWidth: 400, display: 'flex', flexDirection: 'column', height: 400, background: '#f7f7fa', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginLeft: 16 }}>
            <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              {chatMessages.length === 0 && <div style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>No messages yet</div>}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={msg.userId === socket.id ? 'chat-message self' : 'chat-message'} style={{ marginBottom: 12, textAlign: msg.userId === socket.id ? 'right' : 'left' }}>
                  <div style={{ fontWeight: 600, color: msg.userId === socket.id ? '#667eea' : '#333', fontSize: 14 }}>{msg.username}{msg.userId === socket.id ? ' (You)' : ''}</div>
                  <div style={{ background: msg.userId === socket.id ? '#e0e7ff' : '#fff', display: 'inline-block', padding: '8px 14px', borderRadius: 16, marginTop: 2, fontSize: 15 }}>{msg.message}</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendChatMessage} style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8, background: '#f7f7fa', borderRadius: '0 0 16px 16px' }}>
              <input
                type="text"
                className="input"
                style={{ flex: 1, marginRight: 8, borderRadius: 20, fontSize: 15 }}
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) sendChatMessage(e); }}
              />
              <button type="submit" className="btn btn-success" style={{ borderRadius: 20, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 