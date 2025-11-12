import { render, screen, waitFor } from '@testing-library/react';
import Pedido from '../components/Pedido';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

beforeAll(() => {
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
    apiFetch.mockResolvedValueOnce(mockOrders);

    render(<Pedido userData={{ id: 1 }} />);

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
    expect(apiFetch).not.toHaveBeenCalled();
  });

  test('handles fetch error', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<Pedido userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching orders:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('displays multiple orders', async () => {
    const mockOrders = [
      {
        id: 1,
        fecha: '2023-09-29',
        usuario: { nombre: 'Juan', apellido: 'Pérez' },
        detalles: [
          { id: 1, nombreProducto: 'Producto 1', cantidad: 1, precio: 10 },
        ],
      },
      {
        id: 2,
        fecha: '2023-09-30',
        usuario: { nombre: 'Ana', apellido: 'Gómez' },
        detalles: [
          { id: 3, nombreProducto: 'Producto 3', cantidad: 1, precio: 15 },
        ],
      },
    ];
    apiFetch.mockResolvedValueOnce(mockOrders);

    render(<Pedido userData={{ id: 1 }} />);

    const idElem1 = await screen.findByText('ID Pedido: 1');
    const idElem2 = await screen.findByText('ID Pedido: 2');
    expect(idElem1).toBeInTheDocument();
    expect(idElem2).toBeInTheDocument();

    const nombreElem1 = await screen.findByText(/Juan/);
    const nombreElem2 = await screen.findByText(/Ana/);
    expect(nombreElem1).toBeInTheDocument();
    expect(nombreElem2).toBeInTheDocument();

    const totalElem1 = await screen.findByText('Total: 10 USD');
    const totalElem2 = await screen.findByText('Total: 15 USD');
    expect(totalElem1).toBeInTheDocument();
    expect(totalElem2).toBeInTheDocument();
  });

  test('displays empty list when no orders', async () => {
    apiFetch.mockResolvedValueOnce([]);

    render(<Pedido userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/historial/all');
    });

    expect(screen.queryByText('ID Pedido:')).not.toBeInTheDocument();
  });

  test('displays product details correctly', async () => {
    const mockOrders = [
      {
        id: 1,
        fecha: '2023-09-29',
        usuario: { nombre: 'Juan', apellido: 'Pérez' },
        detalles: [
          { id: 1, nombreProducto: 'Producto 1', cantidad: 2, precio: 20 },
        ],
      },
    ];
    apiFetch.mockResolvedValueOnce(mockOrders);

    render(<Pedido userData={{ id: 1 }} />);

    const detailElem = await screen.findByText('Producto 1 x2 - 20 USD');
    expect(detailElem).toBeInTheDocument();
  });
});