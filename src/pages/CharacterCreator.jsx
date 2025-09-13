import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import CharacterCard from '../components/CharacterCard';
import ScrollButton from '../components/ScrollButton';
import './CharacterCreator.css';

const CharacterCreator = () => {
  const { isAuthenticated } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (isAuthenticated) loadCharacters();
  }, [isAuthenticated]);

  const loadCharacters = async () => {
    setLoading(true);
    try {
      const response = await api.getAllCharacters();
      setCharacters(response || []);
    } catch (err) {
      console.error('Error loading characters:', err);
    } finally {
      setLoading(false);
    }
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
    const allTraits = ['Brave','Wise','Mysterious','Loyal','Cunning','Noble','Wild','Gentle','Fierce','Patient','Impulsive','Calculating','Charismatic','Reserved','Optimistic','Cynical','Curious','Cautious','Ambitious','Humble'];
    const numTraits = Math.floor(Math.random() * 4) + 3;
    return [...allTraits].sort(() => 0.5 - Math.random()).slice(0, numTraits);
  };

  const generateRelationships = () => {
    const relationshipTypes = ['Mentor','Rival','Friend','Lover','Enemy','Ally','Family'];
    const relationshipNames = ['Eldara','Thorne','Lyra','Kael','Mira','Darius','Sylva'];
    const num = Math.floor(Math.random() * 3) + 2;
    return Array.from({ length: num }).map(() => ({
      name: relationshipNames[Math.floor(Math.random() * relationshipNames.length)],
      type: relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)]
    }));
  };

  const generateCharacter = async () => {
    try {
      const aiResponse = await api.developCharacter({ characterName: currentCharacter.name, currentTraits: currentCharacter.description, storyContext: '' });
      const characterData = {
        ...currentCharacter,
        description: aiResponse?.description || currentCharacter.description,
        backstory: aiResponse?.background || generateBackstory(currentCharacter),
        traits: aiResponse?.traits ? aiResponse.traits.split(',').map(t => t.trim()) : generateTraits(currentCharacter),
        relationships: generateRelationships(currentCharacter)
      };
      const response = await api.createCharacter(characterData);
      setCharacters(prev => [response, ...prev]);
      setCurrentCharacter({ name: '', role: '', age: '', origin: '', motivation: '', description: '', backstory: '', traits: [], relationships: [] });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating character:', error);
      const characterData = { ...currentCharacter, backstory: generateBackstory(currentCharacter), traits: generateTraits(currentCharacter), relationships: generateRelationships(currentCharacter) };
      try {
        const response = await api.createCharacter(characterData);
        setCharacters(prev => [response, ...prev]);
        setCurrentCharacter({ name: '', role: '', age: '', origin: '', motivation: '', description: '', backstory: '', traits: [], relationships: [] });
        setShowForm(false);
      } catch (err) {
        console.error('Fallback save failed:', err);
      }
    }
  };

  const handleEdit = (character) => {
    setEditingCharacter(character);
    setCurrentCharacter({
      name: character.name || '',
      role: character.role || '',
      age: character.age || '',
      origin: character.origin || '',
      motivation: character.motivation || '',
      description: character.description || '',
      backstory: character.backstory || '',
      traits: safeParse(character.traits),
      relationships: safeParse(character.relationships)
    });
    const safeParse = (value) => {
      if (!value && value !== 0) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try { return JSON.parse(trimmed); } catch (e) { /* fallthrough */ }
        }
        return trimmed.split(',').map(s => s.trim()).filter(Boolean);
      }
      return [];
    };
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteCharacter(id);
      setCharacters(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleSave = async () => {
    if (editingCharacter) {
      try {
        const updated = await api.updateCharacter(editingCharacter.id, currentCharacter);
        setCharacters(prev => prev.map(c => c.id === editingCharacter.id ? updated : c));
        setEditingCharacter(null);
        setShowForm(false);
      } catch (err) {
        console.error('Error updating:', err);
      }
    } else {
      await generateCharacter();
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCharacter(null);
    setCurrentCharacter({ name: '', role: '', age: '', origin: '', motivation: '', description: '', backstory: '', traits: [], relationships: [] });
  };

  if (loading) return <div className="character-creator"><div className="loading-container"><div className="loading-spinner"/>Loading characters...</div></div>;

  return (
    <div className="character-creator">
      <div className="creator-container">
        <div className="creator-header">
          <h1>Character Creator</h1>
          <ScrollButton variant="primary" icon="CHAR" onClick={() => setShowForm(true)}>Create Character</ScrollButton>
        </div>

        <div className="creator-content">
          {/* Modal overlay for create/edit form */}
          {showForm && (
            <div className="modal-overlay" role="dialog" aria-modal="true" onClick={handleCancel}>
              <div className="modal-content card" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={handleCancel} aria-label="Close form">×</button>
                <div className="form-header"><h3>{editingCharacter ? 'Edit Character' : 'Create New Character'}</h3></div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" className="input" value={currentCharacter.name} onChange={e => setCurrentCharacter(prev => ({ ...prev, name: e.target.value }))} placeholder="Character name..." />
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <input type="text" className="input" value={currentCharacter.role} onChange={e => setCurrentCharacter(prev => ({ ...prev, role: e.target.value }))} placeholder="Hero, Villain, Mentor..." />
                  </div>

                  <div className="form-group">
                    <label>Age</label>
                    <input type="text" className="input" value={currentCharacter.age} onChange={e => setCurrentCharacter(prev => ({ ...prev, age: e.target.value }))} placeholder="25, Young, Ancient..." />
                  </div>

                  <div className="form-group">
                    <label>Origin</label>
                    <input type="text" className="input" value={currentCharacter.origin} onChange={e => setCurrentCharacter(prev => ({ ...prev, origin: e.target.value }))} placeholder="Kingdom, Realm, Village..." />
                  </div>

                  <div className="form-group">
                    <label>Motivation</label>
                    <input type="text" className="input" value={currentCharacter.motivation} onChange={e => setCurrentCharacter(prev => ({ ...prev, motivation: e.target.value }))} placeholder="Revenge, Love, Power..." />
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea className="textarea" value={currentCharacter.description} onChange={e => setCurrentCharacter(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe your character's appearance and personality..." />
                  </div>
                </div>

                <div className="form-actions">
                  <ScrollButton variant="secondary" icon="SAVE" onClick={handleSave} disabled={!currentCharacter.name || !currentCharacter.role}>{editingCharacter ? 'Update Character' : 'Generate Character'}</ScrollButton>
                  <ScrollButton variant="ghost" icon="https://www.svgrepo.com/show/522087/cross.svg" onClick={handleCancel}>Cancel</ScrollButton>
                </div>
              </div>
            </div>
          )}

          <div className="characters-grid">
            {characters.length > 0 ? characters.map(character => {
              const safeParse = (value) => {
                if (!value && value !== 0) return [];
                if (Array.isArray(value)) return value;
                if (typeof value === 'string') {
                  const trimmed = value.trim();
                  if (!trimmed) return [];
                  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                    try { return JSON.parse(trimmed); } catch (e) { /* fallthrough */ }
                  }
                  return trimmed.split(',').map(s => s.trim()).filter(Boolean);
                }
                return [];
              };
              return (
                <CharacterCard
                  key={character.id}
                  character={{
                    ...character,
                    traits: safeParse(character.traits),
                    relationships: safeParse(character.relationships)
                  }}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              );
            }) : (
              <div className="empty-characters">
                <div className="empty-icon">CHAR</div>
                <h3>No Characters Yet</h3>
                <p>Create your first character to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreator;