import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ScrollButton from '../components/ScrollButton';
import CustomPopup from '../components/CustomPopup';
import './TwistGenerator.css';
const TwistGenerator = () => {
  const { isAuthenticated } = useAuth();
  const [currentTwist, setCurrentTwist] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [twistHistory, setTwistHistory] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    if (isAuthenticated) {
      loadTwistHistory();
    }
  }, [isAuthenticated]);
  const plotTwists = [
    {
      title: "The Betrayal",
      description: "A trusted ally reveals they've been working against the protagonist all along.",
      impact: "High",
      category: "Character",
      icon: "BETRAYAL"
    },
    {
      title: "The Prophecy Twist",
      description: "The prophecy everyone believed in was actually about someone else entirely.",
      impact: "Medium",
      category: "Plot",
      icon: "PROPHECY"
    },
    {
      title: "The Time Loop",
      description: "The protagonist discovers they've been reliving the same events repeatedly.",
      impact: "High",
      category: "Reality",
      icon: "TIME"
    },
    {
      title: "The Identity Reveal",
      description: "The main character learns they are actually the villain's child.",
      impact: "High",
      category: "Character",
      icon: "IDENTITY"
    },
    {
      title: "The False Victory",
      description: "What seemed like a triumph was actually part of the antagonist's plan.",
      impact: "Medium",
      category: "Plot",
      icon: "TWIST"
    },
    {
      title: "The Parallel World",
      description: "The story takes place in a parallel universe where everything is slightly different.",
      impact: "High",
      category: "Setting",
      icon: "PARALLEL"
    },
    {
      title: "The Memory Manipulation",
      description: "The protagonist's memories have been altered by an unknown force.",
      impact: "Medium",
      category: "Character",
      icon: "MEMORY"
    },
    {
      title: "The Cursed Artifact",
      description: "The magical item that was supposed to help is actually cursed.",
      impact: "Medium",
      category: "Plot",
      icon: "CURSED"
    },
    {
      title: "The Hidden Society",
      description: "A secret organization has been manipulating events from the shadows.",
      impact: "High",
      category: "World",
      icon: "SOCIETY"
    },
    {
      title: "The Moral Inversion",
      description: "The hero realizes their actions have been causing more harm than good.",
      impact: "High",
      category: "Character",
      icon: "MORAL"
    },
    {
      title: "The Prophecy Fulfillment",
      description: "The prophecy comes true, but in a completely unexpected way.",
      impact: "Medium",
      category: "Plot",
      icon: "PROPHECY"
    },
    {
      title: "The Reality Shift",
      description: "The world itself begins to change, revealing it was never what it seemed.",
      impact: "High",
      category: "Reality",
      icon: "TWIST"
    }
  ];
  const loadTwistHistory = async () => {
    try {
      const response = await api.getTwists();
      setTwistHistory(response);
    } catch (error) {
      console.error('Error loading twist history:', error);
    }
  };
  const generateTwist = async () => {
    setIsGenerating(true);
    setShowAnimation(true);
    
    try {
      const response = await api.generateTwist({});
      const twistWithId = {
        ...response,
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString()
      };
      
      setCurrentTwist(twistWithId);
      setTwistHistory(prev => [twistWithId, ...prev.slice(0, 4)]);
      setIsGenerating(false);
      
      setTimeout(() => setShowAnimation(false), 1000);
    } catch (error) {
      console.error('Error generating twist:', error);
      setIsGenerating(false);
      setShowAnimation(false);
    }
  };
  const saveTwist = async () => {
    if (currentTwist) {
      try {
        await api.createTwist({
          title: currentTwist.title,
          description: currentTwist.description,
          category: currentTwist.category,
          impact: currentTwist.impact,
          icon: currentTwist.icon
        });
        setShowPopup(true);
        loadTwistHistory();
      } catch (error) {
        console.error('Error saving twist:', error);
      }
    }
  };
  const clearHistory = () => {
    setTwistHistory([]);
    setCurrentTwist(null);
  };
  return (
    <div className="twist-generator">
      <div className="generator-container">
        <div className="generator-header">
          <h1>Twist Generator</h1>
          <div className="generator-controls">
            <ScrollButton 
              variant="primary"
              icon="TWIST"
              onClick={generateTwist}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Twist'}
            </ScrollButton>
            <ScrollButton 
              variant="secondary"
              icon="SAVE"
              onClick={saveTwist}
              disabled={!currentTwist}
            >
              Save Twist
            </ScrollButton>
            <ScrollButton 
              variant="ghost"
              icon="CLEAR"
              onClick={clearHistory}
            >
              Clear History
            </ScrollButton>
          </div>
        </div>
        
        <div className="generator-content">
          <div className="twist-display">
            {showAnimation && (
              <div className="animation-overlay">
                <div className="ink-splatter"></div>
                <div className="scroll-unravel"></div>
                <div className="magic-sparkles">
                  <span>SPARK</span>
                  <span>GLOW</span>
                  <span>STAR</span>
                  <span>SHINE</span>
                </div>
              </div>
            )}
            
            {!isGenerating && currentTwist && !showAnimation ? (
              <div className="twist-card card">
                <div className="twist-header">
                  <div className="twist-info">
                    <h2>{currentTwist.title}</h2>
                    <div className="twist-meta">
                      <span className="twist-category">{currentTwist.category}</span>
                      <span className="twist-impact">{currentTwist.impact} Impact</span>
                    </div>
                  </div>
                </div>
                
                <div className="twist-description">
                  <p>{currentTwist.description}</p>
                </div>
                
                <div className="twist-timestamp">
                  Generated at {currentTwist.timestamp}
                </div>
              </div>
            ) : !isGenerating && !showAnimation && (
              <div className="empty-twist">
                <div className="empty-icon">TWIST</div>
                <h3>Ready for a Twist?</h3>
                <p>Click the button above to generate a plot twist that will change your story forever!</p>
              </div>
            )}
          </div>
          
          <div className="twist-history">
            <h3>Recent Twists</h3>
            {twistHistory.length > 0 ? (
              <div className="history-grid">
                {twistHistory.map(twist => (
                  <div key={twist.id} className="history-item card">
                    <div className="history-header">
                      <span className="history-icon">{twist.icon}</span>
                      <span className="history-title">{twist.title}</span>
                    </div>
                    <p className="history-description">{twist.description}</p>
                    <div className="history-meta">
                      <span className="history-category">{twist.category}</span>
                      <span className="history-time">{twist.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-history">
                <div className="empty-history-icon">HISTORY</div>
                <p>No twists generated yet</p>
                <p className="empty-history-subtitle">Generate your first twist to see it here!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CustomPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        title="Twist Saved!"
        message="Your plot twist has been added to your collection."
        icon=""
        buttonText="Continue"
      />
    </div>
  );
};
export default TwistGenerator; 