import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../components/Register';

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
    fireEvent.change(screen.getByLabelText('Nombres'), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText('Cédula'), { target: { value: '123456789' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Calle 123' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { target: { value: 'juanp' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText('Titular de la tarjeta'), { target: { value: 'Juan Pérez' } });
    fireEvent.change(screen.getByLabelText('Dígitos'), { target: { value: '1234567890123456' } });
    fireEvent.change(screen.getByLabelText('Fecha de validación'), { target: { value: '12/25' } });
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } });
  };

  test('renders register form', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    expect(screen.getByText('Ingrese sus datos personales')).toBeInTheDocument();
    expect(screen.getByText('Ingrese un método de pago')).toBeInTheDocument();
    expect(screen.getByText('Registrarse')).toBeInTheDocument();
    expect(screen.getByText('¿Ya tienes una cuenta?')).toBeInTheDocument();
  });

  test('allows entering form data', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const nombreInput = screen.getByLabelText('Nombres');
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

  test('successful registration navigates to login', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    fillForm();
    const submitButton = screen.getByText('Registrarse');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(`${process.env.REACT_APP_URL_BACKEND}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: 'juanp',
          pass: 'password',
          nombre: 'Juan',
          apellido: 'Pérez',
          cedula: '123456789',
          email: 'juan@example.com',
          telefono: '1234567890',
          direccion: 'Calle 123',
          numeroTarjeta: '1234567890123456',
          nombreTarjeta: 'Juan Pérez',
          fechaValidez: '12/25',
          cvv: '123',
        }),
      });
      expect(screen.getByText('Usuario registrado exitosamente')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('shows error on registration failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('User already exists') });
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    fillForm();
    const submitButton = screen.getByText('Registrarse');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });

  test('shows error on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    fillForm();
    const submitButton = screen.getByText('Registrarse');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('No se pudo conectar con el servidor')).toBeInTheDocument();
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
    fireEvent.change(screen.getByLabelText('Nombres'), { target: { value: 'Juan' } });
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
    expect(screen.getByLabelText('Nombres')).toBeInTheDocument();
    expect(screen.getByLabelText('Apellidos')).toBeInTheDocument();
    expect(screen.getByLabelText('Cédula')).toBeInTheDocument();
    expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
    expect(screen.getByLabelText('Dirección')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Titular de la tarjeta')).toBeInTheDocument();
    expect(screen.getByLabelText('Dígitos')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha de validación')).toBeInTheDocument();
    expect(screen.getByLabelText('CVV')).toBeInTheDocument();
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