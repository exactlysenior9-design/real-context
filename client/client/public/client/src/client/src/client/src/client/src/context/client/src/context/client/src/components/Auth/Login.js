import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const response = await axios.post('http://localhost:5000/api/auth/signup', {
          phoneNumber,
          name
        });
        
        if (response.data.success) {
          localStorage.setItem('phoneNumber', phoneNumber);
          navigate('/verify-otp', { state: { phoneNumber, isSignUp: true } });
        }
      } else {
        // Login
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          phoneNumber
        });
        
        if (response.data.success) {
          localStorage.setItem('phoneNumber', phoneNumber);
          navigate('/verify-otp', { state: { phoneNumber, isSignUp: false } });
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--gray)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-20">
          <div className="avatar avatar-lg" style={{ margin: '0 auto 15px' }}>
            p
          </div>
          <h1 style={{ color: 'var(--primary)' }}>pChat</h1>
          <p style={{ color: 'var(--gray-dark)' }}>Connect with everyone</p>
        </div>

        <h2 className="text-center mb-20">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        {error && (
          <div className="card" style={{ background: '#fee', color: '#dc3545', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <input
              type="text"
              className="input mb-10"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          
          <input
            type="tel"
            className="input mb-20"
            placeholder="Phone Number (e.g., 0712345678)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-20">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '14px' }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
