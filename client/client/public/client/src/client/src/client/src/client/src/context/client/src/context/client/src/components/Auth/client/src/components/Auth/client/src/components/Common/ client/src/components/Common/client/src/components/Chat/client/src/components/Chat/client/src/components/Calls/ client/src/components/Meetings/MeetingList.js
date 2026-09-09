import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const MeetingList = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/meetings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(response.data);
    } catch (error) {
      console.error('Load meetings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinMeeting = async (meetingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/meetings/${meetingId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/meeting/${meetingId}`);
    } catch (error) {
      console.error('Join meeting error:', error);
      alert('Failed to join meeting');
    }
  };

  return (
    <div className="container">
      <div className="flex-between mb-20">
        <h2>Meetings</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/create-meeting')}
        >
          <i className="fas fa-plus"></i> New Meeting
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : meetings.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <i className="fas fa-users" style={{ fontSize: '48px', color: '#ccc' }}></i>
          <p style={{ marginTop: '10px', color: 'var(--gray-dark)' }}>
            No active meetings. Create one to get started!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {meetings.map(meeting => (
            <div key={meeting.id} className="card">
              <div className="flex-between">
                <div>
                  <h4>{meeting.topic}</h4>
                  <small style={{ color: 'var(--gray-dark)' }}>
                    Host: {meeting.hostName} • 
                    {meeting.participants?.length || 0} participants
                  </small>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => joinMeeting(meeting.id)}
                >
                  <i className="fas fa-sign-in-alt"></i> Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingList;
