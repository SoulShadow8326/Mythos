const express = require('express');
const router = express.Router();
const { runQuery, getRow, getAll } = require('../database');
const { authenticateToken } = require('../middleware/auth');
router.get('/', authenticateToken, async (req, res) => {
  try {
    const plots = await getAll(
      'SELECT * FROM plots WHERE user_id = ? ORDER BY updated_at DESC',
      [req.user.id]
    );
    
    res.json(plots);
  } catch (error) {
    console.error('Error fetching plots:', error);
    res.status(500).json({ error: 'Failed to fetch plots' });
  }
});
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const plot = await getRow(
      'SELECT * FROM plots WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );
    
    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }
    
    if (plot.acts) plot.acts = JSON.parse(plot.acts);
    if (plot.branches) plot.branches = JSON.parse(plot.branches);
    
    res.json(plot);
  } catch (error) {
    console.error('Error fetching plot:', error);
    res.status(500).json({ error: 'Failed to fetch plot' });
  }
});
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { story_id, title, structure_type, acts, branches } = req.body;
    
    if (!title || !structure_type) {
      return res.status(400).json({ error: 'Title and structure type are required' });
    }
    
    const result = await runQuery(
      'INSERT INTO plots (user_id, story_id, title, structure_type, acts, branches) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        story_id || null,
        title,
        structure_type,
        acts ? JSON.stringify(acts) : null,
        branches ? JSON.stringify(branches) : null
      ]
    );
    
    const newPlot = await getRow('SELECT * FROM plots WHERE id = ?', [result.id]);
    res.status(201).json(newPlot);
  } catch (error) {
    console.error('Error creating plot:', error);
    res.status(500).json({ error: 'Failed to create plot' });
  }
});
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, structure_type, acts, branches } = req.body;
    
    const plot = await getRow(
      'SELECT * FROM plots WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );
    
    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }
    
    await runQuery(
      'UPDATE plots SET title = ?, structure_type = ?, acts = ?, branches = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        title || plot.title,
        structure_type || plot.structure_type,
        acts ? JSON.stringify(acts) : plot.acts,
        branches ? JSON.stringify(branches) : plot.branches,
        id
      ]
    );
    
    const updatedPlot = await getRow('SELECT * FROM plots WHERE id = ?', [id]);
    res.json(updatedPlot);
  } catch (error) {
    console.error('Error updating plot:', error);
    res.status(500).json({ error: 'Failed to update plot' });
  }
});
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const plot = await getRow(
      'SELECT * FROM plots WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );
    
    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }
    
    await runQuery('DELETE FROM plots WHERE id = ?', [id]);
    res.json({ message: 'Plot deleted successfully' });
  } catch (error) {
    console.error('Error deleting plot:', error);
    res.status(500).json({ error: 'Failed to delete plot' });
  }
});
module.exports = router; 