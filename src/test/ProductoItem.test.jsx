import { render, screen, fireEvent } from '@testing-library/react';
import MenuItem from '../components/book/ProductoItem';

jest.mock('@heroicons/react/24/solid', () => ({
  ShoppingCartIcon: () => <div>Cart Icon</div>,
}));

const mockOnAddToCart = jest.fn();

describe('MenuItem Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders item details', () => {
    const item = {
      imagenUrl: 'test-image.jpg',
      titulo: 'Libro 1',
      descripcion: 'Descripción del libro',
      autor: 'Autor 1',
    };
    render(<MenuItem item={item} onAddToCart={mockOnAddToCart} />);
    expect(screen.getByAltText('Libro 1')).toBeInTheDocument();
    expect(screen.getByText('Libro 1')).toBeInTheDocument();
    expect(screen.getByText('Descripción del libro')).toBeInTheDocument();
    expect(screen.getByText('Autor: Autor 1')).toBeInTheDocument();
    expect(screen.getByText('Agregar libro al carrito')).toBeInTheDocument();
  });

  test('calls onAddToCart when button is clicked', () => {
    const item = {
      imagenUrl: 'test-image.jpg',
      titulo: 'Libro 1',
      descripcion: 'Descripción del libro',
      autor: 'Autor 1',
    };
    render(<MenuItem item={item} onAddToCart={mockOnAddToCart} />);
    const button = screen.getByText('Agregar libro al carrito');
    fireEvent.click(button);
    expect(mockOnAddToCart).toHaveBeenCalledWith(item);
  });

  test('renders image correctly', () => {
    const item = {
      imagenUrl: 'test-image.jpg',
      titulo: 'Libro 1',
      descripcion: 'Descripción del libro',
      autor: 'Autor 1',
    };
    render(<MenuItem item={item} onAddToCart={mockOnAddToCart} />);
    const img = screen.getByAltText('Libro 1');
    expect(img).toHaveAttribute('src', 'test-image.jpg');
  });

  test('button is clickable', () => {
    const item = {
      imagenUrl: 'test-image.jpg',
      titulo: 'Libro 1',
      descripcion: 'Descripción del libro',
      autor: 'Autor 1',
    };
    render(<MenuItem item={item} onAddToCart={mockOnAddToCart} />);
    const button = screen.getByText('Agregar libro al carrito');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
  });
});