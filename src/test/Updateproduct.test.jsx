import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdateProducto from '../components/Updateproduct';
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

describe('UpdateProducto Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    apiFetch.mockResolvedValueOnce([]);
    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    expect(screen.getByText('Seleccionar producto')).toBeInTheDocument();
    expect(screen.getByText('Cerrar')).toBeInTheDocument();
  });

  test('fetches products on mount', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 10, imagenURL: 'url1', categoria: 'Mouse' },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);

    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/producto/find/all');
    });
  });

  test('selecting a product fills the form', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 10, imagenURL: 'url1', categoria: 'Mouse' },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);

    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);

    const dropdown = screen.getByRole('button', { name: '' });
    fireEvent.click(dropdown);
    await waitFor(() => screen.getByText('Producto 1'));
    fireEvent.click(screen.getByText('Producto 1'));

    await waitFor(() => {
      const nameFields = screen.getAllByDisplayValue('Producto 1');
      expect(nameFields.length).toBeGreaterThan(0);
      expect(screen.getByDisplayValue('Desc 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('$10.00')).toBeInTheDocument();
    });
  });

  test('updating product successfully shows success toast and calls onClose', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: '10', imagenURL: 'url1', categoria: 'Mouse' },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);
    apiFetch.mockResolvedValueOnce();

    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);

    const dropdown = screen.getByRole('button', { name: '' });
    fireEvent.click(dropdown);
    await waitFor(() => screen.getByText('Producto 1'));
    fireEvent.click(screen.getByText('Producto 1'));
    
    await waitFor(() => {
      expect(screen.getByLabelText('Nombre')).toHaveValue('Producto 1');
      expect(screen.getByLabelText('Descripción')).toHaveValue('Desc 1');
      expect(screen.getByLabelText('Imagen URL')).toHaveValue('url1');
      expect(screen.getByLabelText('Precio').value).toContain('10');
    });

    const updateButton = screen.getByText('Actualizar');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/producto/edit/1', {
        method: 'PUT',
        body: JSON.stringify({
          nombre: 'Producto 1',
          descripcion: 'Desc 1',
          precio: '10',
          imagenURL: 'url1',
          categoria: 'Mouse',
        }),
      });
      expect(mockToast.current.show).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'El producto con ID 1 fue actualizado correctamente.',
        life: 3000,
      });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });


  test('fetch error shows error toast', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Network error'));

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

  test('renders form fields when product is selected', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 10, imagenURL: 'url1', categoria: 'Mouse' },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);

    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);

    const dropdown = screen.getByRole('button', { name: '' });
    fireEvent.click(dropdown);
    await waitFor(() => screen.getByText('Producto 1'));
    fireEvent.click(screen.getByText('Producto 1'));

    await waitFor(() => {
      expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
      expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
      expect(screen.getByLabelText('Precio')).toBeInTheDocument();
      expect(screen.getByLabelText('Imagen URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Categoría')).toBeInTheDocument();
    });
  });

  test('allows changing form fields', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 10, imagenURL: 'url1', categoria: 'Mouse' },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);

    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);

    const dropdown = screen.getByRole('button', { name: '' });
    fireEvent.click(dropdown);
    await waitFor(() => screen.getByText('Producto 1'));
    fireEvent.click(screen.getByText('Producto 1'));

    await waitFor(() => {
      const nombreInput = screen.getByLabelText('Nombre');
      fireEvent.change(nombreInput, { target: { value: 'Producto Updated' } });
      expect(nombreInput.value).toBe('Producto Updated');
    });
  });

  test('close button calls onClose', () => {
    apiFetch.mockResolvedValueOnce([]);
    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    const closeButton = screen.getByText('Cerrar');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('renders dropdown with product options', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 10, imagenURL: 'url1', categoria: 'Mouse' },
      { id: 2, nombre: 'Producto 2', descripcion: 'Desc 2', precio: 20, imagenURL: 'url2', categoria: 'Teclado' },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);

    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);

    const dropdown = screen.getByRole('button', { name: '' });
    fireEvent.click(dropdown);
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
      expect(screen.getByText('Producto 2')).toBeInTheDocument();
    });
  });

  test('does not render form fields initially', () => {
    apiFetch.mockResolvedValueOnce([]);
    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument();
  });

  test('handles category selection', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 10, imagenURL: 'url1', categoria: 'Mouse' },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);

    render(<UpdateProducto userId={1} toast={mockToast} onClose={mockOnClose} />);

    const dropdown = screen.getByRole('button', { name: '' });
    fireEvent.click(dropdown);
    await waitFor(() => screen.getByText('Producto 1'));
    fireEvent.click(screen.getByText('Producto 1'));

    await waitFor(() => {
      const categoriaDropdown = screen.getAllByRole('button', { name: '' })[1];
      fireEvent.click(categoriaDropdown);
      expect(screen.getByText('Teclado')).toBeInTheDocument();
    });
  });
});