import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setIsAuthenticated } = useAuth();
  const { phoneNumber, isSignUp } = location.state || {};

  useEffect(() => {
    if (!phoneNumber) {
      navigate('/login');
      return;
    }
    startTimer();
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const startTimer = () => {
    setTimer(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    if (index === 5 && value) {
      handleVerify();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        phoneNumber,
        otp: otpCode,
        isSignUp
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/resend-otp', { phoneNumber });
      startTimer();
      setError('');
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--gray)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-10">Verify Phone</h2>
        <p className="text-center mb-20" style={{ color: 'var(--gray-dark)' }}>
          We sent a 6-digit code to {phoneNumber}
        </p>

        {error && (
          <div className="card" style={{ background: '#fee', color: '#dc3545', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <div className="flex-center gap-10" style={{ marginBottom: '20px' }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              maxLength="1"
              className="input"
              style={{ width: '50px', textAlign: 'center', fontSize: '24px' }}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={isLoading}
            />
          ))}
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>

        <div className="flex-center mt-20">
          <span style={{ color: 'var(--gray-dark)' }}>Didn't receive code? </span>
          {canResend ? (
            <button
              onClick={handleResend}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
            >
              Resend OTP
            </button>
          ) : (
            <span style={{ color: 'var(--gray-dark)' }}>Resend in {timer}s</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
