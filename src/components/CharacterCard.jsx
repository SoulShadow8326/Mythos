import React, { useState } from 'react';
import './CharacterCard.css';
const CharacterCard = ({ character, onEdit, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  return (
    <div 
      className={`character-card ${isFlipped ? 'flipped' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleFlip}
    >
      <div className="card-inner">
        <div className="card-front">
          <div className="card-header">
            <h3 className="character-name">{character.name}</h3>
            <div className="character-role">{character.role}</div>
          </div>
          
          <div className="character-avatar">
            <div className="avatar-placeholder">
              {character.name.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="character-stats">
            <div className="stat-item">
              <span className="stat-label">Age:</span>
              <span className="stat-value">{character.age}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Origin:</span>
              <span className="stat-value">{character.origin}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Motivation:</span>
              <span className="stat-value">{character.motivation}</span>
            </div>
          </div>
          
          <div className="character-description">
            <p>{character.description}</p>
          </div>
          
          <div className="card-footer">
            <button 
              className="btn btn-ghost btn-small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(character);
              }}
            >
              Edit
            </button>
            <button 
              className="btn btn-ghost btn-small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(character.id);
              }}
            >
              Remove
            </button>
          </div>
        </div>
        
        <div className="card-back">
          <div className="back-header">
            <h4>Character Lore</h4>
          </div>
          
          <div className="backstory">
            <h5>Backstory</h5>
            <p>{character.backstory}</p>
          </div>
          
          <div className="personality">
            <h5>Personality Traits</h5>
            <div className="traits-list">
              {character.traits?.map((trait, index) => (
                <span key={index} className="trait-tag">{trait}</span>
              ))}
            </div>
          </div>
          
          <div className="relationships">
            <h5>Key Relationships</h5>
            <div className="relationships-list">
              {character.relationships?.map((rel, index) => (
                <div key={index} className="relationship-item">
                  <span className="rel-name">{rel.name}</span>
                  <span className="rel-type">{rel.type}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flip-hint">
            <span>Click to flip back</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CharacterCard; 