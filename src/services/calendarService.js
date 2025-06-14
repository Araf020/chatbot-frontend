import axios from 'axios';

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8000';

class CalendarService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async makeAuthenticatedRequest(endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${BACKEND_API_URL}${endpoint}`,
        headers: this.getAuthHeaders()
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await this.refreshAccessToken();
          const retryConfig = {
            method,
            url: `${BACKEND_API_URL}${endpoint}`,
            headers: this.getAuthHeaders()
          };
          
          if (data && (method === 'POST' || method === 'PUT')) {
            retryConfig.data = data;
          }

          const retryResponse = await axios(retryConfig);
          return retryResponse.data;
        } catch (refreshError) {
          throw new Error('Authentication failed. Please login again.');
        }
      }
      throw error;
    }
  }

  async refreshAccessToken() {
    try {
      const response = await axios.post(`${BACKEND_API_URL}/auth/refresh`, {
        refresh_token: this.refreshToken
      });

      this.accessToken = response.data.access_token;
      localStorage.setItem('google_access_token', this.accessToken);
      
      return this.accessToken;
    } catch (error) {
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_refresh_token');
      throw error;
    }
  }

  async getCalendarEvents(timeMin = null, timeMax = null, maxResults = 10) {
    const params = new URLSearchParams({
      maxResults: maxResults.toString()
    });

    if (timeMin) params.append('timeMin', timeMin);
    if (timeMax) params.append('timeMax', timeMax);

    return await this.makeAuthenticatedRequest(`/api/calendar/events?${params}`);
  }

  async createCalendarEvent(eventData) {
    return await this.makeAuthenticatedRequest('/api/calendar/events', 'POST', eventData);
  }

  async updateCalendarEvent(eventId, eventData) {
    return await this.makeAuthenticatedRequest(`/api/calendar/events/${eventId}`, 'PUT', eventData);
  }

  async deleteCalendarEvent(eventId) {
    return await this.makeAuthenticatedRequest(`/api/calendar/events/${eventId}`, 'DELETE');
  }

  async getCalendarList() {
    return await this.makeAuthenticatedRequest('/api/calendar/calendars');
  }

  async sendCalendarQuery(query, context = {}) {
    const requestData = {
      query,
      context,
      access_token: this.accessToken,
      refresh_token: this.refreshToken
    };

    return await this.makeAuthenticatedRequest('/api/calendar/query', 'POST', requestData);
  }
}

export default CalendarService;