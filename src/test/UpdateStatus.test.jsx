import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import UpdateStatus from '../components/UpdateStatus';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
    apiFetch: jest.fn(),
}));

const mockToast = { current: { show: jest.fn() } };

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
            expect(mockToast.current.show).toHaveBeenCalledWith({
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

        await waitFor(() => {
            expect(screen.getByText('ID Préstamo: 1')).toBeInTheDocument();
            expect(screen.getByText('Usuario: Juan Pérez')).toBeInTheDocument();
            expect(screen.getByText('Estado actual: pendiente')).toBeInTheDocument();
            expect(screen.getByText('Libro 1 - Autor: Autor 1 x2')).toBeInTheDocument();
            expect(screen.getByText('Total libros: 3')).toBeInTheDocument();
        });
    });

    test('renders update button for each loan', async () => {
        apiFetch.mockResolvedValueOnce(mockPrestamos);

        render(<UpdateStatus userData={mockUserData} toast={mockToast} />);

        await waitFor(() => {
            const buttons = screen.getAllByText('Actualizar Estado');
            expect(buttons).toHaveLength(2);
        });
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

        await waitFor(() => {
            expect(screen.getByText('Fecha de solicitud: 30/9/2023')).toBeInTheDocument();
        });
    });

    test('calculates total libros correctly', async () => {
        apiFetch.mockResolvedValueOnce(mockPrestamos);

        render(<UpdateStatus userData={mockUserData} toast={mockToast} />);

        await waitFor(() => {
            expect(screen.getByText('Total libros: 3')).toBeInTheDocument();
            expect(screen.getByText('Total libros: 1')).toBeInTheDocument();
        });
    });

    test('renders multiple book details', async () => {
        apiFetch.mockResolvedValueOnce(mockPrestamos);

        render(<UpdateStatus userData={mockUserData} toast={mockToast} />);

        await waitFor(() => {
            expect(screen.getByText('Libro 1 - Autor: Autor 1 x2')).toBeInTheDocument();
            expect(screen.getByText('Libro 2 - Autor: Autor 2 x1')).toBeInTheDocument();
            expect(screen.getByText('Libro 3 - Autor: Autor 3 x1')).toBeInTheDocument();
        });
    });

    test('changes status of specific loan', async () => {
        apiFetch.mockResolvedValueOnce(mockPrestamos); 
        apiFetch.mockResolvedValueOnce({});            

        render(<UpdateStatus userData={mockUserData} toast={mockToast} />);

        await screen.findByText('ID Préstamo: 1');

        const dropdown = document.getElementById('status-1');
        const trigger = within(dropdown).getByRole('button');
        fireEvent.click(trigger);

        const listbox = await screen.findByRole('listbox');
        const option = within(listbox).getByText('Listo');
        fireEvent.click(option);

        const updateBtn = screen.getAllByRole('button', { name: 'Actualizar Estado' })[0];
        fireEvent.click(updateBtn);

        await waitFor(() => {
            expect(apiFetch).toHaveBeenCalledWith('/api/prestamos/1/estado', {
                method: 'PUT',
                body: JSON.stringify({ estado: 'listo' })
            });

            expect(mockToast.current.show).toHaveBeenCalled();
        });

        const card1 = screen.getByText('ID Préstamo: 1').closest('.p-card');
        expect(
            within(card1).getByText(/Estado actual:\s*listo/i)
        ).toBeInTheDocument();
    });

});