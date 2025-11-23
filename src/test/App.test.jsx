import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

jest.mock('../components/auth/Login', () => ({ onLogin }) => (
  <div>
    <h1>Iniciar Sesión</h1>
    <button onClick={() => onLogin({ id: 1, nombre: 'User', rol: 'USER', token: 'token' })}>Login</button>
  </div>
));

jest.mock('../components/home/Layout', () => ({ children, onLogout }) => (
  <div>
    <div>{children}</div>
    <button onClick={onLogout}>Logout</button>
  </div>
));

jest.mock('../components/home/Home', () => () => <div>Library Master</div>);
jest.mock('../components/home/Adminview', () => () => <div>Agregar</div>);
jest.mock('../components/auth/Register', () => () => <div>Register</div>);
jest.mock('../components/cart/Cart', () => () => <div>Cart</div>);
jest.mock('../components/cart/Pedidos', () => () => <div>Pedidos</div>);
jest.mock('../components/book/Producto', () => () => <div>Producto</div>);
jest.mock('../components/home/PerfilUsuario', () => () => <div>Perfil</div>);

const renderWithRouter = (ui, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('renders login page when not authenticated', () => {
    renderWithRouter(<App />);
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('renders home page when authenticated', () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userData', JSON.stringify({ id: 1, nombre: 'User', rol: 'USER' }));
    renderWithRouter(<App />, { route: '/' });
    expect(screen.getByText(/library master/i)).toBeInTheDocument();
  });

  test('handleLogin updates state and sessionStorage', async () => {
    renderWithRouter(<App />);

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(sessionStorage.getItem('isAuthenticated')).toBe('true');
    });

    expect(JSON.parse(sessionStorage.getItem('userData'))).toEqual({
      id: 1,
      nombre: 'User',
      rol: 'USER',
      token: 'token'
    });

    expect(sessionStorage.getItem('admin')).toBe('false');
    expect(sessionStorage.getItem('auth_token')).toBe('token');
  });


  test('handleLogout clears state and sessionStorage', () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userData', JSON.stringify({ id: 1 }));
    sessionStorage.setItem('admin', 'true');
    sessionStorage.setItem('auth_token', 'token');
    renderWithRouter(<App />, { route: '/' });
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    expect(sessionStorage.getItem('isAuthenticated')).toBeNull();
    expect(sessionStorage.getItem('userData')).toBeNull();
    expect(sessionStorage.getItem('admin')).toBeNull();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  test('redirects to login if not authenticated and accessing protected route', () => {
    renderWithRouter(<App />, { route: '/cart' });
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('renders admin view only if admin', () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userData', JSON.stringify({ id: 1, rol: 'ADMIN' }));
    sessionStorage.setItem('admin', 'true');
    renderWithRouter(<App />, { route: '/admin' });
    expect(screen.getByText(/agregar/i)).toBeInTheDocument();
  });

  test('renders register page', () => {
    renderWithRouter(<App />, { route: '/register' });
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  test('renders cart page when authenticated', () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userData', JSON.stringify({ id: 1 }));
    renderWithRouter(<App />, { route: '/cart' });
    expect(screen.getByText('Cart')).toBeInTheDocument();
  });

  test('renders pedidos page when authenticated', () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userData', JSON.stringify({ id: 1 }));
    renderWithRouter(<App />, { route: '/pedidos' });
    expect(screen.getByText('Pedidos')).toBeInTheDocument();
  });

  test('renders producto page when authenticated', () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userData', JSON.stringify({ id: 1 }));
    renderWithRouter(<App />, { route: '/producto' });
    expect(screen.getByText('Producto')).toBeInTheDocument();
  });

  test('renders perfil page when authenticated', () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userData', JSON.stringify({ id: 1 }));
    renderWithRouter(<App />, { route: '/perfil' });
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  test('redirects to home for unknown route when authenticated', () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userData', JSON.stringify({ id: 1, rol: 'USER' }));
    renderWithRouter(<App />, { route: '/unknown' });
    expect(screen.getByText(/library master/i)).toBeInTheDocument();
  });

  test('redirects to login for unknown route when not authenticated', () => {
    renderWithRouter(<App />, { route: '/unknown' });
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('does not render admin view if not admin', () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userData', JSON.stringify({ id: 1, rol: 'USER' }));
    sessionStorage.setItem('admin', 'false');
    renderWithRouter(<App />, { route: '/admin' });
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
  });
});
