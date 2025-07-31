const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
router.get('/health', async (req, res) => {
  try {
    const testPrompt = "Respond with 'OK' if you can process this request. Do not use any emojis in your response.";
    const result = await geminiService.model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ 
      status: 'healthy',
      service: 'Gemini AI',
      response: text.trim(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI service health check failed:', error);
    
    if (error.message && error.message.includes('503 Service Unavailable')) {
      res.status(503).json({ 
        status: 'overloaded',
        service: 'Gemini AI',
        error: 'Service is currently overloaded',
        fallback: 'Fallback service available',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        status: 'unhealthy',
        service: 'Gemini AI',
        error: 'Service is not responding',
        fallback: 'Fallback service available',
        timestamp: new Date().toISOString()
      });
    }
  }
});
router.post('/continue-story', async (req, res) => {
  try {
    const { storyContent, direction, storyId } = req.body;
    
    if (!storyContent) {
      return res.status(400).json({ error: 'Story content is required' });
    }
    
    let existingCharacters = [];
    let existingPlots = [];
    let existingTwists = [];
    
    if (storyId) {
      try {
        const { getAll } = require('../database');
        existingCharacters = await getAll('SELECT * FROM characters WHERE story_id = ?', [storyId]);
        existingPlots = await getAll('SELECT * FROM plots WHERE story_id = ?', [storyId]);
        existingTwists = await getAll('SELECT * FROM twists WHERE story_id = ?', [storyId]);
      } catch (dbError) {
        console.error('Error fetching existing content:', dbError);
      }
    }
    
    const continuation = await geminiService.continueStory(storyContent, direction, existingCharacters, existingPlots, existingTwists);
    
    res.json({ continuation });
  } catch (error) {
    console.error('Error continuing story:', error);
    
    // Check if it's a service overload error
    if (error.message && error.message.includes('503 Service Unavailable')) {
      res.status(503).json({ 
        error: 'AI service is currently overloaded. Please try again in a few moments.',
        retryable: true 
      });
    } else {
      res.status(500).json({ error: 'Failed to continue story' });
    }
  }
});
router.post('/story-suggestions', async (req, res) => {
  try {
    const { genre, theme } = req.body;
    
    const suggestions = await geminiService.generateStorySuggestions(genre, theme);
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating story suggestions:', error);
    
    if (error.message && error.message.includes('503 Service Unavailable')) {
      res.status(503).json({ 
        error: 'AI service is currently overloaded. Please try again in a few moments.',
        retryable: true 
      });
    } else {
      res.status(500).json({ error: 'Failed to generate story suggestions' });
    }
  }
});
router.post('/develop-character', async (req, res) => {
  try {
    const { characterName, currentTraits, storyContext } = req.body;
    
    if (!characterName) {
      return res.status(400).json({ error: 'Character name is required' });
    }
    
    const characterData = await geminiService.developCharacter(characterName, currentTraits, storyContext);
    
    res.json(characterData);
  } catch (error) {
    console.error('Error developing character:', error);
    
    // Check if it's a service overload error
    if (error.message && error.message.includes('503 Service Unavailable')) {
      res.status(503).json({ 
        error: 'AI service is currently overloaded. Please try again in a few moments.',
        retryable: true 
      });
    } else {
      res.status(500).json({ error: 'Failed to develop character' });
    }
  }
});
router.post('/plot-twist', async (req, res) => {
  try {
    const { storyContext, genre } = req.body;
    
    const twistData = await geminiService.generatePlotTwist(storyContext, genre);
    
    res.json(twistData);
  } catch (error) {
    console.error('Error generating plot twist:', error);
    
    if (error.message && error.message.includes('503 Service Unavailable')) {
      res.status(503).json({ 
        error: 'AI service is currently overloaded. Please try again in a few moments.',
        retryable: true 
      });
    } else {
      res.status(500).json({ error: 'Failed to generate plot twist' });
    }
  }
});
router.post('/writing-assistant', async (req, res) => {
  try {
    const { prompt, context, type } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    let aiPrompt = '';
    
    switch (type) {
      case 'dialogue':
        aiPrompt = `Write engaging dialogue for this scenario: ${prompt}\n\nContext: ${context || 'No specific context provided'}\n\nMake the dialogue natural, character-driven, and advance the story.\n\nIMPORTANT: Do not use any emojis in your response.`;
        break;
      case 'description':
        aiPrompt = `Write a vivid description for: ${prompt}\n\nContext: ${context || 'No specific context provided'}\n\nMake it sensory, atmospheric, and engaging.\n\nIMPORTANT: Do not use any emojis in your response.`;
        break;
      case 'action':
        aiPrompt = `Write an action scene for: ${prompt}\n\nContext: ${context || 'No specific context provided'}\n\nMake it dynamic, fast-paced, and cinematic.\n\nIMPORTANT: Do not use any emojis in your response.`;
        break;
      case 'emotion':
        aiPrompt = `Write about this emotional moment: ${prompt}\n\nContext: ${context || 'No specific context provided'}\n\nMake it deeply felt and authentic.\n\nIMPORTANT: Do not use any emojis in your response.`;
        break;
      default:
        aiPrompt = `Help with writing: ${prompt}\n\nContext: ${context || 'No specific context provided'}\n\nIMPORTANT: Do not use any emojis in your response.`;
    }
    
    const text = await geminiService.generateContentWithRetry(aiPrompt);
    
    res.json({ 
      assistance: text.trim(),
      type: type || 'general'
    });
  } catch (error) {
    console.error('Error with writing assistant:', error);
    
    if (error.message && error.message.includes('503 Service Unavailable')) {
      res.status(503).json({ 
        error: 'AI service is currently overloaded. Please try again in a few moments.',
        retryable: true 
      });
    } else {
      res.status(500).json({ error: 'Failed to get writing assistance' });
    }
  }
});
router.post('/analyze-story', async (req, res) => {
  try {
    const { storyContent, focus } = req.body;
    
    if (!storyContent) {
      return res.status(400).json({ error: 'Story content is required' });
    }
    
    let analysisPrompt = `Analyze this story and provide constructive feedback:\n\n${storyContent}\n\n`;
    
    if (focus) {
      analysisPrompt += `Focus on: ${focus}\n\n`;
    }
    
    analysisPrompt += `Please provide:
    1. Overall assessment
    2. Strengths
    3. Areas for improvement
    4. Specific suggestions
    5. Writing style analysis
    
    Be constructive and encouraging while being honest about areas that need work.
    
    IMPORTANT: Do not use any emojis in your response.`;
    
    const text = await geminiService.generateContentWithRetry(analysisPrompt);
    
    res.json({ 
      analysis: text.trim(),
      focus: focus || 'general'
    });
  } catch (error) {
    console.error('Error analyzing story:', error);
    
    if (error.message && error.message.includes('503 Service Unavailable')) {
      res.status(503).json({ 
        error: 'AI service is currently overloaded. Please try again in a few moments.',
        retryable: true 
      });
    } else {
      res.status(500).json({ error: 'Failed to analyze story' });
    }
  }
});
router.post('/writing-prompts', async (req, res) => {
  try {
    const { genre, theme, difficulty } = req.body;
    
    let promptRequest = `Generate 5 creative writing prompts`;
    
    if (genre) promptRequest += ` in the ${genre} genre`;
    if (theme) promptRequest += ` with the theme of ${theme}`;
    if (difficulty) promptRequest += ` at ${difficulty} difficulty level`;
    
    promptRequest += `.\n\nEach prompt should be engaging, specific, and inspiring. Format as a JSON array with "prompt" and "description" fields.\n\nIMPORTANT: Do not use any emojis in your response.`;
    
    const text = await geminiService.generateContentWithRetry(promptRequest);
    
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const prompts = JSON.parse(jsonMatch[0]);
        res.json({ prompts });
      } else {
        const lines = text.split('\n').filter(line => line.trim());
        const prompts = lines.slice(0, 5).map((line, index) => ({
          prompt: line.replace(/^\d+\.\s*/, ''),
          description: `Creative writing prompt ${index + 1}`
        }));
        res.json({ prompts });
      }
    } catch (parseError) {
      console.error('Error parsing prompts JSON:', parseError);
      res.status(500).json({ error: 'Failed to parse writing prompts' });
    }
  } catch (error) {
    console.error('Error generating writing prompts:', error);
    
    // Check if it's a service overload error
    if (error.message && error.message.includes('503 Service Unavailable')) {
      res.status(503).json({ 
        error: 'AI service is currently overloaded. Please try again in a few moments.',
        retryable: true 
      });
    } else {
      res.status(500).json({ error: 'Failed to generate writing prompts' });
    }
  }
});
router.post('/generate-character-from-story', async (req, res) => {
  try {
    const { storyContent, characterName, storyId } = req.body;
    
    if (!storyContent) {
      return res.status(400).json({ error: 'Story content is required' });
    }
    
    const characterData = await geminiService.generateCharacterFromStory(storyContent, characterName);
    
    if (storyId && req.user) {
      try {
        const { runQuery } = require('../database');
        const result = await runQuery(`
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
        
        characterData.id = result.id;
        characterData.saved = true;
      } catch (dbError) {
        console.error('Error saving character to database:', dbError);
        characterData.saved = false;
      }
    }
    
    res.json(characterData);
  } catch (error) {
    console.error('Error generating character from story:', error);
    
    if (error.message && error.message.includes('503 Service Unavailable')) {
      res.status(503).json({ 
        error: 'AI service is currently overloaded. Please try again in a few moments.',
        retryable: true 
      });
    } else {
      res.status(500).json({ error: 'Failed to generate character' });
    }
  }
});
router.post('/generate-plot-from-story', async (req, res) => {
  try {
    const { storyContent, plotType, storyId } = req.body;
    
    if (!storyContent) {
      return res.status(400).json({ error: 'Story content is required' });
    }
    
    const plotData = await geminiService.generatePlotFromStory(storyContent, plotType);
    
    if (storyId && req.user) {
      try {
        const { runQuery } = require('../database');
        const result = await runQuery(`
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
        
        plotData.id = result.id;
        plotData.saved = true;
      } catch (dbError) {
        console.error('Error saving plot to database:', dbError);
        plotData.saved = false;
      }
    }
    
    res.json(plotData);
  } catch (error) {
    console.error('Error generating plot from story:', error);
    
    if (error.message && error.message.includes('503 Service Unavailable')) {
      res.status(503).json({ 
        error: 'AI service is currently overloaded. Please try again in a few moments.',
        retryable: true 
      });
    } else {
      res.status(500).json({ error: 'Failed to generate plot' });
    }
  }
});
module.exports = router; 