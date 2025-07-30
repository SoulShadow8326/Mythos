import React, { useEffect } from 'react';
import './CustomPopup.css';

const CustomPopup = ({ 
  isOpen, 
  onClose, 
  title = "Success!", 
  message = "Operation completed successfully.", 
  icon = "✓",
  buttonText = "OK"
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          ×
        </button>
        
        <div className="popup-icon">
          {icon}
        </div>
        
        <h3 className="popup-title">
          {title}
        </h3>
        
        <p className="popup-message">
          {message}
        </p>
        
        <button className="popup-button" onClick={onClose}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default CustomPopup; 