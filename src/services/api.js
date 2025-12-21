const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888/api';

// Helper to get cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Helper to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const cookie = getCookie('receipt_session');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie && { Cookie: `receipt_session=${cookie}` }),
      ...options.headers,
    },
    credentials: 'include', // Important for cookies
  };

  const response = await fetch(url, config);
  
  // Extract set-cookie header if present
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    // Browser will automatically set the cookie, but we can log it for debugging
    console.log('Cookie set:', setCookie);
  }

  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  
  return data;
}

// Auth API
export const authAPI = {
  register: async (username, email, password) => {
    return apiRequest('/auth-register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  login: async (emailOrUsername, password) => {
    const body = emailOrUsername.includes('@')
      ? { email: emailOrUsername, password }
      : { username: emailOrUsername, password };
    
    return apiRequest('/auth-login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  logout: async () => {
    return apiRequest('/auth-logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth-me', {
      method: 'GET',
    });
  },

  updateProfile: async (updates) => {
    return apiRequest('/auth-profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// Receipts API
export const receiptsAPI = {
  getAll: async (favoriteOnly = false) => {
    const params = favoriteOnly ? '?favorite=true' : '';
    return apiRequest(`/receipts${params}`, {
      method: 'GET',
    });
  },

  getById: async (id) => {
    return apiRequest(`/receipts/${id}`, {
      method: 'GET',
    });
  },

  create: async (receiptData) => {
    return apiRequest('/receipts', {
      method: 'POST',
      body: JSON.stringify(receiptData),
    });
  },

  update: async (id, updates) => {
    return apiRequest(`/receipts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id) => {
    return apiRequest(`/receipts/${id}`, {
      method: 'DELETE',
    });
  },

  markFavorite: async (id) => {
    return apiRequest(`/receipts/${id}/favorite`, {
      method: 'POST',
    });
  },

  unmarkFavorite: async (id) => {
    return apiRequest(`/receipts/${id}/favorite`, {
      method: 'DELETE',
    });
  },

  getFavorites: async () => {
    return apiRequest('/receipts/favorites', {
      method: 'GET',
    });
  },
};
