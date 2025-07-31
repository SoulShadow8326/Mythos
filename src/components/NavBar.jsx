import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserStats from './UserStats';
import './NavBar.css';
const NavBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showUserStats, setShowUserStats] = useState(false);
  const location = useLocation();
  const navItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'story', label: 'Story', path: '/story' },
    { id: 'character', label: 'Characters', path: '/character' },
    { id: 'plot', label: 'Plot', path: '/plot' },
    { id: 'twist', label: 'Twists', path: '/twist' },
    { id: 'library', label: 'Library', path: '/library' }
  ];
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  const handleUsernameClick = () => {
    setShowUserStats(true);
  };
  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 className="brand-title">Mythos</h1>
            </Link>
          </div>
          
          <div className="navbar-menu">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-button ${isActive(item.path) ? 'active' : ''}`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ textDecoration: 'none' }}
              >
                {item.label}
                {hoveredItem === item.id && (
                  <div className="nav-hover-effect"></div>
                )}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="user-section">
                <span 
                  className="username" 
                  onClick={handleUsernameClick}
                  style={{ cursor: 'pointer' }}
                >
                  {user?.username}
                </span>
                <button
                  className="nav-button auth-button"
                  onClick={logout}
                  onMouseEnter={() => setHoveredItem('logout')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  Logout
                  {hoveredItem === 'logout' && (
                    <div className="nav-hover-effect"></div>
                  )}
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className={`nav-button auth-button ${isActive('/auth') ? 'active' : ''}`}
                onMouseEnter={() => setHoveredItem('auth')}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ textDecoration: 'none' }}
              >
                Log In
                {hoveredItem === 'auth' && (
                  <div className="nav-hover-effect"></div>
                )}
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      <UserStats 
        isVisible={showUserStats}
        onClose={() => setShowUserStats(false)}
      />
    </>
  );
};
export default NavBar; 