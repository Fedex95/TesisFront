import { render, screen, fireEvent } from '@testing-library/react';
import Home from './Home';

global.fetch = jest.fn();

const mockUserData = { id: 1 };

const mockProductos = [
  { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 100, categoria: 'Mouse', imagenURL: 'http://example.com/1.jpg' },
  { id: 2, nombre: 'Producto 2', descripcion: 'Desc 2', precio: 200, categoria: 'Teclado', imagenURL: 'http://example.com/2.jpg' }
];

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProductos)
    });
  });

  test('renders featured product (carousel presence)', async () => {
    render(<Home userData={mockUserData} />);
    const prod1 = await screen.findByText('Producto 1');
    expect(prod1).toBeInTheDocument();
  });

  test('displays featured products', async () => {
    render(<Home userData={mockUserData} />);
    const prod1 = await screen.findByText('Producto 1');
    const prod2 = await screen.findByText('Producto 2');
    expect(prod1).toBeInTheDocument();
    expect(prod2).toBeInTheDocument();
  });

  test('opens dialog on product click', async () => {
    render(<Home userData={mockUserData} />);
    const prod1 = await screen.findByText('Producto 1');
    fireEvent.click(prod1);
    const specs = await screen.findByText('Especificaciones');
    expect(specs).toBeInTheDocument();
  });

  test('renders add to cart button in dialog', async () => {
    render(<Home userData={mockUserData} />);
    const prod1 = await screen.findByText('Producto 1');
    fireEvent.click(prod1);
    const addBtn = await screen.findByText('Agregar al carrito');
    expect(addBtn).toBeInTheDocument();
  });
});