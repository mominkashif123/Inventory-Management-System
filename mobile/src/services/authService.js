import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://inventory-management-system-uyit.onrender.com';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post('https://inventory-management-system-uyit.onrender.com/api/users/login', { username, password });
      return {
        success: true,
        token: response.data.token,
        user: response.data.data,
      };
    } catch (error) {
      if (error.response?.data?.error) {
        return { success: false, error: error.response.data.error };
      }
      return { success: false, error: 'Login failed' };
    }
  },

  async register(userData) {
    try {
      const response = await api.post('https://inventory-management-system-uyit.onrender.com/api/users/register', userData);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      if (error.response?.data?.error) {
        return { success: false, error: error.response.data.error };
      }
      return { success: false, error: 'Registration failed' };
    }
  },

  // Note: no extra calls; only explicit endpoints used.

  async getToken() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (_e) {
      return null;
    }
  },
};

export default api;
