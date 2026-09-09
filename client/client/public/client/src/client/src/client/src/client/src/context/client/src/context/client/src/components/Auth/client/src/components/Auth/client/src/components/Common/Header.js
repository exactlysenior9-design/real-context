import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = ({ user }) => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <header style={{ 
      background: 'var(--primary)', 
      color: 'var(--white)', 
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div className="flex-center gap-10">
        <div className="avatar avatar-sm" style={{ background: 'var(--white)', color: 'var(--primary)' }}>
          p
        </div>
        <h2 style={{ fontSize: '20px' }}>pChat</h2>
      </div>

      <div className="flex-center gap-20">
        <span>Welcome, {user?.name || 'User'}</span>
        <button 
          onClick={handleLogout}
          style={{ 
            background: 'transparent', 
            border: '1px solid var(--white)',
            color: 'var(--white)',
            padding: '5px 15px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
