import React, { useState, useRef, useEffect } from 'react';
import InkLoader from '../components/InkLoader';
import ScrollButton from '../components/ScrollButton';
import CustomDropdown from '../components/CustomDropdown';
import SaveAnimation from '../components/SaveAnimation';
import './StoryBuilder.css';

const StoryBuilder = () => {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [storyHistory, setStoryHistory] = useState([]);
  const [currentStory, setCurrentStory] = useState({
    title: '',
    genre: '',
    characters: [],
    plot: ''
  });
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const genreOptions = [
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'romance', label: 'Romance' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'scifi', label: 'Science Fiction' },
    { value: 'horror', label: 'Horror' }
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [storyHistory]);

  const generateStory = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    
    const userMessage = {
      type: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setStoryHistory(prev => [...prev, userMessage]);
    setUserInput('');
    
    try {
      const response = await simulateAIResponse(userInput);
      
      const aiMessage = {
        type: 'ai',
        content: response,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setStoryHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (input) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const responses = [
      "The ancient castle loomed before them, its weathered stones whispering secrets of centuries past. Shadows danced across the courtyard as the wind carried the faint sound of distant bells.",
      "With trembling hands, she reached for the mysterious artifact. Its surface seemed to pulse with an otherworldly energy, calling to something deep within her soul.",
      "The forest path wound deeper into the unknown, each step taking them further from the world they knew. Strange sounds echoed through the trees, and the air itself seemed to hold its breath.",
      "In the dim candlelight, the old wizard's eyes gleamed with ancient wisdom. 'The prophecy speaks of one who will change everything,' he whispered, his voice carrying the weight of destiny.",
      "The storm clouds gathered overhead, lightning illuminating the battlefield in stark flashes. Warriors from both sides stood ready, their weapons gleaming in the electric light."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateStory();
    }
  };

  const clearStory = () => {
    setStoryHistory([]);
    setCurrentStory({
      title: '',
      genre: '',
      characters: [],
      plot: ''
    });
  };

  const saveStory = () => {
    const storyData = {
      id: Date.now(),
      title: currentStory.title || 'Untitled Story',
      content: storyHistory,
      createdAt: new Date().toISOString(),
      ...currentStory
    };
    
    const savedStories = JSON.parse(localStorage.getItem('mythos_stories') || '[]');
    savedStories.push(storyData);
    localStorage.setItem('mythos_stories', JSON.stringify(savedStories));
    
    setShowSaveAnimation(true);
  };

  return (
    <div className="story-builder">
      <SaveAnimation 
        isVisible={showSaveAnimation}
        onClose={() => setShowSaveAnimation(false)}
        storyTitle={currentStory.title || 'Untitled Story'}
      />
      <div className="builder-container">
        <div className="builder-header">
          <h1>Story Builder</h1>
          <div className="story-controls">
            <ScrollButton 
              variant="secondary"
              icon="SAVE"
              onClick={saveStory}
            >
              Save Story
            </ScrollButton>
            <ScrollButton 
              variant="ghost"
              icon="CLEAR"
              onClick={clearStory}
            >
              Clear
            </ScrollButton>
          </div>
        </div>
        
        <div className="builder-content">
          <div className="input-section">
            <div className="story-info">
              <input
                type="text"
                className="input story-title"
                placeholder="Story Title..."
                value={currentStory.title}
                onChange={(e) => setCurrentStory(prev => ({ ...prev, title: e.target.value }))}
              />
              <CustomDropdown
                className="input story-genre"
                options={genreOptions}
                value={currentStory.genre}
                onChange={(value) => setCurrentStory(prev => ({ ...prev, genre: value }))}
                placeholder="Select Genre..."
              />
            </div>
            
            <div className="user-input-area">
              <textarea
                ref={inputRef}
                className="textarea story-input"
                placeholder="Continue your tale... (Press Enter to send, Shift+Enter for new line)"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <ScrollButton 
                variant="primary"
                icon="WRITE"
                onClick={generateStory}
                disabled={isLoading || !userInput.trim()}
              >
                {isLoading ? 'Crafting...' : 'Continue Story'}
              </ScrollButton>
            </div>
          </div>
          
          <div className="chat-section">
            <div className="chat-container" ref={chatContainerRef}>
              {storyHistory.length === 0 ? (
                <div className="empty-chat">
                  <div className="empty-icon">STORY</div>
                  <h3>Begin Your Tale</h3>
                  <p>Start writing your story in the input area to the left. The AI will help you craft an amazing narrative!</p>
                </div>
              ) : (
                storyHistory.map((message, index) => (
                  <div 
                    key={index} 
                    className={`chat-message ${message.type}`}
                  >
                    <div className="message-header">
                      <span className="message-author">
                        {message.type === 'user' ? 'You' : 'Mythos AI'}
                      </span>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                    <div className="message-content">
                      {message.type === 'ai' ? (
                        <TypewriterText text={message.content} />
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="loading-message">
                  <InkLoader message="Crafting your tale..." />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text]);

  return (
    <p className="typewriter-text">
      {displayedText}
      <span className="cursor">|</span>
    </p>
  );
};

export default StoryBuilder; 