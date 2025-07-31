const express = require('express');
const router = express.Router();
const { runQuery, getRow, getAll } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const geminiService = require('../services/geminiService');
router.get('/', authenticateToken, async (req, res) => {
  try {
    const characters = await getAll(
      'SELECT * FROM characters WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});
router.get('/story/:storyId', authenticateToken, async (req, res) => {
  try {
    const { storyId } = req.params;
    
    const characters = await getAll(
      'SELECT * FROM characters WHERE story_id = ? AND user_id = ? ORDER BY created_at DESC',
      [storyId, req.user.id]
    );
    
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const character = await getRow(
      'SELECT * FROM characters WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { story_id, name, role, age, origin, motivation, description, backstory, traits, relationships } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = await runQuery(
      'INSERT INTO characters (user_id, story_id, name, role, age, origin, motivation, description, backstory, traits, relationships) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        story_id || null,
        name,
        role || null,
        age || null,
        origin || null,
        motivation || null,
        description || null,
        backstory || null,
        traits ? JSON.stringify(traits) : null,
        relationships ? JSON.stringify(relationships) : null
      ]
    );
    
    const newCharacter = await getRow('SELECT * FROM characters WHERE id = ?', [result.id]);
    res.status(201).json(newCharacter);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, age, origin, motivation, description, backstory, traits, relationships } = req.body;
    
    const character = await getRow(
      'SELECT * FROM characters WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    await runQuery(
      'UPDATE characters SET name = ?, role = ?, age = ?, origin = ?, motivation = ?, description = ?, backstory = ?, traits = ?, relationships = ? WHERE id = ?',
      [
        name || character.name,
        role || character.role,
        age || character.age,
        origin || character.origin,
        motivation || character.motivation,
        description || character.description,
        backstory || character.backstory,
        traits ? JSON.stringify(traits) : character.traits,
        relationships ? JSON.stringify(relationships) : character.relationships,
        id
      ]
    );
    
    const updatedCharacter = await getRow('SELECT * FROM characters WHERE id = ?', [id]);
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
});
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const character = await getRow(
      'SELECT * FROM characters WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    await runQuery('DELETE FROM characters WHERE id = ?', [id]);
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});
router.post('/generate', async (req, res) => {
  try {
    const { characterName, storyContext, currentTraits } = req.body;
    
    if (!characterName) {
      return res.status(400).json({ error: 'Character name is required' });
    }
    
    const characterData = await geminiService.developCharacter(characterName, currentTraits, storyContext);
    
    res.json(characterData);
  } catch (error) {
    console.error('Error generating character:', error);
    res.status(500).json({ error: 'Failed to generate character' });
  }
});
router.post('/generate-and-save', authenticateToken, async (req, res) => {
  try {
    const { story_id, characterName, storyContext, currentTraits } = req.body;
    
    if (!characterName) {
      return res.status(400).json({ error: 'Character name is required' });
    }
    
    const characterData = await geminiService.developCharacter(characterName, currentTraits, storyContext);
    
    const result = await runQuery(
      'INSERT INTO characters (user_id, story_id, name, description, traits, background) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        story_id || null,
        characterName,
        characterData.description,
        characterData.traits,
        characterData.background
      ]
    );
    
    const newCharacter = await getRow('SELECT * FROM characters WHERE id = ?', [result.id]);
    res.status(201).json(newCharacter);
  } catch (error) {
    console.error('Error generating and saving character:', error);
    res.status(500).json({ error: 'Failed to generate and save character' });
  }
});
module.exports = router; 