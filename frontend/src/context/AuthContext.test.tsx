import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/api';

jest.mock('../services/api', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn()
  },
  profileService: {},
  userService: {}
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

const AuthConsumer: React.FC = () => {
  const { login, logout, isAuthenticated, user, loading } = useAuth();

  return (
    <div>
      <div data-testid="status">{isAuthenticated ? 'authenticated' : 'guest'}</div>
      <div data-testid="user-email">{user?.email ?? 'none'}</div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <button onClick={() => login('user@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    </MemoryRouter>
  );

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('logs a user in and exposes the authenticated state', async () => {
    mockedAuthService.login.mockResolvedValue({
      token: 'token',
      message: 'ok',
      user: {
        id: '1',
        username: 'user',
        email: 'user@example.com',
        name: 'Test User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    mockedAuthService.getProfile.mockResolvedValueOnce({
      id: '1',
      username: 'user',
      email: 'user@example.com',
      name: 'Test User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('ready'));

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('authenticated'));
    expect(screen.getByTestId('user-email').textContent).toBe('user@example.com');
    expect(mockedAuthService.login).toHaveBeenCalledWith({ email: 'user@example.com', password: 'password' });
  });

  it('logs a user out and clears session data', async () => {
    mockedAuthService.login.mockResolvedValue({
      token: 'token',
      message: 'ok',
      user: {
        id: '1',
        username: 'user',
        email: 'user@example.com',
        name: 'Test User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    mockedAuthService.getProfile.mockResolvedValueOnce({
      id: '1',
      username: 'user',
      email: 'user@example.com',
      name: 'Test User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('ready'));

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /login/i }));
    });
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('authenticated'));

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /logout/i }));
    });

    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('guest'));
    expect(screen.getByTestId('user-email').textContent).toBe('none');
    expect(mockedAuthService.logout).toHaveBeenCalled();
  });
});

