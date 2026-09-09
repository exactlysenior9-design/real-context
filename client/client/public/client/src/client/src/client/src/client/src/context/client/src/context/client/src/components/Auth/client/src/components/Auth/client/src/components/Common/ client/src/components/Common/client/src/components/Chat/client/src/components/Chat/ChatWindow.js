import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    loadContact();
    
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      return () => {
        socket.off('newMessage');
      };
    }
  }, [userId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/chat/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const loadContact = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContact(response.data);
    } catch (error) {
      console.error('Load contact error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    if (message.senderId === userId || message.receiverId === userId) {
      setMessages(prev => [...prev, message]);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    const newMessage = {
      senderId: user.id,
      receiverId: userId,
      text: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/chat/messages', newMessage, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
      if (socket) {
        socket.emit('sendMessage', newMessage);
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="flex-between mb-20">
        <div className="flex-center gap-10">
          <button onClick={() => navigate('/')} className="btn" style={{ background: 'none' }}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="avatar">
            {getInitials(contact?.name)}
          </div>
          <div>
            <h3>{contact?.name}</h3>
            <small style={{ color: 'var(--gray-dark)' }}>
              <span className={`status-dot ${contact?.status === 'online' ? 'status-online' : 'status-offline'}`} />
              {' '}{contact?.status === 'online' ? 'Online' : 'Offline'}
            </small>
          </div>
        </div>
        <div className="flex-center gap-10">
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/voice-call/${userId}`)}
          >
            <i className="fas fa-phone"></i>
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/video-call/${userId}`)}
          >
            <i className="fas fa-video"></i>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '10px',
        background: '#e8ebe9',
        borderRadius: 'var(--radius)',
        marginBottom: '10px'
      }}>
        {messages.length === 0 ? (
          <div className="text-center" style={{ marginTop: '50px', color: 'var(--gray-dark)' }}>
            No messages yet. Start chatting!
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              style={{
                maxWidth: '60%',
                marginBottom: '10px',
                alignSelf: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
                marginLeft: msg.senderId === user?.id ? 'auto' : '0',
                marginRight: msg.senderId === user?.id ? '0' : 'auto',
                background: msg.senderId === user?.id ? 'var(--primary)' : 'var(--white)',
                color: msg.senderId === user?.id ? 'var(--white)' : '#333',
                padding: '12px 15px',
                borderRadius: '12px',
                boxShadow: 'var(--shadow)'
              }}
            >
              <div>{msg.text}</div>
              <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7 }}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-center gap-10">
        <input
          type="text"
          className="input"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
