const express = require('express');
const router = express.Router();
const { runQuery, getRow, getAll } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const geminiService = require('../services/geminiService');
router.get('/', authenticateToken, async (req, res) => {
  try {
    const twists = await getAll(
      'SELECT * FROM twists WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json(twists);
  } catch (error) {
    console.error('Error fetching twists:', error);
    res.status(500).json({ error: 'Failed to fetch twists' });
  }
});
router.get('/story/:storyId', authenticateToken, async (req, res) => {
  try {
    const { storyId } = req.params;
    
    const twists = await getAll(
      'SELECT * FROM twists WHERE story_id = ? AND user_id = ? ORDER BY created_at DESC',
      [storyId, req.user.id]
    );
    
    res.json(twists);
  } catch (error) {
    console.error('Error fetching twists:', error);
    res.status(500).json({ error: 'Failed to fetch twists' });
  }
});
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const twist = await getRow(
      'SELECT * FROM twists WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );
    
    if (!twist) {
      return res.status(404).json({ error: 'Twist not found' });
    }
    
    res.json(twist);
  } catch (error) {
    console.error('Error fetching twist:', error);
    res.status(500).json({ error: 'Failed to fetch twist' });
  }
});
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { story_id, title, description, category, impact, icon } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await runQuery(
      'INSERT INTO twists (user_id, story_id, title, description, category, impact, icon) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        story_id || null,
        title,
        description || null,
        category || null,
        impact || null,
        icon || null
      ]
    );
    
    const newTwist = await getRow('SELECT * FROM twists WHERE id = ?', [result.id]);
    res.status(201).json(newTwist);
  } catch (error) {
    console.error('Error creating twist:', error);
    res.status(500).json({ error: 'Failed to create twist' });
  }
});
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, impact, icon } = req.body;
    
    const twist = await getRow(
      'SELECT * FROM twists WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );
    
    if (!twist) {
      return res.status(404).json({ error: 'Twist not found' });
    }
    
    await runQuery(
      'UPDATE twists SET title = ?, description = ?, category = ?, impact = ?, icon = ? WHERE id = ?',
      [
        title || twist.title,
        description || twist.description,
        category || twist.category,
        impact || twist.impact,
        icon || twist.icon,
        id
      ]
    );
    
    const updatedTwist = await getRow('SELECT * FROM twists WHERE id = ?', [id]);
    res.json(updatedTwist);
  } catch (error) {
    console.error('Error updating twist:', error);
    res.status(500).json({ error: 'Failed to update twist' });
  }
});
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const twist = await getRow(
      'SELECT * FROM twists WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );
    
    if (!twist) {
      return res.status(404).json({ error: 'Twist not found' });
    }
    
    await runQuery('DELETE FROM twists WHERE id = ?', [id]);
    res.json({ message: 'Twist deleted successfully' });
  } catch (error) {
    console.error('Error deleting twist:', error);
    res.status(500).json({ error: 'Failed to delete twist' });
  }
});
router.post('/generate', async (req, res) => {
  try {
    const { storyContext, currentTwists } = req.body;
    
    const twistData = await geminiService.generatePlotTwist(storyContext, currentTwists);
    
    res.json(twistData);
  } catch (error) {
    console.error('Error generating twist:', error);
    
    if (error.message && error.message.includes('503 Service Unavailable')) {
      res.status(503).json({ 
        error: 'AI service is currently overloaded. Please try again in a few moments.',
        retryable: true 
      });
    } else {
      res.status(500).json({ error: 'Failed to generate twist' });
    }
  }
});
router.post('/generate-and-save', authenticateToken, async (req, res) => {
  try {
    const { story_id, storyContext, currentTwists } = req.body;
    
    const twistData = await geminiService.generatePlotTwist(storyContext, currentTwists);
    
    const result = await runQuery(
      'INSERT INTO twists (user_id, story_id, title, description, category, impact, icon) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        story_id || null,
        twistData.title,
        twistData.description,
        twistData.category,
        twistData.impact,
        twistData.icon
      ]
    );
    
    const newTwist = await getRow('SELECT * FROM twists WHERE id = ?', [result.id]);
    res.status(201).json(newTwist);
  } catch (error) {
    console.error('Error generating and saving twist:', error);
      
    if (error.message && error.message.includes('503 Service Unavailable')) {
      res.status(503).json({ 
        error: 'AI service is currently overloaded. Please try again in a few moments.',
        retryable: true 
      });
    } else {
      res.status(500).json({ error: 'Failed to generate and save twist' });
    }
  }
});
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await getRow(`
      SELECT 
        COUNT(*) as total_twists,
        COUNT(DISTINCT story_id) as stories_with_twists,
        COUNT(CASE WHEN category = 'Plot' THEN 1 END) as plot_twists,
        COUNT(CASE WHEN category = 'Character' THEN 1 END) as character_twists,
        COUNT(CASE WHEN category = 'Setting' THEN 1 END) as setting_twists,
        COUNT(CASE WHEN category = 'Theme' THEN 1 END) as theme_twists,
        COUNT(CASE WHEN impact = 'High' THEN 1 END) as high_impact,
        COUNT(CASE WHEN impact = 'Medium' THEN 1 END) as medium_impact,
        COUNT(CASE WHEN impact = 'Low' THEN 1 END) as low_impact
      FROM twists
    `);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching twist stats:', error);
    res.status(500).json({ error: 'Failed to fetch twist statistics' });
  }
});
module.exports = router; 