const { GoogleGenerativeAI } = require('@google/generative-ai');
const fallbackService = require('./fallbackService');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000, useFallback = true) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isServiceUnavailable = error.message && 
        (error.message.includes('503 Service Unavailable') || 
         error.message.includes('The model is overloaded') ||
         error.code === 503);
      
      if (isServiceUnavailable && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`API overloaded (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (useFallback && attempt === maxRetries) {
        console.log('All retries exhausted, using fallback service...');
        return null;
      }
      
      throw error;
    }
  }
}
class GeminiService {
  constructor() {
    this.model = model;
  }
  async generatePlotTwist(storyContext = '', genre = '') {
    const result = await retryWithBackoff(async () => {
              const prompt = `
          Generate a creative plot twist for a story. 
          ${storyContext ? `Story context: ${storyContext}` : ''}
          ${genre ? `Genre: ${genre}` : ''}
          
          Please provide:
          1. A compelling title for the twist
          2. A detailed description of the twist
          3. The category (Character, Plot, Setting, or Theme)
          4. The impact level (Low, Medium, or High)
          5. A short icon representation (use text symbols, not emojis)
          
          IMPORTANT: Do not use any emojis in your response. Use only text and symbols.
          
          Format the response as JSON:
          {
            "title": "Twist Title",
            "description": "Detailed description of the twist...",
            "category": "Plot",
            "impact": "Medium",
            "icon": "~"
          }
        `;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
      }
      return this.parseTwistResponse(text);
    });
    
    if (result === null) {
      console.log('Using fallback service for plot twist generation');
      return fallbackService.generatePlotTwist(storyContext, genre);
    }
    
    return result;
  }
  parseTwistResponse(text) {
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      title: lines.find(line => line.includes('Title:') || line.includes('title:'))?.split(':')[1]?.trim() || 'Unexpected Twist',
      description: lines.find(line => line.includes('Description:') || line.includes('description:'))?.split(':')[1]?.trim() || 'A surprising turn of events that changes everything.',
      category: lines.find(line => line.includes('Category:') || line.includes('category:'))?.split(':')[1]?.trim() || 'Plot',
      impact: lines.find(line => line.includes('Impact:') || line.includes('impact:'))?.split(':')[1]?.trim() || 'Medium',
      icon: lines.find(line => line.includes('Icon:') || line.includes('icon:'))?.split(':')[1]?.trim() || '~'
    };
  }
  async continueStory(storyContent, direction = '', existingCharacters = [], existingPlots = [], existingTwists = []) {
    const result = await retryWithBackoff(async () => {
      let contextPrompt = '';
      
      if (existingCharacters && existingCharacters.length > 0) {
        contextPrompt += '\n\nEXISTING CHARACTERS:\n';
        existingCharacters.forEach(char => {
          contextPrompt += `- ${char.name}: ${char.description || 'No description'}\n`;
          if (char.traits) contextPrompt += `  Traits: ${char.traits}\n`;
          if (char.motivation) contextPrompt += `  Motivation: ${char.motivation}\n`;
        });
      }
      
      if (existingPlots && existingPlots.length > 0) {
        contextPrompt += '\n\nEXISTING PLOT ELEMENTS:\n';
        existingPlots.forEach(plot => {
          contextPrompt += `- ${plot.title}: ${plot.acts || 'No structure'}\n`;
        });
      }
      
      if (existingTwists && existingTwists.length > 0) {
        contextPrompt += '\n\nEXISTING PLOT TWISTS:\n';
        existingTwists.forEach(twist => {
          contextPrompt += `- ${twist.title}: ${twist.description}\n`;
        });
      }
      const prompt = `
          Continue this story in a creative and engaging way:
          
          Current story: ${storyContent}
          ${direction ? `Direction: ${direction}` : ''}
          ${contextPrompt}
          
          Please continue the story with 2-3 paragraphs that:
          - Maintain the established tone and style
          - Add new developments or revelations
          - Keep the reader engaged
          - Flow naturally from the existing content
          - Reference and develop existing characters when appropriate
          - Build upon existing plot elements and twists
          
          Return only the story continuation text, no additional formatting.
          
          IMPORTANT: Do not use any emojis in your response.
        `;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    });
    
    if (result === null) {
      console.log('Using fallback service for story continuation');
      return fallbackService.continueStory(storyContent, direction);
    }
    
    return result;
  }
  async developCharacter(characterName, currentTraits = '', storyContext = '') {
    const result = await retryWithBackoff(async () => {
              const prompt = `
          Develop a character for a story:
          
          Character name: ${characterName}
          ${currentTraits ? `Current traits: ${currentTraits}` : ''}
          ${storyContext ? `Story context: ${storyContext}` : ''}
          
          Please provide:
          1. A detailed character description
          2. Key personality traits
          3. Background story
          4. Motivations and goals
          
          Format as JSON:
          {
            "description": "Character description...",
            "traits": "Key personality traits...",
            "background": "Character background...",
            "motivations": "What drives this character..."
          }
          
          IMPORTANT: Do not use any emojis in your response.
        `;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing character JSON:', parseError);
      }
      return {
        description: `A compelling character named ${characterName}`,
        traits: 'Complex and multi-dimensional',
        background: 'Rich backstory with depth',
        motivations: 'Driven by personal goals and desires'
      };
    });
    
    if (result === null) {
      console.log('Using fallback service for character development');
      return fallbackService.developCharacter(characterName, currentTraits, storyContext);
    }
    
    return result;
  }
  async generateStorySuggestions(genre = '', theme = '') {
    const result = await retryWithBackoff(async () => {
      const prompt = `
          Generate 3 creative story ideas:
          ${genre ? `Genre: ${genre}` : ''}
          ${theme ? `Theme: ${theme}` : ''}
          
          For each idea, provide:
          1. A compelling title
          2. A brief synopsis
          3. Key characters
          4. Main plot points
          
          Format as JSON array:
          [
            {
              "title": "Story Title",
              "synopsis": "Brief story description...",
              "characters": ["Character 1", "Character 2"],
              "plotPoints": ["Point 1", "Point 2", "Point 3"]
            }
          ]
          
          IMPORTANT: Do not use any emojis in your response.
        `;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing suggestions JSON:', parseError);
      }
      return [
        {
          title: 'The Mysterious Journey',
          synopsis: 'An adventure story with unexpected twists',
          characters: ['Protagonist', 'Mentor', 'Antagonist'],
          plotPoints: ['Call to adventure', 'Rising action', 'Climax']
        }
      ];
    });
    
    if (result === null) {
      console.log('Using fallback service for story suggestions');
      return fallbackService.generateStorySuggestions(genre, theme);
    }
    
    return result;
  }
  async generateCharacterFromStory(storyContent, characterName = '') {
    const result = await retryWithBackoff(async () => {
      const prompt = `
          Based on this story content, generate a character that fits naturally into the narrative:
          
          Story: ${storyContent}
          ${characterName ? `Character name: ${characterName}` : 'Generate a name for this character'}
          
          Please provide a character that:
          - Fits the story's tone and genre
          - Has a clear role in the narrative
          - Is well-developed with distinct traits
          - Contributes to the story's progression
          
          Format as JSON:
          {
            "name": "Character Name",
            "role": "Protagonist/Antagonist/Supporting",
            "age": "Age or age range",
            "origin": "Where they're from",
            "motivation": "What drives them",
            "description": "Physical and personality description",
            "backstory": "Their background story",
            "traits": "Key personality traits",
            "relationships": "How they relate to other characters"
          }
          
          IMPORTANT: Do not use any emojis in your response.
        `;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing character JSON:', parseError);
      }
      return {
        name: characterName || 'New Character',
        role: 'Supporting',
        age: 'Unknown',
        origin: 'Unknown',
        motivation: 'To be determined',
        description: 'A character that fits the story',
        backstory: 'Background to be developed',
        traits: 'Complex and interesting',
        relationships: 'Connections to be explored'
      };
    });
    
    if (result === null) {
      console.log('Using fallback service for character generation');
      return fallbackService.generateCharacterFromStory(storyContent, characterName);
    }
    
    return result;
  }
  async generatePlotFromStory(storyContent, plotType = 'three-act') {
    const result = await retryWithBackoff(async () => {
      const prompt = `
          Based on this story content, generate a plot structure that enhances the narrative:
          
          Story: ${storyContent}
          Plot type: ${plotType}
          
          Please provide a plot structure that:
          - Builds upon the existing story elements
          - Creates a compelling narrative arc
          - Includes key turning points
          - Maintains consistency with the story's tone
          
          Format as JSON:
          {
            "title": "Plot Title",
            "structure_type": "${plotType}",
            "acts": "Detailed breakdown of acts/parts",
            "branches": "Alternative plot paths or subplots"
          }
          
          IMPORTANT: Do not use any emojis in your response.
        `;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing plot JSON:', parseError);
      }
      return {
        title: 'Story Plot Structure',
        structure_type: plotType,
        acts: 'Act 1: Setup, Act 2: Confrontation, Act 3: Resolution',
        branches: 'Main plot with potential subplots'
      };
    });
    
    if (result === null) {
      console.log('Using fallback service for plot generation');
      return fallbackService.generatePlotFromStory(storyContent, plotType);
    }
    
    return result;
  }
  async generateContentWithRetry(prompt) {
    const result = await retryWithBackoff(async () => {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    });
    
    if (result === null) {
      console.log('Using fallback service for content generation');
      return fallbackService.generateContent(prompt);
    }
    
    return result;
  }
}
module.exports = new GeminiService(); 