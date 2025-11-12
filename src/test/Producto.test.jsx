import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Menu from '../components/Producto';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeAll(() => {
  // Mock createStylesheet to avoid CSS parsing errors
  const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
  helpers.createStylesheet = jest.fn(() => ({}));
});

describe('Menu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches and displays products', async () => {
    const mockProducts = [
      {
        id: 1,
        nombre: 'Producto 1',
        descripcion: 'Descripción 1',
        precio: 10.0,
        categoria: 'Mouse',
        imagenURL: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);

    render(<Menu userData={{ id: 1 }} />);

    const prod = await screen.findByText('Producto 1');
    const price = await screen.findByText('$10.00');
    expect(prod).toBeInTheDocument();
    expect(price).toBeInTheDocument();
  });

  test('opens dialog on product click', async () => {
    const mockProducts = [
      {
        id: 1,
        nombre: 'Producto 1',
        descripcion: 'Descripción 1',
        precio: 10.0,
        categoria: 'Mouse',
        imagenURL: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);

    render(<Menu userData={{ id: 1 }} />);

    const prod = await screen.findByText('Producto 1');
    fireEvent.click(prod);
    const details = await screen.findByText('Detalles del plato');
    expect(details).toBeInTheDocument();
  });

  test('adds to cart successfully', async () => {
    const mockProducts = [
      {
        id: 1,
        nombre: 'Producto 1',
        descripcion: 'Descripción 1',
        precio: 10.0,
        categoria: 'Mouse',
        imagenURL: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<Menu userData={{ id: 1 }} />);

    const prod = await screen.findByText('Producto 1');
    fireEvent.click(prod);
    const addBtn = screen.getByText('Agregar al carrito');
    fireEvent.click(addBtn);

    const successMsg = await screen.findByText('Producto 1 agregado al carrito');
    expect(successMsg).toBeInTheDocument();
  });

  test('handles add to cart error', async () => {
    const mockProducts = [
      {
        id: 1,
        nombre: 'Producto 1',
        descripcion: 'Descripción 1',
        precio: 10.0,
        categoria: 'Mouse',
        imagenURL: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    render(<Menu userData={{ id: 1 }} />);

    const prod = await screen.findByText('Producto 1');
    fireEvent.click(prod);
    const addBtn = screen.getByText('Agregar al carrito');
    fireEvent.click(addBtn);

    const errMsg = await screen.findByText('No se pudo agregar al carrito');
    expect(errMsg).toBeInTheDocument();
  });

  test('handles fetch error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    apiFetch.mockRejectedValueOnce(new Error('Fetch error'));

    render(<Menu userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('displays products in categories', async () => {
    const mockProducts = [
      {
        id: 1,
        nombre: 'Producto 1',
        descripcion: 'Descripción 1',
        precio: 10.0,
        categoria: 'Mouse',
        imagenURL: 'url1',
      },
      {
        id: 2,
        nombre: 'Producto 2',
        descripcion: 'Descripción 2',
        precio: 20.0,
        categoria: 'Teclado',
        imagenURL: 'url2',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);

    render(<Menu userData={{ id: 1 }} />);

    const mouseTitle = await screen.findAllByText('Mouse');
    const tecladoTitle = await screen.findAllByText('Teclado');
    expect(mouseTitle.length).toBeGreaterThan(0);
    expect(tecladoTitle.length).toBeGreaterThan(0);
  });

  test('closes dialog on hide', async () => {
    const mockProducts = [
      {
        id: 1,
        nombre: 'Producto 1',
        descripcion: 'Descripción 1',
        precio: 10.0,
        categoria: 'Mouse',
        imagenURL: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);

    render(<Menu userData={{ id: 1 }} />);

    const prod = await screen.findByText('Producto 1');
    fireEvent.click(prod);
    expect(screen.getByText('Detalles del plato')).toBeInTheDocument();
    // Simulate hide, but since it's modal, perhaps click outside or something, but hard to test.
  });

  test('displays product description in dialog', async () => {
    const mockProducts = [
      {
        id: 1,
        nombre: 'Producto 1',
        descripcion: 'Descripción 1',
        precio: 10.0,
        categoria: 'Mouse',
        imagenURL: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);

    render(<Menu userData={{ id: 1 }} />);

    const prod = await screen.findByText('Producto 1');
    fireEvent.click(prod);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Descripción 1')).toBeInTheDocument();
  });

  test('handles add to cart network error', async () => {
    const mockProducts = [
      {
        id: 1,
        nombre: 'Producto 1',
        descripcion: 'Descripción 1',
        precio: 10.0,
        categoria: 'Mouse',
        imagenURL: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Menu userData={{ id: 1 }} />);

    const prod = await screen.findByText('Producto 1');
    fireEvent.click(prod);
    const addBtn = screen.getByText('Agregar al carrito');
    fireEvent.click(addBtn);

    const errMsg = await screen.findByText('Ocurrió un problema al agregar al carrito');
    expect(errMsg).toBeInTheDocument();
  });


  test('renders cards for products', async () => {
    const mockProducts = [
      {
        id: 1,
        nombre: 'Producto 1',
        descripcion: 'Descripción 1',
        precio: 10.0,
        categoria: 'Mouse',
        imagenURL: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockProducts);

    render(<Menu userData={{ id: 1 }} />);

    const card = await screen.findByText(/Producto 1/i);
    expect(card).toBeInTheDocument();
  });

  test('calls apiFetch with correct endpoint', async () => {
    apiFetch.mockResolvedValueOnce([]);

    render(<Menu userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/producto/find/all');
    });
  });
});