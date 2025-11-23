import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdateLibro from '../components/book/Updateproduct';
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
jest.mock('primereact/inputtext', () => ({
  InputText: (props) => <input {...props} />
}));
jest.mock('primereact/inputnumber', () => ({
  InputNumber: ({ value, onValueChange, ...props }) => (
    <input type="number" {...props} value={value} onChange={(e) => onValueChange({ value: parseInt(e.target.value) })} />
  )
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
const mockOnClose = jest.fn();

describe('UpdateLibro Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToastShow.mockClear();
  });

  test('renders without crashing', () => {
    apiFetch.mockResolvedValueOnce([]);
    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);
    expect(screen.getByText('Seleccionar libro')).toBeInTheDocument();
    expect(screen.getByText('Cerrar')).toBeInTheDocument();
  });

  test('fetches products on mount', async () => {
    const mockLibros = [
      { id: 1, titulo: 'Libro 1', descripcion: 'Desc 1', autor: 'Autor 1', isbn: '1234567890', imagenUrl: 'url1', categoria: 'Ficción', copiasDisponibles: 10 },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);

    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/libros');
    });
  });

  test('fetch error shows error toast', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los libros.',
        life: 3000,
      });
    });
  });


  test('close button calls onClose', () => {
    apiFetch.mockResolvedValueOnce([]);
    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);
    const closeButton = screen.getByText('Cerrar');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('renders dropdown with product options', async () => {
    const mockLibros = [
      { id: 1, titulo: 'Libro 1', descripcion: 'Desc 1', autor: 'Autor 1', isbn: '1234567890', imagenUrl: 'url1', categoria: 'Ficción', copiasDisponibles: 10 },
      { id: 2, titulo: 'Libro 2', descripcion: 'Desc 2', autor: 'Autor 2', isbn: '0987654321', imagenUrl: 'url2', categoria: 'NoFicción', copiasDisponibles: 5 },
    ];
    apiFetch.mockResolvedValueOnce(mockLibros);

    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);

    const dropdown = screen.getByRole('combobox');
    fireEvent.click(dropdown);
    await screen.findByText('Libro 1');
    expect(screen.getByText('Libro 2')).toBeInTheDocument();
  });

  test('does not render form fields initially', () => {
    apiFetch.mockResolvedValueOnce([]);
    render(<UpdateLibro toast={mockToast} onClose={mockOnClose} />);
    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument();
  });
});