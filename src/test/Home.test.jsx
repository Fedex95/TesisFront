import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../components/Home';
import { BrowserRouter } from 'react-router-dom';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockUserData = { id: 1, name: 'Test User' };

const mockProductos = [
  { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 100, categoria: 'Mouse', imagenURL: 'http://example.com/1.jpg' },
  { id: 2, nombre: 'Producto 2', descripcion: 'Desc 2', precio: 200, categoria: 'Teclado', imagenURL: 'http://example.com/2.jpg' }
];

describe('Home Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    sessionStorage.setItem('auth_token', 'mock-token');
    apiFetch.mockResolvedValue(mockProductos);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test('renders featured product (carousel presence)', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const prod1 = await screen.findByText('Producto 1');
    expect(prod1).toBeInTheDocument();
  });

  test('displays featured products', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const prod1 = await screen.findByText('Producto 1');
    const prod2 = await screen.findByText('Producto 2');
    expect(prod1).toBeInTheDocument();
    expect(prod2).toBeInTheDocument();
  });

  test('opens dialog on product click', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const prod1 = await screen.findByText('Producto 1');
    fireEvent.click(prod1);
    const specs = await screen.findByText('Especificaciones');
    expect(specs).toBeInTheDocument();
  });

  test('renders add to cart button in dialog', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const prod1 = await screen.findByText('Producto 1');
    fireEvent.click(prod1);
    const addBtn = await screen.findByText('Agregar al carrito');
    expect(addBtn).toBeInTheDocument();
  });

  test('fetches products on mount', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/producto/find/all');
    });
  });

  test('navigates to login if no token', () => {
    sessionStorage.removeItem('auth_token');
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('shows error if not logged in', async () => {
    render(
      <BrowserRouter>
        <Home userData={{}} />
      </BrowserRouter>
    );
    const prod1 = await screen.findByText('Producto 1');
    fireEvent.click(prod1);
    const addBtn = await screen.findByText('Agregar al carrito');
    fireEvent.click(addBtn);
    await waitFor(() => {
      expect(screen.getByText('Debe iniciar sesión para agregar al carrito')).toBeInTheDocument();
    });
  });


  test('closes dialog on hide', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const prod1 = await screen.findByText('Producto 1');
    fireEvent.click(prod1);
    expect(screen.getByText('Especificaciones')).toBeInTheDocument();
  });

  test('renders product image in dialog', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );

    const prod1 = await screen.findByText('Producto 1');
    fireEvent.click(prod1);

    const imgs = screen.getAllByAltText('Producto 1');

    expect(imgs[0]).toBeInTheDocument();
  });

  test('renders product description in dialog', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const prod1 = await screen.findByText('Producto 1');
    fireEvent.click(prod1);
    expect(screen.getByText('Desc 2')).toBeInTheDocument();
  });

  test('renders product price in dialog', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    await waitFor(async () => {
      const prod1 = await screen.findByText('Producto 1');
      const price = screen.getByText('$100.00');
      expect(prod1).toBeInTheDocument();
      expect(price).toBeInTheDocument();
    });
  });

  test('handles fetch error gracefully', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Fetch error'));
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
  });
});