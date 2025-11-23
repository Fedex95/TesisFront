import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Cart from '../components/cart/Cart';
import { BrowserRouter } from 'react-router-dom';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockToastShow = jest.fn();
jest.mock('primereact/toast', () => {
  const React = require('react');
  return {
    Toast: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({
        show: mockToastShow
      }));
      return <div data-testid="toast" />;
    })
  };
});
jest.mock('primereact/button', () => ({
  Button: (props) => <button {...props}>{props.label || props.children}</button>
}));
jest.mock('primereact/card', () => ({
  Card: ({ children, ...props }) => <div {...props}>{children}</div>
}));

beforeAll(() => {
  const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
  helpers.createStylesheet = jest.fn(() => ({
    cssRules: [],
    insertRule: jest.fn(),
    deleteRule: jest.fn(),
  }));
});

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
    mockToastShow.mockClear();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders cart title', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    expect(screen.getByText('Carrito de Préstamos')).toBeInTheDocument();
  });

  test('renders catalog button', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
  });

  test('renders empty cart message', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
  });

  test('renders catalog button as button element', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    expect(screen.getByRole('button', { name: /catálogo/i })).toBeInTheDocument();
  });

  test('renders cart container', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    expect(screen.getByText('Carrito de Préstamos')).toBeInTheDocument(); 
  });

  test('fetches cart items on mount when userData.id exists', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Libro 1');
    expect(screen.getByText('Libro 2')).toBeInTheDocument();
    expect(screen.getByText('Autor: Autor 1')).toBeInTheDocument();
    expect(screen.getByText('Autor: Autor 2')).toBeInTheDocument();
    expect(screen.getByText('Cantidad: 2')).toBeInTheDocument();
    expect(screen.getByText('Cantidad: 1')).toBeInTheDocument();
  });

  test('displays cart items with correct images', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Libro 1');
    const imgs = screen.getAllByAltText('Libro 1');
    expect(imgs[0]).toHaveAttribute('src', 'http://example.com/image.jpg');
  });

  test('image onError hides the image', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Libro 1');
    const img = screen.getAllByAltText('Libro 1')[0];
    fireEvent.error(img);
    expect(img.style.display).toBe('none');
  });

  test('remove button has correct aria-label', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Libro 1');
    const removeButtons = screen.getAllByRole('button', { name: /eliminar/i });
    expect(removeButtons[0]).toHaveAttribute('aria-label', 'Eliminar');
  });

  test('loan button is disabled when cart is empty', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    const loanButton = screen.queryByText('Solicitar Préstamo');
    expect(loanButton).toBeNull(); 
  });

  test('loan button is enabled when cart has items', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Solicitar Préstamo');
    const loanButton = screen.getByText('Solicitar Préstamo');
    expect(loanButton).not.toBeDisabled();
  });

  test('after successful loan, cart is cleared', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    apiFetch.mockResolvedValueOnce();
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Solicitar Préstamo');
    const loanButton = screen.getByText('Solicitar Préstamo');
    fireEvent.click(loanButton);
    await waitFor(() => {
      expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
    });
  });

  test('summary shows correct number of books', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Solicitar Préstamo');
    expect(screen.getByText('Libros solicitados: 2')).toBeInTheDocument();
  });

  test('cart items are mapped correctly', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Libro 1');
    expect(screen.getByText('Libro 2')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  test('removes item from cart', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    apiFetch.mockResolvedValueOnce();
    apiFetch.mockResolvedValueOnce(mockCartData);
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Libro 1');
    const removeButtons = screen.getAllByRole('button', { name: /eliminar/i }); 
    fireEvent.click(removeButtons[0]);
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/cart/eliminar/1', { method: 'DELETE' });
    });
    expect(mockToastShow).toHaveBeenCalledWith(
      expect.objectContaining({ detail: 'Libro eliminado del carrito' })
    );
  });

  test('handles loan request successfully', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    apiFetch.mockResolvedValueOnce();
    apiFetch.mockResolvedValueOnce({ items: [] });
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Solicitar Préstamo');
    const loanButton = screen.getByRole('button', { name: /solicitar préstamo/i });
    expect(loanButton).not.toBeDisabled();
    fireEvent.click(loanButton);
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/prestamos', { method: 'POST', body: JSON.stringify({ items: mockCartData.items }) });
    });
    expect(mockToastShow).toHaveBeenCalledWith(
      expect.objectContaining({ detail: 'Préstamo solicitado exitosamente' })
    );
  });

  test('shows error on fetch failure', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Fetch error'));
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({ detail: 'No se pudieron cargar los items del carrito' })
      );
    });
  });

  test('shows error on remove failure', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    apiFetch.mockRejectedValueOnce(new Error('Remove error'));
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Libro 1');
    const removeButtons = screen.getAllByRole('button', { name: /eliminar/i });
    fireEvent.click(removeButtons[0]);
    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({ detail: 'No se pudo eliminar el libro' })
      );
    });
  });

  test('shows error on loan failure', async () => {
    apiFetch.mockResolvedValueOnce(mockCartData);
    apiFetch.mockRejectedValueOnce(new Error('Loan error'));
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Solicitar Préstamo');
    const loanButton = screen.getByText('Solicitar Préstamo');
    fireEvent.click(loanButton);
    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({ detail: 'Loan error' })
      );
    });
  });

  test('navigates to home on catalog button click', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={mockUserData} />
      </BrowserRouter>
    );
    const catalogButton = screen.getByText('Catálogo');
    fireEvent.click(catalogButton);
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  test('does not fetch cart if no userData.id', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Cart userData={{}} />
      </BrowserRouter>
    );
    expect(apiFetch).not.toHaveBeenCalled();
  });
});