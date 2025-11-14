import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdateLibro from '../components/Updateproduct';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

const mockToast = { current: { show: jest.fn() } };
const mockOnClose = jest.fn();

beforeAll(() => {
  // Mock createStylesheet to avoid CSS parsing errors
  const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
  helpers.createStylesheet = jest.fn(() => ({}));
});

describe('UpdateLibro Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    apiFetch.mockResolvedValueOnce([]);
    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);
    expect(screen.getByText('Seleccionar libro')).toBeInTheDocument();
    expect(screen.getByText('Cerrar')).toBeInTheDocument();
  });

  test('fetches products on mount', async () => {
    const mockLibros = [
      { id: 1, titulo: 'Libro 1', descripcion: 'Desc 1', autor: 'Autor 1', isbn: '1234567890', imagenUrl: 'url1', categoria: 'Ficción', copiasDisponibles: 10 },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);

    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/libros');
    });
  });

  test('selecting a product fills the form', async () => {
    const mockLibros = [
      { id: 1, titulo: 'Libro 1', descripcion: 'Desc 1', autor: 'Autor 1', isbn: '1234567890', imagenUrl: 'url1', categoria: 'Ficción', copiasDisponibles: 10 },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);

    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);

    const dropdown = screen.getByRole('button', { name: '' });
    fireEvent.click(dropdown);
    await waitFor(() => screen.getByText('Libro 1'));
    fireEvent.click(screen.getByText('Libro 1'));

    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toHaveValue('Libro 1');
      expect(screen.getByLabelText('Descripción')).toHaveValue('Desc 1');
      expect(screen.getByLabelText('Autor')).toHaveValue('Autor 1');
      expect(screen.getByLabelText('ISBN')).toHaveValue('1234567890');
      expect(screen.getByLabelText('Imagen URL')).toHaveValue('url1');
    });
  });

  test('updating product successfully shows success toast and calls onClose', async () => {
    const mockLibros = [
      { id: 1, titulo: 'Libro 1', descripcion: 'Desc 1', autor: 'Autor 1', isbn: '1234567890', imagenUrl: 'url1', categoria: 'Ficción', copiasDisponibles: 10 },
    ];

    apiFetch.mockResolvedValueOnce(mockLibros);
    apiFetch.mockResolvedValueOnce();

    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);

    const dropdown = screen.getByRole('button', { name: '' });
    fireEvent.click(dropdown);

    await waitFor(() => screen.getByText('Libro 1'));
    fireEvent.click(screen.getByText('Libro 1'));

    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toHaveValue('Libro 1');
      expect(screen.getByLabelText('Descripción')).toHaveValue('Desc 1');
      expect(screen.getByLabelText('Autor')).toHaveValue('Autor 1');
      expect(screen.getByLabelText('ISBN')).toHaveValue('1234567890');
      expect(screen.getByLabelText('Imagen URL')).toHaveValue('url1');
    });

    fireEvent.click(screen.getByText('Actualizar'));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenNthCalledWith(
        2,
        '/api/libros/1',
        expect.objectContaining({
          method: 'PUT',
          body: expect.any(String),
        })
      );

      const body = JSON.parse(apiFetch.mock.calls[1][1].body);
      expect(body).toEqual({
        titulo: 'Libro 1',
        descripcion: 'Desc 1',
        autor: 'Autor 1',
        isbn: '1234567890',
        imagenUrl: 'url1',
        categoria: 'Ficción',
        copiasDisponibles: 10,
      });

      expect(mockToast.current.show).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'El libro con ID 1 fue actualizado correctamente.',
        life: 3000,
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });


  test('fetch error shows error toast', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(mockToast.current.show).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los libros.',
        life: 3000,
      });
    });
  });

  test('renders form fields when product is selected', async () => {
    const mockLibros = [
      { id: 1, titulo: 'Libro 1', descripcion: 'Desc 1', autor: 'Autor 1', isbn: '1234567890', imagenUrl: 'url1', categoria: 'Ficción', copiasDisponibles: 10 },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);

    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);

    const dropdown = screen.getByRole('button', { name: '' });
    fireEvent.click(dropdown);
    await waitFor(() => screen.getByText('Libro 1'));
    fireEvent.click(screen.getByText('Libro 1'));

    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toBeInTheDocument();
      expect(screen.getByLabelText('Autor')).toBeInTheDocument();
      expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
      expect(screen.getByLabelText('ISBN')).toBeInTheDocument();
      expect(screen.getByLabelText('Imagen URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Categoría')).toBeInTheDocument();
      expect(screen.getByLabelText('Copias Disponibles')).toBeInTheDocument();
    });
  });

  test('allows changing form fields', async () => {
    const mockLibros = [
      { id: 1, titulo: 'Libro 1', descripcion: 'Desc 1', autor: 'Autor 1', isbn: '1234567890', imagenUrl: 'url1', categoria: 'Ficción', copiasDisponibles: 10 },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);

    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);

    const dropdown = screen.getByRole('button', { name: '' });
    fireEvent.click(dropdown);
    await waitFor(() => screen.getByText('Libro 1'));
    fireEvent.click(screen.getByText('Libro 1'));

    await waitFor(() => {
      const tituloInput = screen.getByLabelText('Título');
      fireEvent.change(tituloInput, { target: { value: 'Libro Updated' } });
      expect(tituloInput.value).toBe('Libro Updated');
    });
  });

  test('close button calls onClose', () => {
    apiFetch.mockResolvedValueOnce([]);
    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);
    const closeButton = screen.getByText('Cerrar');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('renders dropdown with product options', async () => {
    const mockLibros = [
      { id: 1, titulo: 'Libro 1', descripcion: 'Desc 1', autor: 'Autor 1', isbn: '1234567890', imagenUrl: 'url1', categoria: 'Ficción', copiasDisponibles: 10 },
      { id: 2, titulo: 'Libro 2', descripcion: 'Desc 2', autor: 'Autor 2', isbn: '0987654321', imagenUrl: 'url2', categoria: 'NoFicción', copiasDisponibles: 5 },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);

    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);

    const dropdown = screen.getByRole('button', { name: '' });
    fireEvent.click(dropdown);
    await waitFor(() => {
      expect(screen.getByText('Libro 1')).toBeInTheDocument();
      expect(screen.getByText('Libro 2')).toBeInTheDocument();
    });
  });

  test('does not render form fields initially', () => {
    apiFetch.mockResolvedValueOnce([]);
    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);
    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument();
  });
});