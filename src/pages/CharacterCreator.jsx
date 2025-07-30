import React, { useState } from 'react';
import CharacterCard from '../components/CharacterCard';
import ScrollButton from '../components/ScrollButton';
import './CharacterCreator.css';

const CharacterCreator = () => {
  const [characters, setCharacters] = useState([]);
  const [currentCharacter, setCurrentCharacter] = useState({
    name: '',
    role: '',
    age: '',
    origin: '',
    motivation: '',
    description: '',
    backstory: '',
    traits: [],
    relationships: []
  });
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const generateCharacter = async () => {
    const characterData = {
      ...currentCharacter,
      id: Date.now(),
      backstory: generateBackstory(currentCharacter),
      traits: generateTraits(currentCharacter),
      relationships: generateRelationships(currentCharacter)
    };
    
    setCharacters(prev => [...prev, characterData]);
    setCurrentCharacter({
      name: '',
      role: '',
      age: '',
      origin: '',
      motivation: '',
      description: '',
      backstory: '',
      traits: [],
      relationships: []
    });
    setShowForm(false);
  };

  const generateBackstory = (character) => {
    const backstories = [
      `Born in the mystical lands of ${character.origin || 'an ancient realm'}, ${character.name || 'this character'} has always been driven by ${character.motivation || 'a deep sense of purpose'}. Their journey began when they discovered their true calling as ${character.role || 'a guardian of ancient secrets'}.`,
      `${character.name || 'This mysterious figure'} emerged from the shadows of ${character.origin || 'a forgotten kingdom'}, carrying the weight of ${character.motivation || 'destiny'} on their shoulders. At ${character.age || 'a young age'}, they learned the ways of ${character.role || 'their chosen path'}.`,
      `The tale of ${character.name || 'this legendary being'} begins in ${character.origin || 'a world of wonder'}, where they were shaped by ${character.motivation || 'forces beyond mortal understanding'}. Their role as ${character.role || 'a keeper of balance'} defines their every action.`,
      `From the depths of ${character.origin || 'an enchanted forest'} came ${character.name || 'a soul touched by magic'}, whose ${character.motivation || 'unwavering determination'} led them to become ${character.role || 'a master of their craft'}. Their ${character.age || 'years of experience'} have taught them wisdom beyond measure.`
    ];
    
    return backstories[Math.floor(Math.random() * backstories.length)];
  };

  const generateTraits = (character) => {
    const allTraits = [
      'Brave', 'Wise', 'Mysterious', 'Loyal', 'Cunning', 'Noble', 'Wild', 'Gentle',
      'Fierce', 'Patient', 'Impulsive', 'Calculating', 'Charismatic', 'Reserved',
      'Optimistic', 'Cynical', 'Curious', 'Cautious', 'Ambitious', 'Humble'
    ];
    
    const numTraits = Math.floor(Math.random() * 4) + 3;
    const shuffled = allTraits.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numTraits);
  };

  const generateRelationships = (character) => {
    const relationshipTypes = ['Mentor', 'Rival', 'Friend', 'Lover', 'Enemy', 'Ally', 'Family'];
    const relationshipNames = ['Eldara', 'Thorne', 'Lyra', 'Kael', 'Mira', 'Darius', 'Sylva'];
    
    const numRelationships = Math.floor(Math.random() * 3) + 2;
    const relationships = [];
    
    for (let i = 0; i < numRelationships; i++) {
      relationships.push({
        name: relationshipNames[Math.floor(Math.random() * relationshipNames.length)],
        type: relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)]
      });
    }
    
    return relationships;
  };

  const handleEdit = (character) => {
    setEditingCharacter(character);
    setCurrentCharacter(character);
    setShowForm(true);
  };

  const handleDelete = (characterId) => {
    setCharacters(prev => prev.filter(char => char.id !== characterId));
  };

  const handleSave = () => {
    if (editingCharacter) {
      setCharacters(prev => prev.map(char => 
        char.id === editingCharacter.id 
          ? { ...currentCharacter, id: char.id }
          : char
      ));
      setEditingCharacter(null);
    } else {
      generateCharacter();
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCharacter(null);
    setCurrentCharacter({
      name: '',
      role: '',
      age: '',
      origin: '',
      motivation: '',
      description: '',
      backstory: '',
      traits: [],
      relationships: []
    });
  };

  return (
    <div className="character-creator">
      <div className="creator-container">
        <div className="creator-header">
          <h1>Character Creator</h1>
          <ScrollButton 
            variant="primary"
                            icon="CHAR"
            onClick={() => setShowForm(true)}
          >
            Create New Character
          </ScrollButton>
        </div>
        
        {showForm && (
          <div className="character-form card">
            <h2>{editingCharacter ? 'Edit Character' : 'Create New Character'}</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  className="input"
                  value={currentCharacter.name}
                  onChange={(e) => setCurrentCharacter(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Character name..."
                />
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  className="input"
                  value={currentCharacter.role}
                  onChange={(e) => setCurrentCharacter(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="Hero, Villain, Mentor..."
                />
              </div>
              
              <div className="form-group">
                <label>Age</label>
                <input
                  type="text"
                  className="input"
                  value={currentCharacter.age}
                  onChange={(e) => setCurrentCharacter(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="25, Young, Ancient..."
                />
              </div>
              
              <div className="form-group">
                <label>Origin</label>
                <input
                  type="text"
                  className="input"
                  value={currentCharacter.origin}
                  onChange={(e) => setCurrentCharacter(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="Kingdom, Realm, Village..."
                />
              </div>
              
              <div className="form-group">
                <label>Motivation</label>
                <input
                  type="text"
                  className="input"
                  value={currentCharacter.motivation}
                  onChange={(e) => setCurrentCharacter(prev => ({ ...prev, motivation: e.target.value }))}
                  placeholder="Revenge, Love, Power..."
                />
              </div>
              
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  className="textarea"
                  value={currentCharacter.description}
                  onChange={(e) => setCurrentCharacter(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your character's appearance and personality..."
                />
              </div>
            </div>
            
            <div className="form-actions">
              <ScrollButton 
                variant="secondary"
                icon="SAVE"
                onClick={handleSave}
                disabled={!currentCharacter.name || !currentCharacter.role}
              >
                {editingCharacter ? 'Update Character' : 'Generate Character'}
              </ScrollButton>
              <ScrollButton 
                variant="ghost"
                icon="https://www.svgrepo.com/show/522087/cross.svg"
                onClick={handleCancel}
              >
                Cancel
              </ScrollButton>
            </div>
          </div>
        )}
        
        <div className="characters-grid">
          {characters.map(character => (
            <CharacterCard
              key={character.id}
              character={character}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
        
        {characters.length === 0 && !showForm && (
          <div className="empty-state">
                            <div className="empty-icon">CHAR</div>
            <h3>No Characters Yet</h3>
            <p>Create your first character to begin building your story's cast!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterCreator; 