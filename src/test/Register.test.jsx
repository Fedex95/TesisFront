import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../components/auth/Register';

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

beforeAll(() => {
  // Mock createStylesheet to avoid CSS parsing errors
  const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
  helpers.createStylesheet = jest.fn(() => ({}));
});

describe('Register Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  const fillForm = () => {
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText('Cédula'), { target: { value: '123456789' } });
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { target: { value: 'juanp' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password' } });
  };

  test('renders register form', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    expect(screen.getByText('Regístrate en la Biblioteca')).toBeInTheDocument();
    expect(screen.getByText('Registrarse')).toBeInTheDocument();
    expect(screen.getByText('¿Ya tienes una cuenta?')).toBeInTheDocument();
  });

  test('allows entering form data', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const nombreInput = screen.getByLabelText('Nombre');
    fireEvent.change(nombreInput, { target: { value: 'Juan' } });
    expect(nombreInput).toHaveValue('Juan');
  });

  test('shows warning on submit with empty fields', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const submitButton = screen.getByText('Registrarse');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Completa todos los campos obligatorios')).toBeInTheDocument();
    });
  });

  test('renders login link', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const loginLink = screen.getByText('Inicia sesión');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  test('shows warning on submit with partial fields', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan' } });
    const submitButton = screen.getByText('Registrarse');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Completa todos los campos obligatorios')).toBeInTheDocument();
    });
  });

  test('allows entering password', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const passInput = screen.getByLabelText('Contraseña');
    fireEvent.change(passInput, { target: { value: 'password' } });
    expect(passInput).toBeInTheDocument();
  });

  test('renders all form fields', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Apellido')).toBeInTheDocument();
    expect(screen.getByLabelText('Cédula')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo')).toBeInTheDocument();
    expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
  });

  test('handles form data changes', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText('Correo');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  test('renders register button', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const button = screen.getByText('Registrarse');
    expect(button).toBeInTheDocument();
  });
});