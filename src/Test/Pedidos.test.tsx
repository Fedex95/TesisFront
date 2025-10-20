import { render, screen } from '@testing-library/react';
import Pedidos from '../components/Pedidos';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeAll(() => {
  // Mock createStylesheet to avoid CSS parsing errors
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
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockOrders),
    });

    render(<Pedidos userId={1} />);

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();

    const rows = await screen.findAllByRole('row'); 
    expect(rows).toHaveLength(2); 
  });

  test('handles fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Pedidos userId={1} />);

    // Usa findByText para esperar al mensaje de error 
    const err = await screen.findByText(/Error/);
    expect(err).toBeInTheDocument();
  });
});