import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteProducto from '../components/Deleteproduct';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

const mockToast = {
  current: {
    show: jest.fn()
  }
};

const mockOnClose = jest.fn();

const mockProductos = [
  { id: 1, nombre: 'Producto 1', precio: 100, categoria: 'Mouse' },
  { id: 2, nombre: 'Producto 2', precio: 200, categoria: 'Teclado' }
];

describe('DeleteProducto Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiFetch.mockResolvedValueOnce(mockProductos);
  });

  test('renders data table', async () => {
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
    });
  });

  test('renders close button', () => {
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    expect(screen.getByText('Cerrar')).toBeInTheDocument();
  });

  test('displays product data', async () => {
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);

    const prod1 = await screen.findByText('Producto 1');
    const prod2 = await screen.findByText('Producto 2');
    const price = await screen.findByText('100');
    const category = await screen.findByText('Mouse');

    expect(prod1).toBeInTheDocument();
    expect(prod2).toBeInTheDocument();
    expect(price).toBeInTheDocument();
    expect(category).toBeInTheDocument();
  });

  test('close button calls onClose', () => {
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Cerrar'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('renders delete buttons', async () => {
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Eliminar');
      expect(deleteButtons.length).toBe(2);
    });
  });

  test('fetches products on mount', async () => {
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/producto/find/all');
    });
  });

  test('deletes product successfully', async () => {
    apiFetch.mockResolvedValueOnce(mockProductos);
    apiFetch.mockResolvedValueOnce(); // for delete
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByText('Eliminar');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/producto/delete/1', { method: 'DELETE' });
      expect(mockToast.current.show).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'El producto con ID 1 fue eliminado correctamente.',
        life: 3000,
      });
      expect(screen.queryByText('Producto 1')).not.toBeInTheDocument();
    });
  });

  
  test('renders table headers', async () => {
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Precio')).toBeInTheDocument();
      expect(screen.getByText('Categoría')).toBeInTheDocument();
      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });
  });

  test('does not render products if fetch fails', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Fetch error'));
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.queryByText('Producto 1')).not.toBeInTheDocument();
    });
  });

  test('handles multiple deletes', async () => {
    apiFetch.mockResolvedValueOnce(mockProductos);
    apiFetch.mockResolvedValueOnce(); // delete 1
    apiFetch.mockResolvedValueOnce(); // delete 2
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
      expect(screen.getByText('Producto 2')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByText('Eliminar');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.queryByText('Producto 1')).not.toBeInTheDocument();
    });
  });
});