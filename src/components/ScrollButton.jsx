import React from 'react';
import './ScrollButton.css';
const ScrollButton = ({ children, onClick, variant = 'primary', disabled = false }) => {
  return (
    <button 
      className={`scroll-button scroll-button-${variant} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="scroll-content">
        <span className="scroll-text">{children}</span>
      </div>
      <div className="scroll-ends">
        <div className="scroll-end left"></div>
        <div className="scroll-end right"></div>
      </div>
    </button>
  );
};
export default ScrollButton; 