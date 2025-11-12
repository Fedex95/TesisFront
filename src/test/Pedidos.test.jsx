import { render, screen, waitFor } from '@testing-library/react';
import Pedidos from '../components/Pedidos';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

beforeAll(() => {
  const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
  helpers.createStylesheet = jest.fn(() => ({}));
});

describe('Pedidos Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<Pedidos userId={1} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('fetches and displays orders', async () => {
    const mockOrders = [
      {
        id: 1,
        fecha: '2023-10-01',
        usuario: { nombre: 'Juan Pérez', usuario: 'juanp' },
        detalles: [
          { nombreProducto: 'Producto 1', cantidad: 2, precio: 10 },
          { nombreProducto: 'Producto 2', cantidad: 1, precio: 20 },
        ],
      },
    ];
    apiFetch.mockResolvedValueOnce(mockOrders);

    render(<Pedidos userId={1} />);

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();

    const rows = await screen.findAllByRole('row');
    expect(rows).toHaveLength(2);
  });

  test('handles fetch error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    apiFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Pedidos userId={1} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('displays empty table when no orders', async () => {
    apiFetch.mockResolvedValueOnce([]);

    render(<Pedidos userId={1} />);

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();

    const rows = await screen.findAllByRole('row');
    expect(rows).toHaveLength(2); 
    expect(screen.getByText(/No available options/i)).toBeInTheDocument();
  });

  test('calculates total correctly', async () => {
    const mockOrders = [
      {
        id: 1,
        fecha: '2023-10-01',
        usuario: { nombre: 'Juan Pérez', usuario: 'juanp' },
        detalles: [
          { nombreProducto: 'Producto 1', cantidad: 2, precio: 10 },
          { nombreProducto: 'Producto 2', cantidad: 1, precio: 20 },
        ],
      },
    ];
    apiFetch.mockResolvedValueOnce(mockOrders);

    render(<Pedidos userId={1} />);

    const totalElem = await screen.findByText('$40.00');
    expect(totalElem).toBeInTheDocument();
  });

  test('renders table headers', () => {
    render(<Pedidos userId={1} />);
    expect(screen.getByText('Fecha de compra')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Nombre del producto')).toBeInTheDocument();
    expect(screen.getByText('Cantidad')).toBeInTheDocument();
    expect(screen.getByText('Precio')).toBeInTheDocument();
  });

  test('calls apiFetch with correct endpoint', async () => {
    apiFetch.mockResolvedValueOnce([]);

    render(<Pedidos userId={1} />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/historial/user');
    });
  });
});