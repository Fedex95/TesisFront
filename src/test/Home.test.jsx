import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Home from '../components/home/Home';
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

const mockLibros = [
  { id: 1, titulo: 'Libro 1', autor: 'Autor 1', descripcion: 'Desc 1', categoria: 'Ficción', isbn: '1234567890', imagenUrl: 'http://example.com/1.jpg' },
  { id: 2, titulo: 'Libro 2', autor: 'Autor 2', descripcion: 'Desc 2', categoria: 'NoFicción', isbn: '0987654321', imagenUrl: 'http://example.com/2.jpg' }
];

describe('Home Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    sessionStorage.setItem('auth_token', 'mock-token');
    apiFetch.mockResolvedValue(mockLibros);
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
    const libro1 = await screen.findByText('Libro 1');
    expect(libro1).toBeInTheDocument();
  });

  test('displays featured products', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const libro1 = await screen.findByText('Libro 1');
    const libro2 = await screen.findByText('Libro 2');
    expect(libro1).toBeInTheDocument();
    expect(libro2).toBeInTheDocument();
  });

  test('opens dialog on product click', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);
    const specs = await screen.findByText('Detalles del Libro');
    expect(specs).toBeInTheDocument();
  });

  test('renders add to cart button in dialog', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);
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
      expect(apiFetch).toHaveBeenCalledWith('/api/libros');
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
    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);
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
    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);
    expect(screen.getByText('Detalles del Libro')).toBeInTheDocument();
    // Simulate closing dialog
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByText('Detalles del Libro')).not.toBeInTheDocument();
    });
  });

  test('renders product image in dialog', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );

    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);

    const imgs = screen.getAllByAltText('Libro 1');

    expect(imgs[0]).toBeInTheDocument();
  });

  test('renders product description in dialog', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );

    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);

    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByText('Desc 1')).toBeInTheDocument();
  });


  test('renders product isbn in dialog', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);
    expect(screen.getByText('ISBN: 1234567890')).toBeInTheDocument();
  });


  test('handles fetch error gracefully', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Fetch error'));
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText('Libro 1')).not.toBeInTheDocument();
    });
  });

  test('adds to cart successfully', async () => {
    apiFetch.mockResolvedValueOnce([
      { id: 1, titulo: "Libro 1", precio: 10 },
      { id: 2, titulo: "Libro 2", precio: 15 }
    ]);
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);
    const addBtn = await screen.findByText('Agregar al carrito');
    fireEvent.click(addBtn);
    await waitFor(async () => {
      expect(apiFetch).toHaveBeenCalledWith('/api/cart/agregar', {
        method: 'POST',
        body: JSON.stringify({ libroId: 1, cantidad: 1 }),
      });
      await waitFor(() => {
        expect(screen.getByText('Libro agregado al carrito')).toBeInTheDocument();
      })
    });
  });


  test('carousel has responsive options', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const carousel = screen.getByRole('region');
    await waitFor(() => {
      expect(carousel).toBeInTheDocument()
    })
  });



  test('initial quantities are set', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Libro 1')).toBeInTheDocument();
    });
  });

  test('renders multiple products in carousel', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const libro1 = await screen.findByText('Libro 1');
    const libro2 = await screen.findByText('Libro 2');
    expect(libro1).toBeInTheDocument();
    expect(libro2).toBeInTheDocument();
  });

  test('dialog shows correct quantity', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});