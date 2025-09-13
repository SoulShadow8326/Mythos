import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
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
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [userStories, setUserStories] = useState([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [showStorySelector, setShowStorySelector] = useState(false);
  
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
  useEffect(() => {
    loadUserStories();
  }, []);
  const loadUserStories = async () => {
    try {
      setIsLoadingStories(true);
      const stories = await api.getStories();
      setUserStories(stories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setIsLoadingStories(false);
    }
  };
  const loadStory = async (storyId) => {
    try {
      setIsLoading(true);
      const story = await api.getStory(storyId);
      
      
      let messages = [];
      if (story.content && Array.isArray(story.content)) {
          messages = story.content.map(msg => {
            let contentText = '';
            if (typeof msg.content === 'string') {
              contentText = msg.content;
            } else if (Array.isArray(msg.content)) {
              contentText = msg.content.map(c => (typeof c === 'string' ? c : (c && c.content) ? c.content : JSON.stringify(c))).join('\n\n');
            } else if (msg.content !== undefined && msg.content !== null) {
              contentText = typeof msg.content === 'object' ? JSON.stringify(msg.content) : String(msg.content);
            }
            return {
              type: msg.type || 'ai',
              content: contentText,
              timestamp: msg.timestamp || new Date().toLocaleTimeString()
            };
          });
      } else if (story.content && typeof story.content === 'string') {
        const lines = story.content.split('\n\n');
        messages = lines.map(line => {
          if (line.startsWith('You: ')) {
            return {
              type: 'user',
              content: line.substring(5),
              timestamp: new Date().toLocaleTimeString()
            };
          } else if (line.startsWith('Mythos AI: ')) {
            return {
              type: 'ai',
              content: line.substring(11),
              timestamp: new Date().toLocaleTimeString()
            };
          } else {
            return {
              type: 'ai',
              content: line,
              timestamp: new Date().toLocaleTimeString()
            };
          }
        }).filter(msg => msg.content.trim());
      }
      setStoryHistory(messages);
      setCurrentStory({
        title: story.title || '',
        genre: story.genre || '',
        characters: story.characters || [],
        plot: story.plot || null
      });
      setCurrentStoryId(story.id);
      setShowStorySelector(false);
      
      console.log('Loaded story:', story.title, 'with', messages.length, 'messages');
    } catch (error) {
      console.error('Error loading story:', error);
      alert('Error loading story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const generateStory = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    
    const userMessage = {
      type: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString()
    };
    
    // build the updated history locally so subsequent logic uses the fresh state
    const newHistoryAfterUser = [...storyHistory, userMessage];
    setStoryHistory(newHistoryAfterUser);
    setUserInput('');
    
    try {
      
      const fullStoryContent = newHistoryAfterUser
        .map(msg => `${msg.type === 'user' ? 'You' : 'Mythos AI'}: ${msg.content}`)
        .join('\n\n');
      const response = await api.continueStory({
        storyContent: fullStoryContent,
        direction: '',
        storyId: currentStoryId
      });
      
      const aiMessage = {
        type: 'ai',
        content: response.continuation,
        timestamp: new Date().toLocaleTimeString()
      };
      const newHistory = [...newHistoryAfterUser, aiMessage];
      setStoryHistory(newHistory);

      if (autoGenerate && newHistory.length <= 3 && currentStoryId) {
        await autoGenerateContent(fullStoryContent + '\n\n' + response.continuation);
      }
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const autoGenerateContent = async (storyContent) => {
    try {
      
      if (currentStory.characters.length < 3) {
        const characterResponse = await api.generateCharacterFromStory({
          storyContent: storyContent,
          storyId: currentStoryId
        });
        
        if (characterResponse.saved) {
          setCurrentStory(prev => ({
            ...prev,
            characters: [...prev.characters, characterResponse]
          }));
        }
      }
      
      if (!currentStory.plot) {
        const plotResponse = await api.generatePlotFromStory({
          storyContent: storyContent,
          plotType: 'three-act',
          storyId: currentStoryId
        });
        
        if (plotResponse.saved) {
          setCurrentStory(prev => ({
            ...prev,
            plot: plotResponse
          }));
        }
      }
      if (currentStoryId) {
        await loadStory(currentStoryId);
      }
    } catch (error) {
      console.error('Error auto-generating content:', error);
    }
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
    setCurrentStoryId(null);
  };
  const saveStory = async () => {
    try {
      const storyContent = storyHistory.map(msg => `${msg.type === 'user' ? 'You' : 'Mythos AI'}: ${msg.content}`).join('\n\n');
      
      if (currentStoryId) {
        await api.updateStory(currentStoryId, {
          title: currentStory.title || 'Untitled Story',
          genre: currentStory.genre,
          content: storyContent
        });
        await loadStory(currentStoryId);
      } else {
        const response = await api.createStory({
          title: currentStory.title || 'Untitled Story',
          genre: currentStory.genre,
          content: storyContent,
          autoGenerate: autoGenerate
        });
        setCurrentStoryId(response.id);
        if (response.id) await loadStory(response.id);
      }
      
      setShowSaveAnimation(true);
    } catch (error) {
      console.error('Error saving story:', error);
    }
  };
  const manuallyGenerateCharacter = async () => {
    if (!currentStoryId) {
      alert('Please save your story first to generate characters.');
      return;
    }
    const characterName = prompt('Enter a character name (or leave blank for AI to generate):');
    const fullStoryContent = storyHistory
      .map(msg => `${msg.type === 'user' ? 'You' : 'Mythos AI'}: ${msg.content}`)
      .join('\n\n');
    try {
      const response = await api.generateCharacterFromStory({
        storyContent: fullStoryContent,
        characterName: characterName,
        storyId: currentStoryId
      });
      
      if (response.saved) {
        setCurrentStory(prev => ({
          ...prev,
          characters: [...prev.characters, response]
        }));
        if (currentStoryId) await loadStory(currentStoryId);
        alert(`Character "${response.name}" generated and saved!`);
      }
    } catch (error) {
      console.error('Error generating character:', error);
      alert('Error generating character. Please try again.');
    }
  };
  const manuallyGeneratePlot = async () => {
    if (!currentStoryId) {
      alert('Please save your story first to generate plots.');
      return;
    }
    const fullStoryContent = storyHistory
      .map(msg => `${msg.type === 'user' ? 'You' : 'Mythos AI'}: ${msg.content}`)
      .join('\n\n');
    try {
      const response = await api.generatePlotFromStory({
        storyContent: fullStoryContent,
        plotType: 'three-act',
        storyId: currentStoryId
      });
      
      if (response.saved) {
        setCurrentStory(prev => ({
          ...prev,
          plot: response
        }));
        if (currentStoryId) await loadStory(currentStoryId);
        alert(`Plot "${response.title}" generated and saved!`);
      }
    } catch (error) {
      console.error('Error generating plot:', error);
      alert('Error generating plot. Please try again.');
    }
  };
  const storyOptions = userStories.map(story => ({
    value: story.id,
    label: story.title
  }));
  const navigate = require('react-router-dom').useNavigate ? require('react-router-dom').useNavigate() : null;
  const [showSaveWarning, setShowSaveWarning] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);

  const handleNavigate = async (path) => {
    if (currentStoryId) {
      if (navigate) navigate(path);
      else window.location.href = path;
      return;
    }
    setPendingNav(path);
    setShowSaveWarning(true);
  };

  const confirmSaveAndNavigate = async () => {
    setShowSaveWarning(false);
    try {
      await saveStory();
      if (pendingNav) {
        if (navigate) navigate(pendingNav);
        else window.location.href = pendingNav;
      }
    } catch (e) {
      console.error('Error saving before navigation:', e);
      alert('Could not save the story. Please try again.');
    } finally {
      setPendingNav(null);
    }
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
              {currentStoryId ? 'Update Story' : 'Save Story'}
            </ScrollButton>
            <ScrollButton 
              variant="ghost"
              icon="LOAD"
              onClick={() => setShowStorySelector(!showStorySelector)}
            >
              Load Story
            </ScrollButton>
            <ScrollButton 
              variant="ghost"
              icon="CLEAR"
              onClick={clearStory}
            >
              Clear
            </ScrollButton>
            <ScrollButton 
              variant="ghost"
              icon="CHARACTER"
              onClick={manuallyGenerateCharacter}
              disabled={!currentStoryId}
            >
              Generate Character
            </ScrollButton>
            <ScrollButton 
              variant="ghost"
              icon="PLOT"
              onClick={manuallyGeneratePlot}
              disabled={!currentStoryId}
            >
              Generate Plot
            </ScrollButton>
          </div>
        </div>
        
        {showStorySelector && (
          <div className="story-selector">
            <h3>Select a Story to Continue</h3>
            {isLoadingStories ? (
              <div className="loading-stories">
                <InkLoader message="Loading your stories..." />
              </div>
            ) : userStories.length > 0 ? (
              <div className="stories-list">
                {userStories.map(story => (
                  <div 
                    key={story.id} 
                    className="story-item"
                    onClick={() => loadStory(story.id)}
                  >
                    <h4>{story.title}</h4>
                    <p className="story-genre">{story.genre || 'No genre'}</p>
                    <p className="story-date">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-stories">No stories found. Create your first story!</p>
            )}
            <ScrollButton 
              variant="ghost"
              icon="CLOSE"
              onClick={() => setShowStorySelector(false)}
            >
              Cancel
            </ScrollButton>
          </div>
        )}
        
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
            
            <div className="auto-generate-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={autoGenerate}
                  onChange={(e) => setAutoGenerate(e.target.checked)}
                />
                Auto-generate characters and plots
              </label>
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
          
          <div className="content-section">
            <div className="chat-section">
              <div className="chat-container" ref={chatContainerRef}>
                {storyHistory.length === 0 ? (
                  <div className="empty-chat">
                    <div className="empty-icon">STORY</div>
                    <h3>Begin Your Tale</h3>
                    <p>Start writing your story in the input area to the left. The AI will help you craft an amazing narrative!</p>
                    {autoGenerate && (
                      <p className="auto-generate-note">
                        Characters and plots will be automatically generated as you write.
                      </p>
                    )}
                    <p className="load-story-note">
                      Or use the "Load Story" button to continue an existing story.
                    </p>
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
            
            <div className="generated-content-sidebar">
              <div className="sidebar-section">
                <h3>Generated Characters</h3>
                {currentStory.characters.length > 0 ? (
                  <div className="characters-list">
                    {currentStory.characters.map((character, index) => (
                      <div key={index} className="character-item">
                        <h4>{character.name}</h4>
                        <p className="character-role">{character.role}</p>
                        <p className="character-description">{character.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-content-actions">
                    <div className="action-buttons">
                      <button className="btn btn-primary" onClick={() => handleNavigate('/characters')}>Go to Characters</button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="sidebar-section">
                <h3>Generated Plot</h3>
                {currentStory.plot ? (
                  <div className="plot-item">
                    <h4>{currentStory.plot.title}</h4>
                    <p className="plot-structure">{currentStory.plot.structure_type}</p>
                    <p className="plot-acts">{currentStory.plot.acts}</p>
                  </div>
                ) : (
                  <div className="no-content-actions">
                    <div className="action-buttons">
                      <button className="btn btn-primary" onClick={() => handleNavigate('/plot')}>Go to Plot Builder</button>
                    </div>
                  </div>
                )}
              </div>

              {showSaveWarning && (
                <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setShowSaveWarning(false)}>
                  <div className="modal-content card" onClick={e => e.stopPropagation()}>
                    <h3>Save Required</h3>
                    <p>You need to save your story before navigating. Changes will only be saved once the story is saved. Do you want to save now?</p>
                    <div className="form-actions">
                      <ScrollButton variant="secondary" onClick={confirmSaveAndNavigate}>Save and Continue</ScrollButton>
                      <ScrollButton variant="ghost" onClick={() => setShowSaveWarning(false)}>Cancel</ScrollButton>
                    </div>
                  </div>
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
  const normalized = typeof text === 'string' ? text : (text === undefined || text === null ? '' : String(text));
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [normalized]);

  useEffect(() => {
    if (!normalized) return;
    if (currentIndex < normalized.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + normalized[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, normalized]);

  return (
    <p className="typewriter-text">
      {displayedText}
      <span className="cursor">|</span>
    </p>
  );
};
export default StoryBuilder; 