import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const CreateMeeting = () => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('video');
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert('Please enter a meeting topic');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/meetings', {
        topic: topic.trim(),
        type,
        maxParticipants: parseInt(maxParticipants)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        navigate(`/meeting/${response.data.meeting.id}`);
      }
    } catch (error) {
      console.error('Create meeting error:', error);
      alert('Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px' }}>
      <div className="card">
        <h2 className="text-center mb-20">Create Meeting</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-10">
            <label>Meeting Topic</label>
            <input
              type="text"
              className="input"
              placeholder="Enter meeting topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          <div className="mb-10">
            <label>Meeting Type</label>
            <div className="flex gap-10" style={{ marginTop: '5px' }}>
              <label className="flex-center gap-10">
                <input
                  type="radio"
                  value="video"
                  checked={type === 'video'}
                  onChange={(e) => setType(e.target.value)}
                />
                <i className="fas fa-video"></i> Video
              </label>
              <label className="flex-center gap-10">
                <input
                  type="radio"
                  value="voice"
                  checked={type === 'voice'}
                  onChange={(e) => setType(e.target.value)}
                />
                <i className="fas fa-phone"></i> Voice
              </label>
            </div>
          </div>

          <div className="mb-20">
            <label>Max Participants</label>
            <input
              type="number"
              className="input"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              min="2"
              max="10000"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Meeting'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMeeting;
