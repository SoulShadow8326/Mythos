import React, { useState, useEffect } from 'react';
import './SaveAnimation.css';

const SaveAnimation = ({ isVisible, onClose, storyTitle }) => {
  const [saveProgress, setSaveProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { name: 'Preparing story data...', duration: 800 },
    { name: 'Validating content...', duration: 600 },
    { name: 'Saving to library...', duration: 1000 },
    { name: 'Story saved successfully!', duration: 500 }
  ];

  useEffect(() => {
    if (isVisible) {
      setSaveProgress(0);
      setCurrentStep(0);
      
      let totalTime = 0;
      steps.forEach((step, index) => {
        setTimeout(() => {
          setCurrentStep(index);
          setSaveProgress(((index + 1) / steps.length) * 100);
        }, totalTime);
        totalTime += step.duration;
      });
      
      setTimeout(() => {
        onClose();
      }, totalTime + 1000);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="save-animation-overlay">
      <div className="save-animation-container">
        <div className="save-animation-content">
          <div className="save-icon">
            <div className="book-icon">
              <div className="book-cover"></div>
              <div className="book-pages"></div>
              <div className="save-checkmark"></div>
            </div>
          </div>
          
          <div className="save-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${saveProgress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {steps[currentStep]?.name || 'Saving...'}
            </div>
          </div>
          
          <div className="story-info">
            <h3>{storyTitle || 'Untitled Story'}</h3>
            <p>Your story is being saved to your library</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveAnimation; 