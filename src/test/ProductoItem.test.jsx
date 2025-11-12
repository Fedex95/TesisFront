/* eslint-disable import/first */
jest.mock('@heroicons/react/24/solid', () => ({
  ShoppingCartIcon: () => <div>Cart Icon</div>,
}));

import { render, screen, fireEvent } from '@testing-library/react';
import MenuItem from '../components/ProductoItem';

const mockOnAddToCart = jest.fn();

describe('MenuItem Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders item details', () => {
    const item = {
      image: 'test-image.jpg',
      name: 'Producto 1',
      description: 'Descripción del producto',
      price: 10.99,
    };
    render(<MenuItem item={item} onAddToCart={mockOnAddToCart} />);
    expect(screen.getByAltText('Producto 1')).toBeInTheDocument();
    expect(screen.getByText('Producto 1')).toBeInTheDocument();
    expect(screen.getByText('Descripción del producto')).toBeInTheDocument();
    expect(screen.getByText('$10.99')).toBeInTheDocument();
    expect(screen.getByText('Agregar al carrito')).toBeInTheDocument();
  });

  test('calls onAddToCart when button is clicked', () => {
    const item = {
      image: 'test-image.jpg',
      name: 'Producto 1',
      description: 'Descripción del producto',
      price: 10.99,
    };
    render(<MenuItem item={item} onAddToCart={mockOnAddToCart} />);
    const button = screen.getByText('Agregar al carrito');
    fireEvent.click(button);
    expect(mockOnAddToCart).toHaveBeenCalledWith(item);
  });

  test('renders image correctly', () => {
    const item = {
      image: 'test-image.jpg',
      name: 'Producto 1',
      description: 'Descripción del producto',
      price: 10.99,
    };
    render(<MenuItem item={item} onAddToCart={mockOnAddToCart} />);
    const img = screen.getByAltText('Producto 1');
    expect(img).toHaveAttribute('src', 'test-image.jpg');
  });

  test('button is clickable', () => {
    const item = {
      image: 'test-image.jpg',
      name: 'Producto 1',
      description: 'Descripción del producto',
      price: 10.99,
    };
    render(<MenuItem item={item} onAddToCart={mockOnAddToCart} />);
    const button = screen.getByText('Agregar al carrito');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
  });
});