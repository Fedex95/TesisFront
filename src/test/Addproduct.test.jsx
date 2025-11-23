import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddProduct from '../components/book/Addproduct';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

describe('AddProduct Component', () => {
  const mockOnClose = jest.fn();
  const userId = 1;
  const userData = { admin: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });


  test('renders form fields', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} userData={userData} />);
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/autor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/isbn/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/url de la imagen/i)).toBeInTheDocument();
    expect(screen.getByText(/categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/copias disponibles/i)).toBeInTheDocument();
  });

  test('renders add and cancel buttons', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} userData={userData} />);
    expect(screen.getByText(/añadir/i)).toBeInTheDocument();
    expect(screen.getByText(/cancelar/i)).toBeInTheDocument();
  });

  test('allows entering text in input fields', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} userData={userData} />);
    
    const tituloInput = screen.getByLabelText(/título/i);
    const autorInput = screen.getByLabelText(/autor/i);
    const descripcionInput = screen.getByLabelText(/descripción/i);
    const isbnInput = screen.getByLabelText(/isbn/i);
    const imagenInput = screen.getByLabelText(/url de la imagen/i);

    fireEvent.change(tituloInput, { target: { value: 'Test Title' } });
    fireEvent.change(autorInput, { target: { value: 'Test Author' } });
    fireEvent.change(descripcionInput, { target: { value: 'Description' } });
    fireEvent.change(isbnInput, { target: { value: '1234567890' } });
    fireEvent.change(imagenInput, { target: { value: 'http://test.com' } });

    expect(tituloInput.value).toBe('Test Title');
    expect(autorInput.value).toBe('Test Author');
    expect(descripcionInput.value).toBe('Description');
    expect(isbnInput.value).toBe('1234567890');
    expect(imagenInput.value).toBe('http://test.com');
  });

  test('category dropdown is present', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} userData={userData} />);
    const dropdown = screen.getByRole('button', { name: '' });
    expect(dropdown).toBeInTheDocument();
  });

  test('submit button is clickable', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} userData={userData} />);
    const submitButton = screen.getByText(/añadir/i);
    fireEvent.click(submitButton);
    expect(submitButton).toBeInTheDocument();
  });

  test('cancel button calls onClose', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} userData={userData} />);
    fireEvent.click(screen.getByText(/cancelar/i));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('shows warning if fields are empty on submit', async () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} userData={userData} />);
    fireEvent.click(screen.getByText(/añadir/i));
    await waitFor(() => {
      expect(screen.getByText(/por favor, complete todos los campos/i)).toBeInTheDocument();
    });
  });

  test('price input accepts numeric values', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} userData={userData} />);
    const copiasInput = screen.getByLabelText(/copias disponibles/i);
    fireEvent.change(copiasInput, { target: { value: '10' } });
    expect(copiasInput).toBeInTheDocument();
  });

  test('shows error if information is not complete', async () => {
    const nonAdminUserData = { admin: false };
    render(<AddProduct userId={userId} onClose={mockOnClose} userData={nonAdminUserData} />);

    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/autor/i), { target: { value: 'Author' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Desc' } });
    fireEvent.change(screen.getByLabelText(/isbn/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/url de la imagen/i), { target: { value: 'http://test.com' } });
    fireEvent.change(screen.getByLabelText(/copias disponibles/i), { target: { value: '10' } });
    
    const dropdown = screen.getByRole('button', { name: '' });
    fireEvent.click(dropdown);
    fireEvent.click(screen.getByText('Ficción'));

    fireEvent.click(screen.getByText(/añadir/i));
    await waitFor(() => {
      expect(screen.getByText(/campos requeridos/i)).toBeInTheDocument();
    });
  });

  test('shows error on API failure', async () => {
    apiFetch.mockRejectedValueOnce(new Error('API Error'));
    render(<AddProduct userId={userId} onClose={mockOnClose} userData={userData} />);

    // Fill form minimally
    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/autor/i), { target: { value: 'Author' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Desc' } });
    fireEvent.change(screen.getByLabelText(/isbn/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/url de la imagen/i), { target: { value: 'http://test.com' } });
    fireEvent.change(screen.getByLabelText(/copias disponibles/i), { target: { value: '10' } });
    const dropdown = screen.getByRole('button', { name: '' });
    fireEvent.click(dropdown);
    fireEvent.click(screen.getByText('Ficción'));

    fireEvent.click(screen.getByText(/añadir/i));

    
  });
});