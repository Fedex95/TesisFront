import { render, screen, waitFor } from '@testing-library/react';
import Pedido from './Pedido';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeAll(() => {
  // Mock createStylesheet to avoid CSS parsing errors
  const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
  helpers.createStylesheet = jest.fn(() => ({}));
});

describe('Pedido Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches and displays orders when userData.id is present', async () => {
    const mockOrders = [
      {
        id: 1,
        fecha: '2023-09-29',
        usuario: { nombre: 'Juan', apellido: 'Pérez' },
        detalles: [
          { id: 1, nombreProducto: 'Producto 1', cantidad: 2, precio: 10 },
          { id: 2, nombreProducto: 'Producto 2', cantidad: 1, precio: 20 },
        ],
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockOrders),
    });

    render(<Pedido userData={{ id: 1 }} />);

    // una aserción por espera: usa findBy* para cada elemento
    const idElem = await screen.findByText('ID Pedido: 1');
    expect(idElem).toBeInTheDocument();

    const nombreElem = await screen.findByText(/Juan/);
    expect(nombreElem).toBeInTheDocument();

    const apellidoElem = await screen.findByText(/Pérez/);
    expect(apellidoElem).toBeInTheDocument();

    const totalElem = await screen.findByText('Total: 30 USD');
    expect(totalElem).toBeInTheDocument();
  });

  test('does not fetch if userData.id is not present', () => {
    render(<Pedido userData={{}} />);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('handles fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<Pedido userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching orders:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});