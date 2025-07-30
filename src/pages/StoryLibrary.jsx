import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScrollButton from '../components/ScrollButton';
import CustomDropdown from '../components/CustomDropdown';
import CustomPopup from '../components/CustomPopup';
import './StoryLibrary.css';

const StoryLibrary = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = () => {
    const savedStories = JSON.parse(localStorage.getItem('mythos_stories') || '[]');
    setStories(savedStories);
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

  const confirmDelete = () => {
    if (storyToDelete) {
      const updatedStories = stories.filter(story => story.id !== storyToDelete.id);
      setStories(updatedStories);
      localStorage.setItem('mythos_stories', JSON.stringify(updatedStories));
      
      if (selectedStory && selectedStory.id === storyToDelete.id) {
        setSelectedStory(null);
      }
      setStoryToDelete(null);
      setShowDeletePopup(false);
    }
  };

  const exportStory = (story) => {
    const storyText = formatStoryForExport(story);
    const blob = new Blob([storyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportPopup(true);
  };

  const formatStoryForExport = (story) => {
    let exportText = `MYTHOS STORY EXPORT\n`;
    exportText += `Title: ${story.title}\n`;
    exportText += `Genre: ${story.genre || 'Not specified'}\n`;
    exportText += `Created: ${new Date(story.createdAt).toLocaleDateString()}\n`;
    exportText += `\n${'='.repeat(50)}\n\n`;
    
    if (story.content && story.content.length > 0) {
      story.content.forEach((message, index) => {
        exportText += `${message.type === 'user' ? 'You' : 'Mythos AI'}: ${message.content}\n\n`;
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
    if (story.content && story.content.length > 0) {
      const lastMessage = story.content[story.content.length - 1];
      return lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : '');
    }
    return 'No content available';
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
              {filteredStories.map(story => (
                <div 
                  key={story.id} 
                  className={`story-card card ${selectedStory?.id === story.id ? 'selected' : ''}`}
                  onClick={() => setSelectedStory(selectedStory?.id === story.id ? null : story)}
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
                    <p>{getStoryPreview(story)}</p>
                  </div>
                  
                  <div className="story-meta">
                    <span className="story-date">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </span>
                    <span className="story-messages">
                      {story.content?.length || 0} messages
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
                    <span className="info-value">{selectedStory.content?.length || 0}</span>
                  </div>
                </div>
                
                <div className="story-conversation">
                  <h3>Story Content</h3>
                  <div className="conversation-container">
                    {selectedStory.content && selectedStory.content.length > 0 ? (
                      selectedStory.content.map((message, index) => (
                        <div key={index} className={`conversation-message ${message.type}`}>
                          <div className="message-header">
                            <span className="message-author">
                              {message.type === 'user' ? 'You' : 'Mythos AI'}
                            </span>
                            <span className="message-time">{message.timestamp}</span>
                          </div>
                          <div className="message-content">
                            <p>{message.content}</p>
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
                    icon="📄"
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