import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search } from 'lucide-react'; // modern icons
import './header.css';

function Header({ title }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const fullname = user?.fullname || user?.username || '';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <header className="soft-header">
      {/* Left */}
      <div className="left-section">
        <div className="logo">{title || 'Dashboard'}</div>
      </div>

      {/* Right */}
      <div className="right-section">
        <span className="welcome">👋 Hi, <strong>{fullname}</strong></span>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> <span className="logout-text">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
