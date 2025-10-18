import { render, screen, fireEvent } from '@testing-library/react';
import Menu from './Producto';

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
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    });

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
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    });

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
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
      .mockResolvedValueOnce({
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
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
      .mockResolvedValueOnce({
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
});