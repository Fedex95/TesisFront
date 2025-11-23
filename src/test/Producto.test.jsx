import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Menu from '../components/book/Producto';
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
    const mockLibros = [
      {
        id: 1,
        titulo: 'Libro 1',
        descripcion: 'Descripción 1',
        autor: 'Autor 1',
        categoria: 'Ficción',
        imagenUrl: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);

    render(<Menu userData={{ id: 1 }} />);

    const libro = await screen.findByText('Libro 1');
    const autor = await screen.findByText('Autor: Autor 1');
    expect(libro).toBeInTheDocument();
    expect(autor).toBeInTheDocument();
  });

  test('opens dialog on product click', async () => {
    const mockLibros = [
      {
        id: 1,
        titulo: 'Libro 1',
        descripcion: 'Descripción 1',
        autor: 'Autor 1',
        categoria: 'Ficción',
        imagenUrl: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);

    render(<Menu userData={{ id: 1 }} />);

    const libro = await screen.findByText('Libro 1');
    fireEvent.click(libro);
    const details = await screen.findByText(/detalles del libro/i);
    expect(details).toBeInTheDocument();
  });

  test('adds to cart successfully', async () => {
    const mockLibros = [
      {
        id: 1,
        titulo: 'Libro 1',
        descripcion: 'Descripción 1',
        autor: 'Autor 1',
        categoria: 'Ficción',
        imagenUrl: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);
    apiFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<Menu userData={{ id: 1 }} />);

    const libro = await screen.findByText('Libro 1');
    fireEvent.click(libro);
    const addBtn = screen.getByText('Agregar al carrito');
    fireEvent.click(addBtn);

    const successMsg = await screen.findByText('Libro 1 agregado al carrito');
    expect(successMsg).toBeInTheDocument();
  });

  test('handles add to cart error', async () => {
    const mockLibros = [
      {
        id: 1,
        titulo: 'Libro 1',
        descripcion: 'Descripción 1',
        autor: 'Autor 1',
        categoria: 'Ficción',
        imagenUrl: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);
    apiFetch.mockResolvedValueOnce({
      ok: false,
    });

    render(<Menu userData={{ id: 1 }} />);

    const libro = await screen.findByText('Libro 1');
    fireEvent.click(libro);
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
    const mockLibros = [
      {
        id: 1,
        titulo: 'Libro 1',
        descripcion: 'Descripción 1',
        autor: 'Autor 1',
        categoria: 'Ficción',
        imagenUrl: 'url1',
      },
      {
        id: 2,
        titulo: 'Libro 2',
        descripcion: 'Descripción 2',
        autor: 'Autor 2',
        categoria: 'NoFicción',
        imagenUrl: 'url2',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);

    render(<Menu userData={{ id: 1 }} />);

    const ficcionTitle = await screen.findAllByText('Ficción');
    const noFiccionTitle = await screen.findAllByText('No Ficción');
    expect(ficcionTitle.length).toBeGreaterThan(0);
    expect(noFiccionTitle.length).toBeGreaterThan(0);
  });

  test('displays product description in dialog', async () => {
    const mockLibros = [
      {
        id: 1,
        titulo: 'Libro 1',
        descripcion: 'Descripción 1',
        autor: 'Autor 1',
        categoria: 'Ficción',
        imagenUrl: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);

    render(<Menu userData={{ id: 1 }} />);

    const libro = await screen.findByText('Libro 1');
    fireEvent.click(libro);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Descripción 1')).toBeInTheDocument();
  });

  test('handles add to cart network error', async () => {
    const mockLibros = [
      {
        id: 1,
        titulo: 'Libro 1',
        descripcion: 'Descripción 1',
        autor: 'Autor 1',
        categoria: 'Ficción',
        imagenUrl: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);
    apiFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Menu userData={{ id: 1 }} />);

    const libro = await screen.findByText('Libro 1');
    fireEvent.click(libro);
    const addBtn = screen.getByText('Agregar al carrito');
    fireEvent.click(addBtn);

    const errMsg = await screen.findByText('Ocurrió un problema al agregar al carrito');
    expect(errMsg).toBeInTheDocument();
  });

  test('renders cards for products', async () => {
    const mockLibros = [
      {
        id: 1,
        titulo: 'Libro 1',
        descripcion: 'Descripción 1',
        autor: 'Autor 1',
        categoria: 'Ficción',
        imagenUrl: 'url1',
      },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);

    render(<Menu userData={{ id: 1 }} />);

    const card = await screen.findByText(/Libro 1/i);
    expect(card).toBeInTheDocument();
  });

  test('calls apiFetch with correct endpoint', async () => {
    apiFetch.mockResolvedValueOnce([]);

    render(<Menu userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/libros');
    });
  });
});