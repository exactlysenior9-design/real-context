import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    { icon: 'fa-comments', label: 'Chats', path: '/' },
    { icon: 'fa-video', label: 'Calls', path: '/video-call' },
    { icon: 'fa-users', label: 'Meetings', path: '/meetings' },
    { icon: 'fa-ad', label: 'Ads', path: '/ads' },
    { icon: 'fa-clock', label: 'Status', path: '/status' },
    { icon: 'fa-user', label: 'Profile', path: '/profile' },
    { icon: 'fa-cog', label: 'Settings', path: '/settings' },
  ];

  return (
    <aside style={{
      width: '70px',
      background: 'var(--white)',
      boxShadow: 'var(--shadow)',
      height: 'calc(100vh - 70px)',
      position: 'sticky',
      top: '70px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0',
      gap: '20px'
    }}>
      {menuItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          style={({ isActive }) => ({
            color: isActive ? 'var(--primary)' : 'var(--gray-dark)',
            fontSize: '24px',
            transition: 'color 0.3s ease',
            textDecoration: 'none'
          })}
          title={item.label}
        >
          <i className={`fas ${item.icon}`}></i>
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;
