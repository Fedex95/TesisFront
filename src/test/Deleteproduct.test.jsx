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

const mockLibros = [
  { id: 1, titulo: 'Libro 1', autor: 'Autor 1', categoria: 'Ficción', isbn: '1234567890' },
  { id: 2, titulo: 'Libro 2', autor: 'Autor 2', categoria: 'No Ficción', isbn: '0987654321' }
];

describe('DeleteProducto Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiFetch.mockResolvedValueOnce(mockLibros);
  });

  test('renders data table', async () => {
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Libro 1')).toBeInTheDocument();
    });
  });

  test('renders close button', () => {
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    expect(screen.getByText('Cerrar')).toBeInTheDocument();
  });

  test('displays product data', async () => {
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);

    const libro1 = await screen.findByText('Libro 1');
    const libro2 = await screen.findByText('Libro 2');
    const autor1 = await screen.findByText('Autor 1');
    const categoria1 = await screen.findByText('Ficción');
    const isbn1 = await screen.findByText('1234567890');

    expect(libro1).toBeInTheDocument();
    expect(libro2).toBeInTheDocument();
    expect(autor1).toBeInTheDocument();
    expect(categoria1).toBeInTheDocument();
    expect(isbn1).toBeInTheDocument();
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
      expect(apiFetch).toHaveBeenCalledWith('/api/libros');
    });
  });

  test('deletes product successfully', async () => {
    apiFetch.mockResolvedValueOnce(mockLibros);
    apiFetch.mockResolvedValueOnce(); // for delete
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Libro 1')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByText('Eliminar');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/libros/1', { method: 'DELETE' });
      expect(mockToast.current.show).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'El libro con ID 1 fue eliminado correctamente.',
        life: 3000,
      });
      expect(screen.queryByText('Libro 1')).not.toBeInTheDocument();
    });
  });

  test('renders table headers', async () => {
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Título')).toBeInTheDocument();
      expect(screen.getByText('Autor')).toBeInTheDocument();
      expect(screen.getByText('Categoría')).toBeInTheDocument();
      expect(screen.getByText('ISBN')).toBeInTheDocument();
      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });
  });

  test('does not render products if fetch fails', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Fetch error'));
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.queryByText('Libro 1')).not.toBeInTheDocument();
    });
  });

  test('handles multiple deletes', async () => {
    apiFetch.mockResolvedValueOnce(mockLibros);
    apiFetch.mockResolvedValueOnce(); // delete 1
    apiFetch.mockResolvedValueOnce(); // delete 2
    render(<DeleteProducto userId={1} toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByText('Libro 1')).toBeInTheDocument();
      expect(screen.getByText('Libro 2')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByText('Eliminar');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.queryByText('Libro 1')).not.toBeInTheDocument();
    });
  });
});