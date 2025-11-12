import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../components/Login';
import { apiFetch } from '../lib/api';
import { decodeJwt } from '../lib/jwt';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('../lib/jwt', () => ({
  decodeJwt: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockOnLogin = jest.fn();

beforeAll(() => {
  // Mock createStylesheet to avoid CSS parsing errors
  const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
  helpers.createStylesheet = jest.fn(() => ({}));
});

describe('Login Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders login form elements', () => {
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByText('Regístrate aquí')).toBeInTheDocument();
  });

  test('button is disabled when fields are empty', () => {
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
    expect(submitButton).toBeDisabled();
  });

  test('allows entering username and password', () => {
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const usernameInput = screen.getByLabelText('Usuario');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });

  test('shows success message and navigates on successful login', async () => {
    apiFetch.mockResolvedValueOnce({ token: 'mock-token' });
    decodeJwt.mockReturnValueOnce({ userId: 1, nombre: 'testuser', rol: 'ADMIN' });
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const usernameInput = screen.getByLabelText('Usuario');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    const successMsg = await screen.findByText('Inicio de sesión exitoso');
    expect(successMsg).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        id: 1,
        nombre: 'testuser',
        admin: true,
        token: 'mock-token',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  test('shows error message on invalid login', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Invalid credentials'));
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const usernameInput = screen.getByLabelText('Usuario');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error de red')).toBeInTheDocument();
    });
  });

  test('shows error on network failure', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Network error'));
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const usernameInput = screen.getByLabelText('Usuario');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error de red')).toBeInTheDocument();
    });
  });

  test('shows error when no token received', async () => {
    apiFetch.mockResolvedValueOnce({});
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const usernameInput = screen.getByLabelText('Usuario');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Token de autenticación no recibido')).toBeInTheDocument();
    });
  });

  test('clears fields after successful login', async () => {
    apiFetch.mockResolvedValueOnce({ token: 'mock-token' });
    decodeJwt.mockReturnValueOnce({ userId: 1, nombre: 'testuser', rol: 'USER' });
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const usernameInput = screen.getByLabelText('Usuario');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(usernameInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });
  });

  test('handles admin role correctly', async () => {
    apiFetch.mockResolvedValueOnce({ token: 'mock-token' });
    decodeJwt.mockReturnValueOnce({ userId: 1, nombre: 'adminuser', rol: 'ADMIN' });
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const usernameInput = screen.getByLabelText('Usuario');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');

    fireEvent.change(usernameInput, { target: { value: 'adminuser' } });
    fireEvent.change(passwordInput, { target: { value: 'adminpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        id: 1,
        nombre: 'adminuser',
        admin: true,
        token: 'mock-token',
      });
    });
  });

  test('handles user role correctly', async () => {
    apiFetch.mockResolvedValueOnce({ token: 'mock-token' });
    decodeJwt.mockReturnValueOnce({ userId: 2, nombre: 'regularuser', rol: 'USER' });
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const usernameInput = screen.getByLabelText('Usuario');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');

    fireEvent.change(usernameInput, { target: { value: 'regularuser' } });
    fireEvent.change(passwordInput, { target: { value: 'userpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        id: 2,
        nombre: 'regularuser',
        admin: false,
        token: 'mock-token',
      });
    });
  });

  test('renders register link', () => {
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const registerLink = screen.getByText('Regístrate aquí');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });
});