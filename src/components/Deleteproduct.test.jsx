import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteProducto from './Deleteproduct';

global.fetch = jest.fn();

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
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProductos)
    });
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
});