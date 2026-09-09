import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Peer from 'simple-peer';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const VideoCall = () => {
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [contact, setContact] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const peerRef = useRef();
  const videoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    loadContact();
    startCall();
    return () => {
      endCall();
    };
  }, []);

  const loadContact = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContact(response.data);
    } catch (error) {
      console.error('Load contact error:', error);
    }
  };

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize peer connection
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream
      });

      peer.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        endCall();
      });

      peerRef.current = peer;

      // Handle signaling
      peer.on('signal', (signal) => {
        socket.emit('call-request', {
          to: userId,
          signal: signal
        });
      });

    } catch (error) {
      console.error('Start call error:', error);
      alert('Failed to start call. Please check camera/microphone permissions.');
      endCall();
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    navigate(-1);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
    }
  };

  return (
    <div className="container" style={{ height: 'calc(100vh - 100px)' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '20px',
        height: '100%'
      }}>
        {/* Remote Video */}
        <div style={{ 
          background: '#1a1a1a',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {!remoteStream && (
            <div style={{ color: 'var(--white)', position: 'absolute' }}>
              <i className="fas fa-user" style={{ fontSize: '48px' }}></i>
              <p style={{ marginTop: '10px' }}>Waiting for {contact?.name || 'user'} to join...</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px'
        }}>
          {/* Local Video */}
          <div style={{ 
            background: '#333',
            borderRadius: 'var(--radius)',
            height: '200px',
            position: 'relative'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }}
            />
          </div>

          {/* Contact Info */}
          <div className="card text-center">
            <div className="avatar avatar-lg" style={{ margin: '0 auto 10px' }}>
              {contact?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <h3>{contact?.name}</h3>
            <p style={{ color: 'var(--gray-dark)' }}>
              {isCallActive ? 'In Call' : 'Call Ended'}
            </p>
          </div>

          {/* Controls */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-around', padding: '15px' }}>
            <button
              className="btn"
              style={{ 
                background: isMuted ? '#dc3545' : 'var(--primary)',
                color: 'var(--white)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                padding: '0'
              }}
              onClick={toggleMute}
            >
              <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
            </button>
            <button
              className="btn"
              style={{ 
                background: isVideoOff ? '#dc3545' : 'var(--primary)',
                color: 'var(--white)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                padding: '0'
              }}
              onClick={toggleVideo}
            >
              <i className={`fas ${isVideoOff ? 'fa-video-slash' : 'fa-video'}`}></i>
            </button>
            <button
              className="btn btn-danger"
              style={{ 
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                padding: '0'
              }}
              onClick={endCall}
            >
              <i className="fas fa-phone" style={{ transform: 'rotate(135deg)' }}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
