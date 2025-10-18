import { render, screen, within } from '@testing-library/react';
import Cart from './Cart';
import { BrowserRouter } from 'react-router-dom';

global.fetch = jest.fn();

const mockUserData = {
  id: 1,
  cart: { id: 1 }
};

describe('Cart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders cart title', () => {
    render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    expect(screen.getByText('Carrito')).toBeInTheDocument();
  });

  test('renders catalog button', () => {
    render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
  });

  test('renders empty cart message', () => {
    render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
  });

  test('renders catalog button as button element', () => {
    render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    expect(screen.getByRole('button', { name: /catálogo/i })).toBeInTheDocument();
  });

  test('renders cart container', () => {
    const { container } = render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    const found = within(container).getByText('Tu carrito está vacío');
    expect(found).toBeInTheDocument();
  });
});