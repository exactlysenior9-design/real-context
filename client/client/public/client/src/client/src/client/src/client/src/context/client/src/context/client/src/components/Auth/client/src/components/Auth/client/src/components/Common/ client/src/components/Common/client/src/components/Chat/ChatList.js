import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const ChatList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chat/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data);
    } catch (error) {
      console.error('Load contacts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  return (
    <div className="container">
      <div className="flex-between mb-20">
        <h2>Chats</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/create-meeting')}
        >
          <i className="fas fa-video"></i> New Meeting
        </button>
      </div>

      <input
        type="text"
        className="input mb-20"
        placeholder="Search contacts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : filteredContacts.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <i className="fas fa-users" style={{ fontSize: '48px', color: '#ccc' }}></i>
          <p style={{ marginTop: '10px', color: 'var(--gray-dark)' }}>
            {searchTerm ? 'No contacts found' : 'No contacts yet. Share your phone number with friends!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/chat/${contact.id}`)}
            >
              <div className="flex-between">
                <div className="flex-center gap-10">
                  <div className="avatar">
                    {getInitials(contact.name)}
                  </div>
                  <div>
                    <h4>{contact.name}</h4>
                    <small style={{ color: 'var(--gray-dark)' }}>{contact.phone}</small>
                  </div>
                </div>
                <div className="flex-center gap-10">
                  <span className={`status-dot ${contact.status === 'online' ? 'status-online' : 'status-offline'}`} />
                  <span style={{ fontSize: '12px', color: 'var(--gray-dark)' }}>
                    {contact.status === 'online' ? 'Online' : 'Offline'}
                  </span>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '5px 12px', fontSize: '14px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/video-call/${contact.id}`);
                    }}
                  >
                    <i className="fas fa-video"></i>
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '5px 12px', fontSize: '14px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/voice-call/${contact.id}`);
                    }}
                  >
                    <i className="fas fa-phone"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;
