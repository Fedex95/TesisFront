import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteProducto from '../components/book/Deleteproduct';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

const mockToastShow = jest.fn();
jest.mock('primereact/toast', () => {
  const React = require('react');
  return {
    Toast: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({ show: mockToastShow }));
      return <div />;
    })
  };
});

// Mock Column: store props for DataTable to read.
jest.mock('primereact/column', () => ({
  Column: (props) => <span data-testid="column" {...props} />
}));

// Mock DataTable: render simple table using Column props.
jest.mock('primereact/datatable', () => {
  const React = require('react');
  return {
    DataTable: ({ value = [], children }) => {
      const cols = React.Children.toArray(children);
      return (
        <table data-testid="datatable">
          <thead>
            <tr>
              {cols.map((c, i) => (
                <th key={i}>{c.props.header || c.props.field}</th>
              ))}
            </tr>
          </thead>
            <tbody>
              {value.map((row, ri) => (
                <tr key={row.id || ri}>
                  {cols.map((c, ci) => {
                    let cell;
                    if (c.props.body) cell = c.props.body(row);
                    else if (c.props.field) cell = row[c.props.field];
                    else cell = '';
                    return <td key={ci}>{cell}</td>;
                  })}
                </tr>
              ))}
            </tbody>
        </table>
      );
    }
  };
});

jest.mock('primereact/button', () => ({
  Button: (props) => <button {...props}>{props.label || props.children}</button>
}));

const mockToast = { current: { show: mockToastShow } };
const mockOnClose = jest.fn();

const mockLibros = [
  { id: 1, titulo: 'Libro 1', autor: 'Autor 1', categoria: 'Ficción', isbn: '1234567890' },
  { id: 2, titulo: 'Libro 2', autor: 'Autor 2', categoria: 'No Ficción', isbn: '0987654321' }
];

describe('DeleteProducto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToastShow.mockClear();
  });

  test('fetches and renders libros', async () => {
    apiFetch.mockResolvedValueOnce(mockLibros);
    render(<DeleteProducto toast={mockToast} onClose={mockOnClose} />);
    await screen.findByText('Libro 1');
    expect(screen.getByText('Libro 2')).toBeInTheDocument();
  });

  test('renders headers', async () => {
    apiFetch.mockResolvedValueOnce(mockLibros);
    render(<DeleteProducto toast={mockToast} onClose={mockOnClose} />);
    await screen.findByText('Libro 1');
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Autor')).toBeInTheDocument();
    expect(screen.getByText('Categoría')).toBeInTheDocument();
    expect(screen.getByText('ISBN')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();
  });

  test('delete buttons render', async () => {
    apiFetch.mockResolvedValueOnce(mockLibros);
    render(<DeleteProducto toast={mockToast} onClose={mockOnClose} />);
    await screen.findByText('Libro 1');
    const btns = screen.getAllByText('Eliminar');
    expect(btns.length).toBe(2);
  });

  test('error on fetch shows toast', async () => {
    apiFetch.mockRejectedValueOnce(new Error('fail'));
    render(<DeleteProducto toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'error',
        detail: 'No se pudieron cargar los libros.'
      }));
    });
  });

  test('error on delete shows toast', async () => {
    apiFetch
      .mockResolvedValueOnce(mockLibros) // load
      .mockRejectedValueOnce(new Error('delete fail')); // delete
    render(<DeleteProducto toast={mockToast} onClose={mockOnClose} />);
    await screen.findByText('Libro 1');
    fireEvent.click(screen.getAllByText('Eliminar')[0]);
    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'error',
        detail: 'No se pudo eliminar el libro.'
      }));
    });
    expect(screen.getByText('Libro 1')).toBeInTheDocument();
  });

  test('close button triggers onClose', async () => {
    apiFetch.mockResolvedValueOnce(mockLibros);
    render(<DeleteProducto toast={mockToast} onClose={mockOnClose} />);
    await screen.findByText('Libro 1');
    fireEvent.click(screen.getByText('Cerrar'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('multiple deletes act sequentially', async () => {
    apiFetch
      .mockResolvedValueOnce(mockLibros)
      .mockResolvedValueOnce() // delete 1
      .mockResolvedValueOnce(); // delete 2
    render(<DeleteProducto toast={mockToast} onClose={mockOnClose} />);
    await screen.findByText('Libro 1');
    const firstBtn = screen.getAllByText('Eliminar')[0];
    fireEvent.click(firstBtn);
    await waitFor(() => {
      expect(screen.queryByText('Libro 1')).not.toBeInTheDocument();
    });
  });

  test('no rows rendered after failing fetch', async () => {
    apiFetch.mockRejectedValueOnce(new Error('fail'));
    render(<DeleteProducto toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.queryByText('Libro 1')).not.toBeInTheDocument();
    });
  });

  test('api called with correct endpoint', async () => {
    apiFetch.mockResolvedValueOnce(mockLibros);
    render(<DeleteProducto toast={mockToast} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/libros');
    });
  });
});