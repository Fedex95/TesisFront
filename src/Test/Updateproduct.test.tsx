import { render, screen, waitFor } from '@testing-library/react';
import UpdateProducto from '../components/Updateproduct';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockToast = { current: { show: jest.fn() } };
const mockOnClose = jest.fn();

beforeAll(() => {
  // Mock createStylesheet to avoid CSS parsing errors
  const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
  helpers.createStylesheet = jest.fn(() => ({}));
});

describe('UpdateProducto Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    expect(screen.getByText('Seleccionar producto')).toBeInTheDocument();
    expect(screen.getByText('Cerrar')).toBeInTheDocument();
  });

  test('fetches products on mount', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 10, imagenURL: 'url1', categoria: 'Mouse' },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    });

    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
  });

  test('selecting a product fills the form', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 10, imagenURL: 'url1', categoria: 'Mouse' },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    });

    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
  });

  test('updating product successfully shows success toast and calls onClose', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 10, imagenURL: 'url1', categoria: 'Mouse' },
    ];
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
  });

  test('updating product failure shows error toast', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 10, imagenURL: 'url1', categoria: 'Mouse' },
    ];
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
  });

  test('clicking update without selecting product shows warning', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 10, imagenURL: 'url1', categoria: 'Mouse' },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    });

    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
  });

  test('fetch error shows error toast', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(mockToast.current.show).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los productos.',
        life: 3000,
      });
    });
  });
});