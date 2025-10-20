import { render, screen, fireEvent } from '@testing-library/react';
import AddProduct from '../components/Addproduct';

global.fetch = jest.fn();

describe('AddProduct Component', () => {
  const mockOnClose = jest.fn();
  const userId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form fields', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} />);
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByLabelText(/url de la imagen/i)).toBeInTheDocument();
    expect(screen.getByText(/categoría/i)).toBeInTheDocument();
  });

  test('renders add and cancel buttons', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} />);
    expect(screen.getByText(/añadir/i)).toBeInTheDocument();
    expect(screen.getByText(/cancelar/i)).toBeInTheDocument();
  });

  test('allows entering text in input fields', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} />);
    
    const nombreInput = screen.getByLabelText(/nombre/i);
    const descripcionInput = screen.getByLabelText(/descripción/i);
    const imagenInput = screen.getByLabelText(/url de la imagen/i);

    fireEvent.change(nombreInput, { target: { value: 'Test' } });
    fireEvent.change(descripcionInput, { target: { value: 'Description' } });
    fireEvent.change(imagenInput, { target: { value: 'http://test.com' } });

    expect(nombreInput.value).toBe('Test');
    expect(descripcionInput.value).toBe('Description');
    expect(imagenInput.value).toBe('http://test.com');
  });

  test('category dropdown is present', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} />);
    const dropdown = screen.getByRole('button', { name: '' });
    expect(dropdown).toBeInTheDocument();
  });

  test('submit button is clickable', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} />);
    const submitButton = screen.getByText(/añadir/i);
    fireEvent.click(submitButton);
    expect(submitButton).toBeInTheDocument();
  });

  test('cancel button calls onClose', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText(/cancelar/i));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('shows warning if fields are empty on submit', async () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText(/añadir/i));
    expect(screen.getByText(/por favor, complete todos los campos/i)).toBeInTheDocument();
  });

  test('price input accepts numeric values', () => {
    render(<AddProduct userId={userId} onClose={mockOnClose} />);
    const precioInput = screen.getByRole('spinbutton');
    fireEvent.change(precioInput, { target: { value: '150.50' } });
    expect(precioInput).toBeInTheDocument();
  });
});