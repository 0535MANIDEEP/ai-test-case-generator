import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class API {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.client.post('/auth/login', { email, password });
  }

  async register(userData) {
    return this.client.post('/auth/register', userData);
  }

  async getProfile() {
    return this.client.get('/auth/profile');
  }

  // Test case endpoints
  async generateTestCases(data) {
    return this.client.post('/test-cases/generate', data);
  }

  async getTestCases() {
    return this.client.get('/test-cases');
  }

  async getTestCase(id) {
    return this.client.get(`/test-cases/${id}`);
  }

  async createTestCase(data) {
    return this.client.post('/test-cases', data);
  }

  async updateTestCase(id, data) {
    return this.client.put(`/test-cases/${id}`, data);
  }

  async deleteTestCase(id) {
    return this.client.delete(`/test-cases/${id}`);
  }

  // Export endpoints
  async exportToCSV() {
    return this.client.get('/export/csv', {
      responseType: 'blob',
    });
  }

  async exportToExcel() {
    return this.client.get('/export/excel', {
      responseType: 'blob',
    });
  }

  async importFromCSV(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.post('/export/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

// Create instances for different API categories
export const authAPI = new API();
export const testCaseAPI = new API();
export const exportAPI = new API();

export default API;
