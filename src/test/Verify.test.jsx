import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Verify from '../components/auth/Verify';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockLocation = { state: { email: 'test@example.com' } };

beforeEach(() => {
  jest.clearAllMocks();
  require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  require('react-router-dom').useLocation.mockReturnValue(mockLocation);
});

describe('Verify Component', () => {
  test('renders without crashing', () => {
    render(<Verify />);
    expect(screen.getByText('Verifica tu cuenta')).toBeInTheDocument();
  });

  test('sets email from location state', () => {
    render(<Verify />);
    const emailInput = screen.getByPlaceholderText('Ingresa tu email');
    expect(emailInput.value).toBe('test@example.com');
  });

  test('does not set email if no state', () => {
    require('react-router-dom').useLocation.mockReturnValue({ state: null });
    render(<Verify />);
    const emailInput = screen.getByPlaceholderText('Ingresa tu email');
    expect(emailInput.value).toBe('');
  });

  test('allows entering email and code', () => {
    render(<Verify />);
    const emailInput = screen.getByPlaceholderText('Ingresa tu email');
    const codeInput = screen.getByPlaceholderText('Código de 6 caracteres');

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });

    expect(emailInput.value).toBe('new@example.com');
    expect(codeInput.value).toBe('123456');
  });

  test('shows warning on verify with missing email', async () => {
    render(<Verify />);
    const emailInput = screen.getByPlaceholderText('Ingresa tu email');
    fireEvent.change(emailInput, { target: { value: '' } });
    const codeInput = screen.getByPlaceholderText('Código de 6 caracteres');
    fireEvent.change(codeInput, { target: { value: '123456' } });

    const verifyButton = screen.getByText('Verificar');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Completa email y código de 6 caracteres')).toBeInTheDocument();
    });
  });

  test('shows warning on verify with missing code', async () => {
    render(<Verify />);
    const codeInput = screen.getByPlaceholderText('Código de 6 caracteres');
    fireEvent.change(codeInput, { target: { value: '' } });

    const verifyButton = screen.getByText('Verificar');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Completa email y código de 6 caracteres')).toBeInTheDocument();
    });
  });

  test('shows warning on verify with code less than 6 characters', async () => {
    render(<Verify />);
    const codeInput = screen.getByPlaceholderText('Código de 6 caracteres');
    fireEvent.change(codeInput, { target: { value: '123' } });

    const verifyButton = screen.getByText('Verificar');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Completa email y código de 6 caracteres')).toBeInTheDocument();
    });
  });

  test('successful verification navigates to login', async () => {
    apiFetch.mockResolvedValueOnce();

    render(<Verify />);
    const codeInput = screen.getByPlaceholderText('Código de 6 caracteres');
    fireEvent.change(codeInput, { target: { value: '123456' } });

    const verifyButton = screen.getByText('Verificar');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', code: '123456' }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Cuenta verificada exitosamente. Ahora puedes iniciar sesión.')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('shows error on verification failure', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Invalid code'));

    render(<Verify />);
    const codeInput = screen.getByPlaceholderText('Código de 6 caracteres');
    fireEvent.change(codeInput, { target: { value: '123456' } });

    const verifyButton = screen.getByText('Verificar');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Código inválido. Intenta de nuevo.')).toBeInTheDocument();
    });
  });

  test('shows warning on resend without email', async () => {
    require('react-router-dom').useLocation.mockReturnValue({ state: null });
    render(<Verify />);

    const resendButton = screen.getByText('Reenviar código');
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText('Ingresa tu email primero')).toBeInTheDocument();
    });
  });

  test('successful resend shows success toast', async () => {
    apiFetch.mockResolvedValueOnce();

    render(<Verify />);

    const resendButton = screen.getByText('Reenviar código');
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/auth/resend', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Revisa tu correo.')).toBeInTheDocument();
    });
  });

  test('shows error on resend failure', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Resend error'));

    render(<Verify />);

    const resendButton = screen.getByText('Reenviar código');
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText('No se pudo reenviar el código.')).toBeInTheDocument();
    });
  });

  test('navigates to login on link click', () => {
    render(<Verify />);

    const loginLink = screen.getByText('Volver al login');
    fireEvent.click(loginLink);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('renders all form elements', () => {
    render(<Verify />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Código')).toBeInTheDocument();
    expect(screen.getByText('Verificar')).toBeInTheDocument();
    expect(screen.getByText('Reenviar código')).toBeInTheDocument();
    expect(screen.getByText('Volver al login')).toBeInTheDocument();
  });

  test('code input has maxLength 6', () => {
    render(<Verify />);
    const codeInput = screen.getByPlaceholderText('Código de 6 caracteres');
    expect(codeInput).toHaveAttribute('maxLength', '6');
  });

  test('handles email change', () => {
    render(<Verify />);
    const emailInput = screen.getByPlaceholderText('Ingresa tu email');
    fireEvent.change(emailInput, { target: { value: 'changed@example.com' } });
    expect(emailInput.value).toBe('changed@example.com');
  });

  test('handles code change', () => {
    render(<Verify />);
    const codeInput = screen.getByPlaceholderText('Código de 6 caracteres');
    fireEvent.change(codeInput, { target: { value: '654321' } });
    expect(codeInput.value).toBe('654321');
  });
});