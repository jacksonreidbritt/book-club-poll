import axios from 'axios';
import { API_URL } from './config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Poll API functions
export const pollAPI = {
  // Get all polls
  getAllPolls: () => api.get('/polls'),
  
  // Get specific poll
  getPoll: (pollId) => api.get(`/polls/${pollId}`),
  
  // Create new poll
  createPoll: (pollData) => api.post('/polls', pollData),
  
  // Submit response
  submitResponse: (pollId, responseData) => api.post(`/polls/${pollId}/responses`, responseData),
  
  // Get poll responses
  getResponses: (pollId) => api.get(`/polls/${pollId}/responses`),
  
  // Get poll results
  getResults: (pollId) => api.get(`/polls/${pollId}/results`),
  
  // Health check
  healthCheck: () => api.get('/health'),
};

export default api;
