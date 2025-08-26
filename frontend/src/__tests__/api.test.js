import api from '../services/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service', () => {
  const mockToken = 'mockToken';
  const mockResponse = { data: 'test' };

  beforeEach(() => {
    localStorage.setItem('token', mockToken);
    fetch.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Authentication', () => {
    it('login makes correct API call', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: mockToken, user: { id: 1 } })
      });

      const result = await api.login('test@example.com', 'password123');

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });
      expect(result).toEqual({ token: mockToken, user: { id: 1 } });
    });

    it('register makes correct API call', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await api.register(userData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
    });
  });

  describe('Test Cases', () => {
    it('getTestCases makes correct API call', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await api.getTestCases();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/test-cases', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });
    });

    it('generateTestCases makes correct API call', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const data = {
        userStory: 'Test story',
        testType: 'functional',
        complexity: 'medium'
      };

      await api.generateTestCases(data);

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/test-cases/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    });

    it('saveTestCase makes correct API call', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const testCase = {
        title: 'Test Case',
        description: 'Test description'
      };

      await api.saveTestCase(testCase);

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/test-cases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase)
      });
    });
  });

  describe('Export', () => {
    it('exportToCSV makes correct API call', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(new Blob())
      });

      await api.exportToCSV();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/export/csv', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });
    });

    it('exportToExcel makes correct API call', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(new Blob())
      });

      await api.exportToExcel();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/export/excel', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('handles 401 errors by clearing token', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });

      await expect(api.getTestCases()).rejects.toThrow('Unauthorized');
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getTestCases()).rejects.toThrow('Network error');
    });

    it('handles non-JSON error responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server error')
      });

      await expect(api.getTestCases()).rejects.toThrow('Server error');
    });
  });
});
