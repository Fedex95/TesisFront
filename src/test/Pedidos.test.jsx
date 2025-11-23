import { render, screen, waitFor } from '@testing-library/react';
import Pedidos from '../components/cart/Pedidos';
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
    render(<Pedidos userData={{ id: 1 }} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('fetches and displays orders', async () => {
    const mockPedidos = [
      {
        id: 1,
        fechaSolicitud: '2023-10-01',
        usuario: { nombre: 'Juan Pérez', usuario: 'juanp' },
        estado: 'Aprobado',
        detallesPrestamo: [
          { libro: { titulo: 'Libro 1', autor: 'Autor 1' }, cantidad: 2 },
          { libro: { titulo: 'Libro 2', autor: 'Autor 2' }, cantidad: 1 },
        ],
      },
    ];
    const mockTicket = { codigo: 'TICKET123' };
    apiFetch.mockResolvedValueOnce(mockPedidos);
    apiFetch.mockResolvedValueOnce(mockTicket);

    render(<Pedidos userData={{ id: 1 }} />);

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();

    const rows = await screen.findAllByRole('row');
    expect(rows).toHaveLength(2);
  });

  test('handles fetch error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    apiFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Pedidos userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('displays empty table when no orders', async () => {
    apiFetch.mockResolvedValueOnce([]);

    render(<Pedidos userData={{ id: 1 }} />);

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();

    const rows = await screen.findAllByRole('row');
    expect(rows).toHaveLength(2);
  });

  test('calculates total correctly', async () => {
    const mockPedidos = [
      {
        id: 1,
        fechaSolicitud: '2023-10-01',
        usuario: { nombre: 'Juan Pérez', usuario: 'juanp' },
        estado: 'Aprobado',
        detallesPrestamo: [
          { libro: { titulo: 'Libro 1', autor: 'Autor 1' }, cantidad: 2 },
          { libro: { titulo: 'Libro 2', autor: 'Autor 2' }, cantidad: 1 },
        ],
      },
    ];
    const mockTicket = { codigo: 'TICKET123' };
    apiFetch.mockResolvedValueOnce(mockPedidos);
    apiFetch.mockResolvedValueOnce(mockTicket);

    render(<Pedidos userData={{ id: 1 }} />);

    const totalElem = await screen.findByText('3');
    expect(totalElem).toBeInTheDocument();
  });

  test('renders table headers', () => {
    render(<Pedidos userData={{ id: 1 }} />);
    expect(screen.getByText('Fecha de solicitud')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Título del libro')).toBeInTheDocument();
    expect(screen.getByText('Autor')).toBeInTheDocument();
    expect(screen.getByText('Cantidad')).toBeInTheDocument();
    expect(screen.getByText('Ticket')).toBeInTheDocument();
  });

  test('calls apiFetch with correct endpoint', async () => {
    apiFetch.mockResolvedValueOnce([]);

    render(<Pedidos userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/prestamos/historial');
    });
  });
});