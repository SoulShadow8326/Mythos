const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3000/api';
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('mythos_token');
  }
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('mythos_token', token);
    } else {
      localStorage.removeItem('mythos_token');
    }
  }
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };
    try {
      const response = await fetch(url, config);
      
      if (response.status === 429) {
        console.warn('Rate limit exceeded, retrying in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.request(endpoint, options);
      }
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  async get(endpoint) {
    return this.request(endpoint);
  }
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
  async register(userData) {
    const response = await this.post('/auth/register', userData);
    this.setToken(response.token);
    return response;
  }
  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    this.setToken(response.token);
    return response;
  }
  async getCurrentUser() {
    return this.get('/auth/me');
  }
  async logout() {
    this.setToken(null);
  }
  async getStories() {
    return this.get('/stories');
  }
  async getStory(id) {
    return this.get(`/stories/${id}`);
  }
  async createStory(storyData) {
    return this.post('/stories', storyData);
  }
  async updateStory(id, storyData) {
    return this.put(`/stories/${id}`, storyData);
  }
  async deleteStory(id) {
    return this.delete(`/stories/${id}`);
  }
  async exportStory(id) {
    const response = await fetch(`${this.baseURL}/stories/${id}/export`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-${id}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  async getCharacters(storyId) {
    return this.get(`/characters/story/${storyId}`);
  }
  async getAllCharacters() {
    return this.get('/characters');
  }
  async createCharacter(characterData) {
    return this.post('/characters', characterData);
  }
  async updateCharacter(id, characterData) {
    return this.put(`/characters/${id}`, characterData);
  }
  async deleteCharacter(id) {
    return this.delete(`/characters/${id}`);
  }
  async generateCharacter(characterData) {
    return this.post('/characters/generate', characterData);
  }
  async generateAndSaveCharacter(characterData) {
    return this.post('/characters/generate-and-save', characterData);
  }
  async getPlots() {
    return this.get('/plots');
  }
  async getPlot(id) {
    return this.get(`/plots/${id}`);
  }
  async createPlot(plotData) {
    return this.post('/plots', plotData);
  }
  async updatePlot(id, plotData) {
    return this.put(`/plots/${id}`, plotData);
  }
  async deletePlot(id) {
    return this.delete(`/plots/${id}`);
  }
  async getTwists(storyId = null) {
    const endpoint = storyId ? `/twists/story/${storyId}` : '/twists';
    return this.get(endpoint);
  }
  async createTwist(twistData) {
    return this.post('/twists', twistData);
  }
  async updateTwist(id, twistData) {
    return this.put(`/twists/${id}`, twistData);
  }
  async deleteTwist(id) {
    return this.delete(`/twists/${id}`);
  }
  async generateTwist(twistData) {
    return this.post('/twists/generate', twistData);
  }
  async generateAndSaveTwist(twistData) {
    return this.post('/twists/generate-and-save', twistData);
  }
  async developCharacter(characterData) {
    return this.post('/ai/develop-character', characterData);
  }
  async getStorySuggestions(suggestionData) {
    const response = await this.post('/ai/story-suggestions', suggestionData);
    return response.suggestions;
  }
  async continueStory(storyData) {
    return this.post('/ai/continue-story', storyData);
  }
  async generateCharacterFromStory(storyData) {
    return this.post('/ai/generate-character-from-story', storyData);
  }
  async generatePlotFromStory(storyData) {
    return this.post('/ai/generate-plot-from-story', storyData);
  }
  async generatePlotTwist(twistData) {
    return this.post('/ai/plot-twist', twistData);
  }
  async getWritingAssistant(assistantData) {
    return this.post('/ai/writing-assistant', assistantData);
  }
  async analyzeStory(analysisData) {
    return this.post('/ai/analyze-story', analysisData);
  }
  async getWritingPrompts(promptData) {
    return this.post('/ai/writing-prompts', promptData);
  }
}
const apiService = new ApiService();
export default apiService; 