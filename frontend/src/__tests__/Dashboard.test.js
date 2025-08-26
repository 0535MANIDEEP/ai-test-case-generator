import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

jest.mock('../services/api');

describe('Dashboard Component', () => {
  const mockUser = {
    _id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  };

  const mockTestCases = [
    {
      _id: '1',
      title: 'Test Case 1',
      description: 'Test description',
      testType: 'functional',
      status: 'not_started',
      priority: 'high'
    }
  ];

  beforeEach(() => {
    api.getTestCases.mockResolvedValueOnce(mockTestCases);
  });

  it('renders dashboard with user info and test cases', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(await screen.findByText(/welcome, john/i)).toBeInTheDocument();
    expect(screen.getByText(/test case 1/i)).toBeInTheDocument();
  });

  it('displays loading state', async () => {
    api.getTestCases.mockImplementationOnce(() => new Promise(() => {}));

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    api.getTestCases.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(await screen.findByText(/error loading test cases/i)).toBeInTheDocument();
  });
});
