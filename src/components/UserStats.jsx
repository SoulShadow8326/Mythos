import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './UserStats.css';
const UserStats = ({ isVisible, onClose }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStories: 0,
    totalCharacters: 0,
    totalPlots: 0,
    totalTwists: 0,
    averageStoryLength: 0,
    favoriteGenre: 'None',
    joinDate: null
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (isVisible && user) {
      loadUserStats();
    }
  }, [isVisible, user]);
  const loadUserStats = async () => {
    try {
      setLoading(true);
      
      const [stories, characters, plots, twists] = await Promise.all([
        api.getStories(),
        api.getAllCharacters(),
        api.getPlots(),
        api.getTwists()
      ]);
      const totalStories = stories.length;
      const totalCharacters = characters.length;
      const totalPlots = plots.length;
      const totalTwists = twists.length;
      let totalLength = 0;
      let validStories = 0;
      stories.forEach(story => {
        if (story.content && Array.isArray(story.content)) {
          totalLength += story.content.length;
          validStories++;
        }
      });
      const averageStoryLength = validStories > 0 ? Math.round(totalLength / validStories) : 0;
      const genreCounts = {};
      stories.forEach(story => {
        if (story.genre) {
          genreCounts[story.genre] = (genreCounts[story.genre] || 0) + 1;
        }
      });
      const favoriteGenre = Object.keys(genreCounts).length > 0 
        ? Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b)
        : 'None';
      setStats({
        totalStories,
        totalCharacters,
        totalPlots,
        totalTwists,
        averageStoryLength,
        favoriteGenre,
        joinDate: user.createdAt || new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  if (!isVisible) return null;
  return (
    <div className="user-stats-overlay" onClick={onClose}>
      <div className="user-stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stats-header">
          <h2>Writer Profile</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="user-info">
          <div className="user-avatar">
            <span>{user?.username?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="user-details">
            <h3>{user?.username}</h3>
            <p className="join-date">Member since {formatDate(stats.joinDate)}</p>
          </div>
        </div>
        {loading ? (
          <div className="stats-loading">
            <div className="loading-spinner"></div>
            <p>Loading your stats...</p>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">S</div>
              <div className="stat-content">
                <h4>Stories Created</h4>
                <span className="stat-number">{stats.totalStories}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">C</div>
              <div className="stat-content">
                <h4>Characters</h4>
                <span className="stat-number">{stats.totalCharacters}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">P</div>
              <div className="stat-content">
                <h4>Plot Structures</h4>
                <span className="stat-number">{stats.totalPlots}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">T</div>
              <div className="stat-content">
                <h4>Plot Twists</h4>
                <span className="stat-number">{stats.totalTwists}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">L</div>
              <div className="stat-content">
                <h4>Avg. Story Length</h4>
                <span className="stat-number">{stats.averageStoryLength} messages</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">G</div>
              <div className="stat-content">
                <h4>Favorite Genre</h4>
                <span className="stat-genre">
                  {stats.favoriteGenre}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="stats-footer">
          <p>Keep writing and watch your stats grow</p>
        </div>
      </div>
    </div>
  );
};
export default UserStats; 