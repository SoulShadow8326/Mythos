import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
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

  return (
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
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 