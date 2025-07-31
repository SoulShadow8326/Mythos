import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ScrollButton from '../components/ScrollButton';
import CustomDropdown from '../components/CustomDropdown';
import CustomPopup from '../components/CustomPopup';
import './StoryLibrary.css';
const StoryLibrary = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isAuthenticated) {
      loadStories();
    }
  }, [isAuthenticated]);
  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await api.getStories();
      console.log('Raw stories response:', response);
      
      
      const formattedStories = response.map(story => {
        console.log('Processing story:', story);
        
        let safeContent = [];
        if (story.content) {
          if (Array.isArray(story.content)) {
    
            safeContent = story.content.map(message => {
              if (message && typeof message === 'object') {
                return {
                  ...message,
                  content: message.content || 'No content',
                  type: message.type || 'user'
                };
              }
              return message;
            });
          } else if (typeof story.content === 'string') {
            try {
              const parsed = JSON.parse(story.content);
              if (Array.isArray(parsed)) {
        
                safeContent = parsed.map(message => {
                  if (message && typeof message === 'object') {
                    return {
                      ...message,
                      content: message.content || 'No content',
                      type: message.type || 'user'
                    };
                  }
                  return message;
                });
              } else {
                safeContent = [];
              }
            } catch (e) {
              safeContent = [];
            }
          }
        }
        
        return {
          ...story,
          content: safeContent,
  
          title: story.title || 'Untitled Story',
          genre: story.genre || 'Unknown',
          createdAt: story.createdAt || story.created_at || new Date().toISOString()
        };
      });
      
      console.log('Formatted stories:', formattedStories);
      setStories(formattedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !filterGenre || story.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });
  const deleteStory = (storyId) => {
    const story = stories.find(s => s.id === storyId);
    setStoryToDelete(story);
    setShowDeletePopup(true);
  };
  const confirmDelete = async () => {
    if (storyToDelete) {
      try {
        await api.deleteStory(storyToDelete.id);
        const updatedStories = stories.filter(story => story.id !== storyToDelete.id);
        setStories(updatedStories);
        
        if (selectedStory && selectedStory.id === storyToDelete.id) {
          setSelectedStory(null);
        }
        setStoryToDelete(null);
        setShowDeletePopup(false);
      } catch (error) {
        console.error('Error deleting story:', error);
      }
    }
  };
  const exportStory = async (story) => {
    try {
      await api.exportStory(story.id);
      setShowExportPopup(true);
    } catch (error) {
      console.error('Error exporting story:', error);
    }
  };
  const formatStoryForExport = (story) => {
    let exportText = `MYTHOS STORY EXPORT\n`;
    exportText += `Title: ${story.title}\n`;
    exportText += `Genre: ${story.genre || 'Not specified'}\n`;
    exportText += `Created: ${new Date(story.createdAt).toLocaleDateString()}\n`;
    exportText += `\n${'='.repeat(50)}\n\n`;
    
    if (story.content && Array.isArray(story.content) && story.content.length > 0) {
      story.content.forEach((message, index) => {
        exportText += `${message.type === 'user' ? 'You' : 'Mythos AI'}: ${message.content || 'No content'}\n\n`;
      });
    }
    
    return exportText;
  };
  const getGenreColor = (genre) => {
    const colors = {
      fantasy: '#8b2635',
      mystery: '#2c3e50',
      romance: '#e74c3c',
      adventure: '#27ae60',
      scifi: '#3498db',
      horror: '#8e44ad'
    };
    return colors[genre] || '#95a5a6';
  };
  const getStoryPreview = (story) => {
    try {
      console.log('getStoryPreview called with:', story);
      
      if (!story || !story.content) {
        return 'No content available';
      }
      
      console.log('Story content type:', typeof story.content, 'Content:', story.content);
      
      if (Array.isArray(story.content) && story.content.length > 0) {
        const firstMessage = story.content[0];
        console.log('First message:', firstMessage);
        
        if (firstMessage && firstMessage.content) {
  
          let content = firstMessage.content;
          if (content === null || content === undefined) {
            return 'No content available';
          }
          content = String(content);
          console.log('Content to substring:', content, 'Type:', typeof content);
          
  
          if (typeof content === 'string' && content.substring) {
            return content.substring(0, 100) + (content.length > 100 ? '...' : '');
          } else {
            return 'Invalid content format';
          }
        }
      }
      
      
      if (typeof story.content === 'string') {
        const content = String(story.content || '');
        console.log('String content to substring:', content, 'Type:', typeof content);
        if (typeof content === 'string' && content.substring) {
          return content.substring(0, 100) + (content.length > 100 ? '...' : '');
        } else {
          return 'Invalid content format';
        }
      }
      
      
      const content = String(story.content || '');
      console.log('Final fallback content to substring:', content, 'Type:', typeof content);
      if (typeof content === 'string' && content.substring) {
        return content.substring(0, 100) + (content.length > 100 ? '...' : '');
      } else {
        return 'Invalid content format';
      }
    } catch (error) {
      console.error('Error in getStoryPreview:', error, story);
      return 'Error loading preview';
    }
  };
  return (
    <div className="story-library">
      <div className="library-container">
        <div className="library-header">
          <h1>Story Library</h1>
          <div className="library-controls">
            <input
              type="text"
              className="input search-input"
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CustomDropdown
              value={filterGenre}
              onChange={(value) => setFilterGenre(value)}
              placeholder="All Genres"
              options={[
                { value: "", label: "All Genres" },
                { value: "fantasy", label: "Fantasy" },
                { value: "mystery", label: "Mystery" },
                { value: "romance", label: "Romance" },
                { value: "adventure", label: "Adventure" },
                { value: "scifi", label: "Science Fiction" },
                { value: "horror", label: "Horror" }
              ]}
            />
                        <ScrollButton 
              variant="primary"
              icon="WRITE"
              onClick={() => navigate('/story')}
            >
              New Story
            </ScrollButton>
          </div>
        </div>
        
        <div className="library-content">
          {filteredStories.length > 0 ? (
            <div className="stories-grid">
              {filteredStories.map((story, index) => (
                <div 
                  key={story.id} 
                  className={`story-card card ${selectedStory?.id === story.id ? 'selected' : ''}`}
                  onClick={() => setSelectedStory(selectedStory?.id === story.id ? null : story)}
                  style={{ '--story-index': index }}
                >
                  <div className="story-card-header">
                    <h3 className="story-title">{story.title}</h3>
                    {story.genre && (
                      <span 
                        className="story-genre-tag"
                        style={{ backgroundColor: getGenreColor(story.genre) }}
                      >
                        {story.genre}
                      </span>
                    )}
                  </div>
                  
                  <div className="story-preview">
                    <p>
                      {(() => {
                        try {
                          return getStoryPreview(story);
                        } catch (error) {
                          console.error('Error calling getStoryPreview:', error, story);
                          return 'Error loading preview';
                        }
                      })()}
                    </p>
                  </div>
                  
                  <div className="story-meta">
                    <span className="story-date">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </span>
                    <span className="story-messages">
                      {Array.isArray(story.content) ? story.content.length : 0} messages
                    </span>
                  </div>
                  
                  <div className="story-actions">
                    <button 
                      className="action-btn edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/story');
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStory(story.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-library">
              <div className="empty-icon">LIBRARY</div>
              <h3>No Stories Found</h3>
              <p>
                {stories.length === 0 
                  ? "You haven't created any stories yet. Start writing your first tale!"
                  : "No stories match your search criteria."
                }
              </p>
              {stories.length === 0 && (
                <ScrollButton 
                  variant="primary"
                  icon="WRITE"
                  onClick={() => navigate('/story')}
                >
                  Create Your First Story
                </ScrollButton>
              )}
            </div>
          )}
          
          {selectedStory && (
            <div className="story-details">
              <div className="details-header">
                <h2>{selectedStory.title}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedStory(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="details-content">
                <div className="story-info">
                  <div className="info-item">
                    <span className="info-label">Genre:</span>
                    <span className="info-value">{selectedStory.genre || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Created:</span>
                    <span className="info-value">
                      {new Date(selectedStory.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Messages:</span>
                    <span className="info-value">{Array.isArray(selectedStory.content) ? selectedStory.content.length : 0}</span>
                  </div>
                </div>
                
                <div className="story-conversation">
                  <h3>Story Content</h3>
                  <div className="conversation-container">
                    {selectedStory.content && Array.isArray(selectedStory.content) && selectedStory.content.length > 0 ? (
                      selectedStory.content.map((message, index) => (
                        <div key={index} className={`conversation-message ${message.type || 'user'}`}>
                          <div className="message-header">
                            <span className="message-author">
                              {message.type === 'user' ? 'You' : 'Mythos AI'}
                            </span>
                            <span className="message-time">{message.timestamp || 'Unknown time'}</span>
                          </div>
                          <div className="message-content">
                            <p>{message.content || 'No content'}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-content">No story content available.</p>
                    )}
                  </div>
                </div>
                
                <div className="details-actions">
                  <ScrollButton 
                    variant="secondary"
                    icon="Story"
                    onClick={() => exportStory(selectedStory)}
                  >
                    Export Story
                  </ScrollButton>
                  <ScrollButton 
                    variant="ghost"
                    icon="DELETE"
                    onClick={() => deleteStory(selectedStory.id)}
                  >
                    Delete Story
                  </ScrollButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <CustomPopup
        isOpen={showDeletePopup}
        onClose={() => {
          setShowDeletePopup(false);
          setStoryToDelete(null);
        }}
        title="Delete Story"
        message={`Are you sure you want to delete "${storyToDelete?.title}"? This action cannot be undone.`}
        icon=""
        buttonText="Delete"
        onConfirm={confirmDelete}
      />
      
      <CustomPopup
        isOpen={showExportPopup}
        onClose={() => setShowExportPopup(false)}
        title="Story Exported!"
        message="Your story has been successfully exported as a text file."
        icon=""
        buttonText="OK"
      />
    </div>
  );
};
export default StoryLibrary; 