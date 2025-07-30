import React from 'react';
import './InkLoader.css';

const InkLoader = ({ message = "Crafting your tale..." }) => {
  return (
    <div className="ink-loader">
      <div className="loader-container">
        <div className="simple-spinner"></div>
        <div className="loading-text">
          {message}
        </div>
      </div>
    </div>
  );
};

export default InkLoader; 