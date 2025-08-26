import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GenerateTestCases from '../pages/GenerateTestCases';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

jest.mock('../services/api');

describe('GenerateTestCases Component', () => {
  const mockUser = { _id: '1', firstName: 'John' };

  const mockGeneratedTestCases = [
    {
      title: 'Generated Test Case',
      description: 'Test description',
      steps: [{ stepNumber: 1, action: 'Test action', expectedResult: 'Expected result' }],
      expectedOutput: 'Expected output'
    }
  ];

  beforeEach(() => {
    api.generateTestCases.mockResolvedValueOnce(mockGeneratedTestCases);
  });

  it('renders generate test cases form', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <GenerateTestCases />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByLabelText(/user story/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/test type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/complexity/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate test cases/i })).toBeInTheDocument();
  });

  it('generates test cases on form submission', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <GenerateTestCases />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/user story/i), {
      target: { value: 'As a user, I want to login' }
    });
    fireEvent.click(screen.getByRole('button', { name: /generate test cases/i }));

    expect(await screen.findByText(/generated test case/i)).toBeInTheDocument();
  });

  it('displays loading state during generation', async () => {
    api.generateTestCases.mockImplementationOnce(() => new Promise(() => {}));

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <GenerateTestCases />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/user story/i), {
      target: { value: 'As a user, I want to login' }
    });
    fireEvent.click(screen.getByRole('button', { name: /generate test cases/i }));

    expect(screen.getByText(/generating/i)).toBeInTheDocument();
  });

  it('handles generation errors', async () => {
    api.generateTestCases.mockRejectedValueOnce(new Error('Generation failed'));

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <GenerateTestCases />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/user story/i), {
      target: { value: 'As a user, I want to login' }
    });
    fireEvent.click(screen.getByRole('button', { name: /generate test cases/i }));

    expect(await screen.findByText(/error generating test cases/i)).toBeInTheDocument();
  });

  it('saves generated test cases', async () => {
    api.saveTestCase.mockResolvedValueOnce({});

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <GenerateTestCases />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/user story/i), {
      target: { value: 'As a user, I want to login' }
    });
    fireEvent.click(screen.getByRole('button', { name: /generate test cases/i }));

    await waitFor(() => screen.getByText(/generated test case/i));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(api.saveTestCase).toHaveBeenCalled();
  });
});
