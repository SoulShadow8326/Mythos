const express = require('express');
const router = express.Router();
const { runQuery, getRow, getAll } = require('../database');
const { authenticateToken } = require('../middleware/auth');
router.get('/', authenticateToken, async (req, res) => {
  try {
    const stories = await getAll(`
      SELECT 
        s.*,
        COUNT(c.id) as character_count,
        COUNT(t.id) as twist_count
      FROM stories s
      LEFT JOIN characters c ON s.id = c.story_id
      LEFT JOIN twists t ON s.id = t.story_id
      WHERE s.user_id = ?
      GROUP BY s.id
      ORDER BY s.updated_at DESC
    `, [req.user.id]);
    
    const parsedStories = stories.map(story => {
      let parsedContent = [];
      if (story.content) {
        try {
          parsedContent = JSON.parse(story.content);
        } catch (error) {
          if (typeof story.content === 'string' && story.content.trim()) {
            const lines = story.content.split('\n\n');
            parsedContent = lines.map(line => {
              if (line.startsWith('You: ')) {
                return {
                  type: 'user',
                  content: line.substring(5),
                  timestamp: story.createdAt || new Date().toISOString()
                };
              } else if (line.startsWith('Mythos AI: ')) {
                return {
                  type: 'ai',
                  content: line.substring(11),
                  timestamp: story.createdAt || new Date().toISOString()
                };
              } else if (line.trim()) {
                return {
                  type: 'ai',
                  content: line,
                  timestamp: story.createdAt || new Date().toISOString()
                };
              }
              return null;
            }).filter(msg => msg !== null && msg.content.trim());
          } else {
            parsedContent = [];
          }
        }
      }
      return {
        ...story,
        content: parsedContent
      };
    });
    
    res.json(parsedStories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const story = await getRow('SELECT * FROM stories WHERE id = ?', [id]);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const characters = await getAll('SELECT * FROM characters WHERE story_id = ?', [id]);
    const twists = await getAll('SELECT * FROM twists WHERE story_id = ?', [id]);
    
    let parsedContent = [];
    if (story.content) {
      try {
        parsedContent = JSON.parse(story.content);
      } catch (error) {
        if (typeof story.content === 'string' && story.content.trim()) {
          const lines = story.content.split('\n\n');
          parsedContent = lines.map(line => {
            if (line.startsWith('You: ')) {
              return {
                type: 'user',
                content: line.substring(5),
                timestamp: story.createdAt || new Date().toISOString()
              };
            } else if (line.startsWith('Mythos AI: ')) {
              return {
                type: 'ai',
                content: line.substring(11),
                timestamp: story.createdAt || new Date().toISOString()
              };
            } else if (line.trim()) {
              return {
                type: 'ai',
                content: line,
                timestamp: story.createdAt || new Date().toISOString()
              };
            }
            return null;
          }).filter(msg => msg !== null && msg.content.trim());
        } else {
          parsedContent = [];
        }
      }
    }
    
    const parsedStory = {
      ...story,
      content: parsedContent,
      characters,
      twists
    };
    
    res.json(parsedStory);
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, genre, content, autoGenerate } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await runQuery(`
      INSERT INTO stories (user_id, title, genre, content)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, title, genre || null, content || null]);
    
    const storyId = result.id;
    
    if (autoGenerate && content) {
      try {
        const geminiService = require('../services/geminiService');
        
        const characterData = await geminiService.generateCharacterFromStory(content);
        await runQuery(`
          INSERT INTO characters (user_id, story_id, name, role, age, origin, motivation, description, backstory, traits, relationships)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          req.user.id,
          storyId,
          characterData.name,
          characterData.role,
          characterData.age,
          characterData.origin,
          characterData.motivation,
          characterData.description,
          characterData.backstory,
          characterData.traits,
          characterData.relationships
        ]);
        
        const plotData = await geminiService.generatePlotFromStory(content);
        await runQuery(`
          INSERT INTO plots (user_id, story_id, title, structure_type, acts, branches)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          req.user.id,
          storyId,
          plotData.title,
          plotData.structure_type,
          plotData.acts,
          plotData.branches
        ]);
        
        console.log(`Auto-generated content for story ${storyId}: character "${characterData.name}" and plot "${plotData.title}"`);
      } catch (genError) {
        console.error('Error auto-generating content:', genError);
      }
    }
    
    const createdStory = await getRow('SELECT * FROM stories WHERE id = ?', [storyId]);
    
    res.status(201).json({
      id: storyId,
      ...createdStory,
      autoGenerated: autoGenerate
    });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, genre, content } = req.body;
    
    const story = await getRow('SELECT * FROM stories WHERE id = ?', [id]);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    await runQuery(
      'UPDATE stories SET title = ?, genre = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title || story.title, genre || story.genre, content || story.content, id]
    );
    
    const updatedStory = await getRow('SELECT * FROM stories WHERE id = ?', [id]);
    res.json(updatedStory);
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ error: 'Failed to update story' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const story = await getRow('SELECT * FROM stories WHERE id = ?', [id]);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    await runQuery('DELETE FROM stories WHERE id = ?', [id]);
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});
router.get('/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    
    const story = await getRow('SELECT * FROM stories WHERE id = ?', [id]);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const characters = await getAll('SELECT * FROM characters WHERE story_id = ?', [id]);
    const twists = await getAll('SELECT * FROM twists WHERE story_id = ?', [id]);
    
    let exportText = `Title: ${story.title}\n`;
    if (story.genre) exportText += `Genre: ${story.genre}\n`;
    exportText += `Created: ${story.created_at}\n\n`;
    
    if (story.content) {
      exportText += `STORY CONTENT:\n${story.content}\n\n`;
    }
    
    if (characters.length > 0) {
      exportText += `CHARACTERS:\n`;
      characters.forEach(char => {
        exportText += `\n${char.name}\n`;
        if (char.description) exportText += `Description: ${char.description}\n`;
        if (char.traits) exportText += `Traits: ${char.traits}\n`;
        if (char.background) exportText += `Background: ${char.background}\n`;
      });
      exportText += '\n';
    }
    
    if (twists.length > 0) {
      exportText += `PLOT TWISTS:\n`;
      twists.forEach(twist => {
        exportText += `\n${twist.title}\n`;
        if (twist.description) exportText += `Description: ${twist.description}\n`;
        if (twist.category) exportText += `Category: ${twist.category}\n`;
        if (twist.impact) exportText += `Impact: ${twist.impact}\n`;
      });
    }
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt"`);
    res.send(exportText);
  } catch (error) {
    console.error('Error exporting story:', error);
    res.status(500).json({ error: 'Failed to export story' });
  }
});
module.exports = router; 