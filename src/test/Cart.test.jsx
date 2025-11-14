import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Cart from '../components/Cart';
import { BrowserRouter } from 'react-router-dom';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockUserData = {
  id: 1,
};

const mockCartData = {
  id: 1,
  items: [
    {
      id: 1,
      cantidad: 2,
      libro: {
        titulo: 'Libro 1',
        autor: 'Autor 1',
        imagenUrl: 'http://example.com/image.jpg',
      },
    },
    {
      id: 2,
      cantidad: 1,
      libro: {
        titulo: 'Libro 2',
        autor: 'Autor 2',
        imagenUrl: 'http://example.com/image2.jpg',
      },
    },
  ],
};

describe('Cart Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders cart title', () => {
    render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    expect(screen.getByText('Carrito de Préstamos')).toBeInTheDocument();
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
    expect(container.querySelector('.cart-container')).toBeInTheDocument();
  });

  test('fetches cart items on mount when userData.id exists', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/cart/get');
    });
  });

  test('displays cart items when fetched', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Libro 1')).toBeInTheDocument();
      expect(screen.getByText('Libro 2')).toBeInTheDocument();
      expect(screen.getByText('Autor: Autor 1')).toBeInTheDocument();
      expect(screen.getByText('Autor: Autor 2')).toBeInTheDocument();
      expect(screen.getByText('Cantidad: 2')).toBeInTheDocument();
      expect(screen.getByText('Cantidad: 1')).toBeInTheDocument();
    });
  });

  test('removes item from cart', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    apiFetch.mockResolvedValueOnce(); 
    apiFetch.mockResolvedValueOnce(mockCartData); 
    render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Libro 1')).toBeInTheDocument();
    });
    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find(btn => btn.className.includes('p-button-danger'));
    fireEvent.click(removeButton);
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/cart/eliminar/1', { method: 'DELETE' });
      expect(screen.getByText('Libro eliminado del carrito')).toBeInTheDocument();
    });
  });

  test('handles loan request successfully', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    apiFetch.mockResolvedValueOnce(); 
    apiFetch.mockResolvedValueOnce({ items: [] }); 
    render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Solicitar Préstamo')).toBeInTheDocument();
    });
    
    const loanButton = screen.getByRole('button', { name: /solicitar préstamo/i });
    expect(loanButton).not.toBeDisabled();
    fireEvent.click(loanButton);
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/prestamos', { method: 'POST', body: JSON.stringify({ items: mockCartData.items }) });
      expect(screen.getByText('Préstamo solicitado exitosamente')).toBeInTheDocument();
    });
  });

  test('shows error on fetch failure', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Fetch error'));
    render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('No se pudieron cargar los items del carrito')).toBeInTheDocument();
    });
  });

  test('shows error on remove failure', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    apiFetch.mockRejectedValueOnce(new Error('Remove error'));
    render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Libro 1')).toBeInTheDocument();
    });
    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find(btn => btn.classList.contains('p-button-danger'));
    fireEvent.click(removeButton);
    await waitFor(() => {
      expect(screen.getByText('No se pudo eliminar el libro')).toBeInTheDocument();
    });
  });

  test('shows error on loan failure', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    apiFetch.mockRejectedValueOnce(new Error('Loan error'));
    render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Solicitar Préstamo')).toBeInTheDocument();
    });
    const loanButton = screen.getByText('Solicitar Préstamo');
    fireEvent.click(loanButton);
    await waitFor(() => {
      expect(screen.getByText('Loan error')).toBeInTheDocument();
    });
  });

  test('navigates to home on catalog button click', () => {
    render(
      <BrowserRouter>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    const catalogButton = screen.getByText('Catálogo');
    fireEvent.click(catalogButton);
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });


  test('does not fetch cart if no userData.id', () => {
    render(
      <BrowserRouter>
        <Cart userData={{}} />
      </BrowserRouter>
    );
    expect(apiFetch).not.toHaveBeenCalled();
  });
});