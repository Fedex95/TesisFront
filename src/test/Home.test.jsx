import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../components/home/Home';
import { BrowserRouter } from 'react-router-dom';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
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
jest.mock('primereact/card', () => ({
  Card: ({ children, onClick }) => <div data-testid="card" onClick={onClick}>{children}</div>
}));
jest.mock('primereact/button', () => ({
  Button: (props) => {
    const label = props['aria-label'] || props.label ||
      (props.icon?.includes('pi-plus') ? 'plus' :
       props.icon?.includes('pi-minus') ? 'minus' : (props.children || 'button'));
    return (
      <button
        {...props}
        aria-label={label}
        disabled={props.disabled}
      >
        {props.children || label}
      </button>
    );
  }
}));
jest.mock('primereact/inputnumber', () => ({
  InputNumber: ({ value, onValueChange, min = 1, max = 10, readOnly }) => (
    <input
      type="number"
      aria-label="cantidad"
      value={value}
      readOnly={readOnly}
      min={min}
      max={max}
      onChange={(e) => {
        const v = parseInt(e.target.value, 10);
        onValueChange && onValueChange({ value: v });
      }}
    />
  )
}));
jest.mock('primereact/carousel', () => ({
  Carousel: ({ value, itemTemplate }) => (
    <div data-testid="carousel">
      {value && value.map(itemTemplate)}
    </div>
  )
}));

beforeAll(() => {
  if (!global.crypto) {
    global.crypto = {
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 4294967296);
        return arr;
      }
    };
  }
});


const mockLibros = [
  { id: 1, titulo: 'Libro 1', autor: 'Autor 1', descripcion: 'Desc 1', categoria: 'Ficción', isbn: '1234567890', imagenUrl: 'http://example.com/1.jpg' },
  { id: 2, titulo: 'Libro 2', autor: 'Autor 2', descripcion: 'Desc 2', categoria: 'NoFicción', isbn: '0987654321', imagenUrl: 'http://example.com/2.jpg' }
];

const mockNavigate = jest.fn();
const mockUserData = { id: 10 };

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToastShow.mockClear();
    sessionStorage.setItem('auth_token', 'token');
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    apiFetch.mockResolvedValue(mockLibros);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test('renderiza libros en el carousel', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    expect(await screen.findByText('Libro 1')).toBeInTheDocument();
    expect(screen.getByText('Libro 2')).toBeInTheDocument();
  });

  test('abre el diálogo al hacer click en un libro', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);
    expect(screen.getByText('Detalles del Libro')).toBeInTheDocument();
  });

  test('muestra imagen en diálogo', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);
    const imgs = screen.getAllByAltText('Libro 1');
    expect(imgs.length).toBeGreaterThan(0);
  });

  test('muestra ISBN en diálogo', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);
    expect(screen.getByText('ISBN: 1234567890')).toBeInTheDocument();
  });

  test('no navega a login si hay token', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Libro 1');
    expect(mockNavigate).not.toHaveBeenCalledWith('/login');
  });

  test('navega a login si no hay token', () => {
    sessionStorage.removeItem('auth_token');
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('cantidad inicial en diálogo es 1', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('mapea categoría NoFicción a etiqueta No Ficción', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Libro 2');
    expect(screen.getByText('No Ficción')).toBeInTheDocument();
  });

  test('usa imagen fallback al error', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Libro 1');
    const img = screen.getAllByAltText('Libro 1')[0];
    fireEvent.error(img);
    expect(img.src).toContain('https://via.placeholder.com/300');
  });

  test('incrementa cantidad con botón plus en tarjeta', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Libro 1');
    const plusBtn = screen.getAllByRole('button', { name: /plus/i })[0];
    const spin = screen.getAllByRole('spinbutton')[0];
    expect(spin.value).toBe('1');
    fireEvent.click(plusBtn);
    expect(spin.value).toBe('2');
  });

  test('deshabilita minus al llegar a 1 y plus al llegar a 10', async () => {
    render(
      <BrowserRouter>
        <Home userData={mockUserData} />
      </BrowserRouter>
    );
    await screen.findByText('Libro 1');
    const plusBtn = screen.getAllByRole('button', { name: /plus/i })[0];
    const minusBtn = screen.getAllByRole('button', { name: /minus/i })[0];
    expect(minusBtn).toBeDisabled();
    for (let i = 0; i < 9; i++) fireEvent.click(plusBtn);
    expect(plusBtn).toBeDisabled();
  });


  test('muestra error si usuario no logueado al agregar', async () => {
    apiFetch.mockResolvedValueOnce(mockLibros);
    render(
      <BrowserRouter>
        <Home userData={{}} />
      </BrowserRouter>
    );
    const libro1 = await screen.findByText('Libro 1');
    fireEvent.click(libro1);
    fireEvent.click(screen.getByText('Agregar al carrito'));
    expect(mockToastShow).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: 'Debe iniciar sesión para agregar al carrito' })
    );
  });
});