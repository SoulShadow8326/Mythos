import React from 'react';
import './InkLoader.css';

const InkLoader = ({ message = "Crafting your tale..." }) => {
  return (
    <div className="ink-loader">
      <div className="loader-container">
        <div className="quill-container">
          <div className="quill">
            <div className="feather"></div>
            <div className="feather-tip"></div>
          </div>
        </div>
        
        <div className="ink-spots">
          <div className="ink-spot ink-spot-1"></div>
          <div className="ink-spot ink-spot-2"></div>
          <div className="ink-spot ink-spot-3"></div>
        </div>
        
        <div className="loading-text">
          {message.split('').map((char, index) => (
            <span key={index} className="text-char" style={{ animationDelay: `${index * 0.1}s` }}>
              {char}
            </span>
          ))}
        </div>
        
        <div className="page-shimmer"></div>
      </div>
    </div>
  );
};

export default InkLoader; 