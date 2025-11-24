import { render, screen, waitFor } from '@testing-library/react';
import Pedido from '../components/cart/Pedido';
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
    const mockPrestamos = [
      {
        id: 1,
        fechaSolicitud: '2023-09-29',
        usuario: { nombre: 'Juan' },
        estado: 'Pendiente',
        detallesPrestamo: [
          { id: 1, libro: { titulo: 'Libro 1', autor: 'Autor 1' }, cantidad: 2 },
          { id: 2, libro: { titulo: 'Libro 2', autor: 'Autor 2' }, cantidad: 1 },
        ],
      },
    ];
    const mockTicket = { codigo: 'TICKET123' };
    apiFetch.mockResolvedValueOnce(mockPrestamos);
    apiFetch.mockResolvedValueOnce(mockTicket);

    render(<Pedido userData={{ id: 1 }} />);

    const idElem = await screen.findByText('ID Préstamo: 1');
    expect(idElem).toBeInTheDocument();

    const nombreElem = await screen.findByText(/Juan/);
    expect(nombreElem).toBeInTheDocument();

    const estadoElem = await screen.findByText('Estado: Pendiente');
    expect(estadoElem).toBeInTheDocument();

    const ticketElem = await screen.findByText('Ticket: TICKET123');
    expect(ticketElem).toBeInTheDocument();

    const totalElem = await screen.findByText('Total libros: 3');
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
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching loans:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('displays multiple orders', async () => {
  const mockPrestamos = [
    {
      id: 1,
      fechaSolicitud: '2023-09-29',
      usuario: { nombre: 'Juan' },
      estado: 'Aprobado',
      detallesPrestamo: [
        { id: 1, libro: { titulo: 'Libro 1', autor: 'Autor 1' }, cantidad: 1 },
      ],
    },
    {
      id: 2,
      fechaSolicitud: '2023-09-30',
      usuario: { nombre: 'Ana' },
      estado: 'Rechazado',
      detallesPrestamo: [
        { id: 3, libro: { titulo: 'Libro 3', autor: 'Autor 3' }, cantidad: 1 },
      ],
    },
  ];

  const mockTicket1 = { codigo: 'TICKET1' };
  const mockTicket2 = { codigo: 'TICKET2' };
  apiFetch.mockResolvedValueOnce(mockPrestamos);
  apiFetch.mockResolvedValueOnce(mockTicket1);
  apiFetch.mockResolvedValueOnce(mockTicket2);

  render(<Pedido userData={{ id: 1 }} />);

  const idElem1 = await screen.findByText('ID Préstamo: 1');
  const idElem2 = await screen.findByText('ID Préstamo: 2');
  expect(idElem1).toBeInTheDocument();
  expect(idElem2).toBeInTheDocument();

  const nombreElem1 = await screen.findByText(/Juan/);
  const nombreElem2 = await screen.findByText(/Ana/);
  expect(nombreElem1).toBeInTheDocument();
  expect(nombreElem2).toBeInTheDocument();

  const totalElems = await screen.findAllByText('Total libros: 1');
  expect(totalElems).toHaveLength(2);
});


  test('displays empty list when no orders', async () => {
    apiFetch.mockResolvedValueOnce([]);

    render(<Pedido userData={{ id: 1 }} />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/prestamos/all');
    });

    expect(screen.queryByText('ID Préstamo:')).not.toBeInTheDocument();
  });

  test('displays product details correctly', async () => {
    const mockPrestamos = [
      {
        id: 1,
        fechaSolicitud: '2023-09-29',
        usuario: { nombre: 'Juan' },
        estado: 'Pendiente',
        detallesPrestamo: [
          { id: 1, libro: { titulo: 'Libro 1', autor: 'Autor 1' }, cantidad: 2 },
        ],
      },
    ];
    const mockTicket = { codigo: 'TICKET123' };
    apiFetch.mockResolvedValueOnce(mockPrestamos);
    apiFetch.mockResolvedValueOnce(mockTicket);

    render(<Pedido userData={{ id: 1 }} />);

    const detailElem = await screen.findByText('Libro 1 - Autor: Autor 1 x2');
    expect(detailElem).toBeInTheDocument();
  });
});