import { render, screen, waitFor} from '@testing-library/react';
import UpdateStatus from '../components/cart/UpdateStatus';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
    apiFetch: jest.fn(),
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
jest.mock('primereact/dropdown', () => ({
  Dropdown: ({ value, onChange, options, ...props }) => (
    <select {...props} value={value} onChange={(e) => onChange({ value: e.target.value })}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  )
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

const mockToast = { current: { show: mockToastShow } };

const mockUserData = { id: 1 };

const mockPrestamos = [
    {
        id: 1,
        fechaSolicitud: '2023-10-01',
        usuario: { nombre: 'Juan Pérez' },
        estado: 'pendiente',
        detallesPrestamo: [
            { id: 1, libro: { titulo: 'Libro 1', autor: 'Autor 1' }, cantidad: 2 },
            { id: 2, libro: { titulo: 'Libro 2', autor: 'Autor 2' }, cantidad: 1 },
        ],
    },
    {
        id: 2,
        fechaSolicitud: '2023-10-02',
        usuario: { nombre: 'Ana Gómez' },
        estado: 'listo',
        detallesPrestamo: [
            { id: 3, libro: { titulo: 'Libro 3', autor: 'Autor 3' }, cantidad: 1 },
        ],
    },
];

describe('UpdateStatus Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockToastShow.mockClear();
    });

    test('fetches loans on mount if userData.id is present', async () => {
        apiFetch.mockResolvedValueOnce(mockPrestamos);

        render(<UpdateStatus userData={mockUserData} toast={mockToast} />);

        await waitFor(() => {
            expect(apiFetch).toHaveBeenCalledWith('/api/prestamos/all');
        });
    });

    test('does not fetch loans if userData.id is not present', () => {
        render(<UpdateStatus userData={{}} toast={mockToast} />);

        expect(apiFetch).not.toHaveBeenCalled();
    });

    test('handles fetch error and shows toast', async () => {
        apiFetch.mockRejectedValueOnce(new Error('Network error'));

        render(<UpdateStatus userData={mockUserData} toast={mockToast} />);

        await waitFor(() => {
            expect(mockToastShow).toHaveBeenCalledWith({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar los préstamos',
                life: 3000,
            });
        });
    });

    test('displays loans correctly', async () => {
        apiFetch.mockResolvedValueOnce(mockPrestamos);

        render(<UpdateStatus userData={mockUserData} toast={mockToast} />);

        await screen.findByText('ID Préstamo: 1');
        expect(screen.getByText('Usuario: Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('Estado actual: pendiente')).toBeInTheDocument();
        expect(screen.getByText('Libro 1 - Autor: Autor 1 x2')).toBeInTheDocument();
        expect(screen.getByText('Total libros: 3')).toBeInTheDocument();
    });

    test('renders update button for each loan', async () => {
        apiFetch.mockResolvedValueOnce(mockPrestamos);

        render(<UpdateStatus userData={mockUserData} toast={mockToast} />);

        await screen.findByText('ID Préstamo: 1');
        const buttons = screen.getAllByText('Actualizar Estado');
        expect(buttons).toHaveLength(2);
    });

    test('renders empty list when no loans', async () => {
        apiFetch.mockResolvedValueOnce([]);

        render(<UpdateStatus userData={mockUserData} toast={mockToast} />);

        await waitFor(() => {
            expect(screen.queryByText('ID Préstamo:')).not.toBeInTheDocument();
        });
    });

    test('displays correct date format', async () => {
        apiFetch.mockResolvedValueOnce(mockPrestamos);

        render(<UpdateStatus userData={mockUserData} toast={mockToast} />);

        await screen.findByText('Fecha de solicitud: 1/10/2023');
    });

    test('calculates total libros correctly', async () => {
        apiFetch.mockResolvedValueOnce(mockPrestamos);

        render(<UpdateStatus userData={mockUserData} toast={mockToast} />);

        await screen.findByText('Total libros: 3');
        expect(screen.getByText('Total libros: 1')).toBeInTheDocument();
    });

    test('renders multiple book details', async () => {
        apiFetch.mockResolvedValueOnce(mockPrestamos);

        render(<UpdateStatus userData={mockUserData} toast={mockToast} />);

        await screen.findByText('Libro 1 - Autor: Autor 1 x2');
        expect(screen.getByText('Libro 2 - Autor: Autor 2 x1')).toBeInTheDocument();
        expect(screen.getByText('Libro 3 - Autor: Autor 3 x1')).toBeInTheDocument();
    });
});