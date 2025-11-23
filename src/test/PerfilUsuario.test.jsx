import { render, screen, waitFor } from '@testing-library/react';
import Profile from '../components/home/PerfilUsuario';
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
      usuario: 'juanp',
      email: 'juan@example.com',
      rol: 'ADMIN',
    };
    apiFetch.mockResolvedValueOnce(mockProfileData);

    render(<Profile userData={{ id: 1 }} />);

    await screen.findByText('Juan');

    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('juanp')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });


  test('displays default text for missing data', async () => {
    apiFetch.mockResolvedValueOnce({});

    render(<Profile userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(screen.getAllByText('No disponible')).toHaveLength(4);
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
      expect(apiFetch).toHaveBeenCalledWith('/api/usuario/getUsuario/1');
    });
  });

  test('renders profile card', async () => {
    apiFetch.mockResolvedValueOnce({});

    render(<Profile userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(screen.getByText('Datos personales')).toBeInTheDocument();
    });
  });

  test('handles partial data', async () => {
    const partialData = {
      nombre: 'Juan',
      usuario: 'juanp',
    };
    apiFetch.mockResolvedValueOnce(partialData);

    render(<Profile userData={{ id: 1 }} />);

    expect(await screen.findByText('Juan')).toBeInTheDocument();
    expect(await screen.findByText('juanp')).toBeInTheDocument();

    const missingFields = await screen.findAllByText('No disponible');
    expect(missingFields).toHaveLength(2);
  });
});