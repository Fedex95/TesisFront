import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../components/auth/Login';
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

// Mocks para evitar inyección de estilos de PrimeReact que rompen JSDOM
const mockToastShow = jest.fn();
jest.mock('primereact/toast', () => {
  const React = require('react');
  return {
    Toast: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({
        show: mockToastShow
      }));
      return <div data-testid="toast" />;
    })
  };
});
jest.mock('primereact/inputtext', () => ({
  InputText: (props) => <input {...props} />
}));
jest.mock('primereact/password', () => ({
  Password: ({ feedback, ...props }) => <input type="password" {...props} />
}));
jest.mock('primereact/button', () => ({
  Button: (props) => <button {...props}>{props.label || props.children}</button>
}));

const mockOnLogin = jest.fn();

beforeAll(() => {
  // Mock createStylesheet to avoid CSS parsing errors
  const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
  helpers.createStylesheet = jest.fn(() => ({
    cssRules: [],
    insertRule: jest.fn(),
    deleteRule: jest.fn(),
  }));
});

describe('Login Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockToastShow.mockClear();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders login form elements', () => {
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Correo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByText('Regístrate aquí')).toBeInTheDocument();
    expect(screen.getByText('Verifica aquí')).toBeInTheDocument();
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
    const emailInput = screen.getByLabelText('Correo');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');

    fireEvent.change(emailInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    expect(emailInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });

  test('shows success message and navigates on successful login', async () => {
    apiFetch.mockResolvedValueOnce({ token: 'mock-token', refreshToken: 'mock-refresh' });
    decodeJwt.mockReturnValueOnce({ userId: 1, nombre: 'testuser', rol: 'ADMIN' });
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText('Correo');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    fireEvent.change(emailInput, { target: { value: 'testuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', summary: 'Éxito', detail: 'Inicio de sesión exitoso' })
      );
    });

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        id: 1,
        nombre: 'testuser',
        rol: 'ADMIN',
        token: 'mock-token',
        refreshToken: 'mock-refresh',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  test('navigates to verify on 403 error', async () => {
    const error = new Error('Cuenta no verificada');
    error.status = 403;
    apiFetch.mockRejectedValueOnce(error);
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText('Correo');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    fireEvent.change(emailInput, { target: { value: 'wronguser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/verify', { state: { email: 'wronguser@example.com' } });
    });
  });

  test('shows error on network failure', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Network error'));
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText('Correo');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    fireEvent.change(emailInput, { target: { value: 'testuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', summary: 'Error', detail: 'Network error' })
      );
    });
  });

  test('shows error when no token received', async () => {
    apiFetch.mockResolvedValueOnce({});
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText('Correo');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    fireEvent.change(emailInput, { target: { value: 'testuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', summary: 'Error', detail: 'Token de autenticación no recibido' })
      );
    });
  });

  test('clears fields after successful login', async () => {
    apiFetch.mockResolvedValueOnce({ token: 'mock-token', refreshToken: 'mock-refresh' });
    decodeJwt.mockReturnValueOnce({ userId: 1, nombre: 'testuser', rol: 'USER' });
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText('Correo');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');

    fireEvent.change(emailInput, { target: { value: 'testuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(emailInput).toHaveValue('');
    });

    await waitFor(() => {
      expect(passwordInput).toHaveValue('');
    });
  });

  test('handles admin role correctly', async () => {
    apiFetch.mockResolvedValueOnce({ token: 'mock-token', refreshToken: 'mock-refresh' });
    decodeJwt.mockReturnValueOnce({ userId: 1, nombre: 'adminuser', rol: 'ADMIN' });
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText('Correo');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');

    fireEvent.change(emailInput, { target: { value: 'adminuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'adminpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        id: 1,
        nombre: 'adminuser',
        rol: 'ADMIN',
        token: 'mock-token',
        refreshToken: 'mock-refresh',
      });
    });
  });

  test('handles user role correctly', async () => {
    apiFetch.mockResolvedValueOnce({ token: 'mock-token', refreshToken: 'mock-refresh' });
    decodeJwt.mockReturnValueOnce({ userId: 2, nombre: 'regularuser', rol: 'USER' });
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText('Correo');
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña');

    fireEvent.change(emailInput, { target: { value: 'regularuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'userpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        id: 2,
        nombre: 'regularuser',
        rol: 'USER',
        token: 'mock-token',
        refreshToken: 'mock-refresh',
      });
    });
  });

  test('renders register and verify links', () => {
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );
    const registerLink = screen.getByRole('link', { name: 'Regístrate aquí' });
    const verifyLink = screen.getByRole('link', { name: 'Verifica aquí' });
    expect(registerLink).toBeInTheDocument();
    expect(verifyLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
    expect(verifyLink).toHaveAttribute('href', '/verify');
  });
});