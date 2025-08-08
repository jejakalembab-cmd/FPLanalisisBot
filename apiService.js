class ApiService {
  constructor() {
    this.baseURL = 'https://fantasy.premierleague.com/api';
    this.authURL = 'https://users.premierleague.com/accounts';
  }

  async makeRequest(url, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...options.headers
    };

    const token = localStorage.getItem('fpl_token');
    if (token && !options.skipAuth) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || parsedError.detail || errorMessage;
        } catch {
          errorMessage = errorData || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Please check your internet connection');
      }
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    const response = await this.makeRequest(`${this.authURL}/login/`, {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({
        login: email,
        password: password,
        redirect_uri: 'https://fantasy.premierleague.com/a/login',
        app: 'plfpl-web'
      })
    });

    if (response.session || response.access_token) {
      const token = response.session || response.access_token;
      localStorage.setItem('fpl_token', token);
      return { token, user: { email } };
    }

    throw new Error('Authentication failed');
  }

  // Bootstrap data (players, teams, gameweeks)
  async getBootstrapData() {
    return await this.makeRequest(`${this.baseURL}/bootstrap-static/`, {
      skipAuth: true
    });
  }

  // User's team data
  async getTeamData(teamId) {
    return await this.makeRequest(`${this.baseURL}/entry/${teamId}/`);
  }

  // Current team picks
  async getCurrentTeam(teamId) {
    return await this.makeRequest(`${this.baseURL}/my-team/${teamId}/`);
  }

  // Team history
  async getTeamHistory(teamId) {
    return await this.makeRequest(`${this.baseURL}/entry/${teamId}/history/`);
  }

  // Gameweek picks
  async getGameweekPicks(teamId, gameweek) {
    return await this.makeRequest(`${this.baseURL}/entry/${teamId}/event/${gameweek}/picks/`);
  }

  // Transfers
  async getTransfers(teamId) {
    return await this.makeRequest(`${this.baseURL}/entry/${teamId}/transfers/`);
  }

  // Player detailed stats
  async getPlayerDetails(playerId) {
    return await this.makeRequest(`${this.baseURL}/element-summary/${playerId}/`);
  }

  // Fixtures
  async getFixtures(gameweek = null) {
    const url = gameweek 
      ? `${this.baseURL}/fixtures/?event=${gameweek}`
      : `${this.baseURL}/fixtures/`;
    return await this.makeRequest(url, { skipAuth: true });
  }

  // Live scores
  async getLiveScores(gameweek) {
    return await this.makeRequest(`${this.baseURL}/event/${gameweek}/live/`, {
      skipAuth: true
    });
  }

  // Make transfers
  async makeTransfers(teamId, transfers) {
    return await this.makeRequest(`${this.baseURL}/transfers/`, {
      method: 'POST',
      body: JSON.stringify({
        confirmed: true,
        entry: teamId,
        event: transfers.event,
        transfers: transfers.transfers
      })
    });
  }

  // Get leagues
  async getLeagues(teamId, leagueType = 'classic') {
    return await this.makeRequest(`${this.baseURL}/entry/${teamId}/${leagueType}-leagues/`);
  }

  // Utility methods
  isAuthenticated() {
    return !!localStorage.getItem('fpl_token');
  }

  logout() {
    localStorage.removeItem('fpl_token');
    localStorage.removeItem('fpl_user');
  }

  // Error handling wrapper
  async withErrorHandling(apiCall, fallbackValue = null) {
    try {
      return await apiCall();
    } catch (error) {
      console.error('API Error:', error.message);
      return fallbackValue;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
