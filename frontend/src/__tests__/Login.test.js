import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

jest.mock('../services/api');

describe('Login Component', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  });

  it('renders login form', () => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('displays error message on invalid input', async () => {
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument();
  });

  it('calls login function on valid input', async () => {
    api.login.mockResolvedValueOnce({ token: 'mockToken' });

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(mockLogin).toHaveBeenCalledWith('mockToken');
  });
});
