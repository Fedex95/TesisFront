import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../components/Login';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockOnLogin = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

beforeAll(() => {
    // Mock createStylesheet to avoid CSS parsing errors
    const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
    helpers.createStylesheet = jest.fn(() => ({}));
});

describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders login form elements', () => {
        render(
            <MemoryRouter>
                <Login onLogin={mockOnLogin} />
            </MemoryRouter>
        );
        expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
        expect(screen.getByText('Regístrate aquí')).toBeInTheDocument();
    });

    test('button is disabled when fields are empty', () => {
        render(
            <MemoryRouter>
                <Login onLogin={mockOnLogin} />
            </MemoryRouter>
        );
        const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
        expect(submitButton).toBeDisabled();
    });

    test('allows entering username and password', () => {
        render(
            <MemoryRouter>
                <Login onLogin={mockOnLogin} />
            </MemoryRouter>
        );
        const usernameInput = screen.getByLabelText('Usuario') as HTMLInputElement;
        const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña') as HTMLInputElement;

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'testpass' } });

        expect(usernameInput.value).toBe('testuser');
        expect(passwordInput.value).toBe('testpass');
    });

});

test('shows success message and navigates on successful login', async () => {
    mockFetch.mockResolvedValueOnce({ status: 200 });
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ usuario: 'testuser', id: 1 }]) });
    render(
        <MemoryRouter>
            <Login onLogin={mockOnLogin} />
        </MemoryRouter>
    );
    const usernameInput = screen.getByLabelText('Usuario') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    const successMsg = await screen.findByText('Inicio de sesión exitoso');
    expect(successMsg).toBeInTheDocument();

    await waitFor(() => expect(mockOnLogin).toHaveBeenCalledWith({ usuario: 'testuser', id: 1 }));
});

test('shows error message on invalid login', async () => {
    mockFetch.mockResolvedValueOnce({ status: 400 });
    render(
        <MemoryRouter>
            <Login onLogin={mockOnLogin} />
        </MemoryRouter>
    );
    const usernameInput = screen.getByLabelText('Usuario') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText('Usuario o contraseña incorrectos')).toBeInTheDocument();
    });
});

test('shows error on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    render(
        <MemoryRouter>
            <Login onLogin={mockOnLogin} />
        </MemoryRouter>
    );
    const usernameInput = screen.getByLabelText('Usuario') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Ingresa tu contraseña') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText('Error al iniciar sesión')).toBeInTheDocument();
    });
});