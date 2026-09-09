import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './components/Auth/Login';
import OTPVerification from './components/Auth/OTPVerification';
import ChatList from './components/Chat/ChatList';
import ChatWindow from './components/Chat/ChatWindow';
import VideoCall from './components/Calls/VideoCall';
import VoiceCall from './components/Calls/VoiceCall';
import MeetingList from './components/Meetings/MeetingList';
import MeetingRoom from './components/Meetings/MeetingRoom';
import CreateMeeting from './components/Meetings/CreateMeeting';
import Payment from './components/Payments/Payment';
import AdList from './components/Ads/AdList';
import CreateAd from './components/Ads/CreateAd';
import StatusList from './components/Status/StatusList';
import Profile from './components/Profile/Profile';
import Settings from './components/Profile/Settings';
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <AuthProvider value={{ user, setUser, isAuthenticated, setIsAuthenticated }}>
      <SocketProvider>
        <Router>
          <div className="App">
            {isAuthenticated && <Header user={user} />}
            <div style={{ display: 'flex' }}>
              {isAuthenticated && <Sidebar />}
              <div style={{ flex: 1, padding: '20px' }}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/verify-otp" element={<OTPVerification />} />
                  <Route path="/" element={isAuthenticated ? <ChatList /> : <Navigate to="/login" />} />
                  <Route path="/chat/:userId" element={isAuthenticated ? <ChatWindow /> : <Navigate to="/login" />} />
                  <Route path="/video-call/:userId" element={isAuthenticated ? <VideoCall /> : <Navigate to="/login" />} />
                  <Route path="/voice-call/:userId" element={isAuthenticated ? <VoiceCall /> : <Navigate to="/login" />} />
                  <Route path="/meetings" element={isAuthenticated ? <MeetingList /> : <Navigate to="/login" />} />
                  <Route path="/meeting/:meetingId" element={isAuthenticated ? <MeetingRoom /> : <Navigate to="/login" />} />
                  <Route path="/create-meeting" element={isAuthenticated ? <CreateMeeting /> : <Navigate to="/login" />} />
                  <Route path="/payment" element={isAuthenticated ? <Payment /> : <Navigate to="/login" />} />
                  <Route path="/ads" element={isAuthenticated ? <AdList /> : <Navigate to="/login" />} />
                  <Route path="/create-ad" element={isAuthenticated ? <CreateAd /> : <Navigate to="/login" />} />
                  <Route path="/status" element={isAuthenticated ? <StatusList /> : <Navigate to="/login" />} />
                  <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
                  <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
                </Routes>
              </div>
            </div>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
