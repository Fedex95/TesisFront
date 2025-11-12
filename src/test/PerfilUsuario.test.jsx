import { render, screen, waitFor } from '@testing-library/react';
import Profile from '../components/PerfilUsuario';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

beforeAll(() => {
  // Mock createStylesheet to avoid CSS parsing errors
  const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
  helpers.createStylesheet = jest.fn(() => ({}));
});

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading state initially', () => {
    render(<Profile userData={{ id: 1 }} />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  test('displays error when userData.id is missing', async () => {
    render(<Profile userData={{}} />);
    await waitFor(() => {
      expect(screen.getByText('Usuario no autenticado')).toBeInTheDocument();
    });
  });

  test('displays user data after successful fetch', async () => {
    const mockProfileData = {
      nombre: 'Juan',
      apellido: 'Pérez',
      cedula: '123456789',
      email: 'juan@example.com',
      usuario: 'juanp',
      telefono: '123-456-7890',
      direccion: 'Calle 123',
    };
    apiFetch.mockResolvedValueOnce(mockProfileData);

    render(<Profile userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument();
      expect(screen.getByText('Pérez')).toBeInTheDocument();
      expect(screen.getByText('123456789')).toBeInTheDocument();
      expect(screen.getByText('juan@example.com')).toBeInTheDocument();
      expect(screen.getByText('juanp')).toBeInTheDocument();
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
      expect(screen.getByText('Calle 123')).toBeInTheDocument();
    });
  });

  test('displays default text for missing data', async () => {
    apiFetch.mockResolvedValueOnce({});

    render(<Profile userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(screen.getAllByText('No disponible')).toHaveLength(7);
    });
  });

  test('displays error on fetch failure', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Profile userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar el perfil')).toBeInTheDocument();
    });
  });

  test('calls apiFetch with correct endpoint', async () => {
    apiFetch.mockResolvedValueOnce({});

    render(<Profile userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/usuario/getUsuario/1');
    });
  });

  test('renders profile card', async () => {
    apiFetch.mockResolvedValueOnce({});

    render(<Profile userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(screen.getByText('Datos personales')).toBeInTheDocument();
    });
  });

  test('renders profile items', async () => {
    apiFetch.mockResolvedValueOnce({});

    render(<Profile userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(screen.getByText('Nombres')).toBeInTheDocument();
      expect(screen.getByText('Apellidos')).toBeInTheDocument();
      expect(screen.getByText('Cédula')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Nombre de usuario')).toBeInTheDocument();
      expect(screen.getByText('Teléfono')).toBeInTheDocument();
      expect(screen.getByText('Dirección')).toBeInTheDocument();
    });
  });

  test('handles partial data', async () => {
    const partialData = {
      nombre: 'Juan',
      apellido: 'Pérez',
    };
    apiFetch.mockResolvedValueOnce(partialData);

    render(<Profile userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument();
      expect(screen.getByText('Pérez')).toBeInTheDocument();
      expect(screen.getAllByText('No disponible')).toHaveLength(5);
    });
  });
});