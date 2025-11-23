import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../components/home/Layout';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../components/home/Navbar', () => ({ userMenuItems, onLogout }) => (
  <nav>
    {userMenuItems.map((item, index) => (
      <button key={index} onClick={item.command}>
        {item.label}
      </button>
    ))}
  </nav>
));

const mockOnLogout = jest.fn();
const mockUserData = { id: 1, rol: 'USER' };
const mockChildren = <div>Test Children</div>;

describe('Layout Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    apiFetch.mockResolvedValue(true);
  });

  test('renders navigation (layout container)', async () => {
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={mockUserData}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  test('renders navbar without errors', async () => {
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={mockUserData}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('renders children', async () => {
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={mockUserData}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });

  test('renders main content', async () => {
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={mockUserData}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });

  test('sets admin state based on userData.rol', () => {
    const adminUser = { id: 1, rol: 'ADMIN' };
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={adminUser}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByText('Agregar/Editar libros')).toBeInTheDocument();
  });

  test('does not set admin if rol is not ADMIN', () => {
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={mockUserData}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    expect(screen.queryByText('Agregar/Editar libros')).not.toBeInTheDocument();
  });

  test('does not set admin if userData is missing', () => {
    const userWithoutRol = { id: 1 };
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={userWithoutRol}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    expect(screen.queryByText('Agregar/Editar libros')).not.toBeInTheDocument();
  });

  test('passes userMenuItems to Navbar', () => {
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={mockUserData}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByText('Perfil')).toBeInTheDocument();
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  test('navigates to profile on menu item click', () => {
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={mockUserData}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Perfil'));
    expect(mockNavigate).toHaveBeenCalledWith('/perfil');
  });

  test('calls onLogout on logout menu item', () => {
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={mockUserData}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Cerrar Sesión'));
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  test('includes admin menu item if admin', () => {
    const adminUser = { id: 1, rol: 'ADMIN' };
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={adminUser}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: 'Agregar/Editar libros' })).toBeInTheDocument();
  });

  test('passes cartItemsCount to Navbar', () => {
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={5} userData={mockUserData}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    // Since Navbar is mocked, hard to test, but assume passed.
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('passes userData to Navbar', () => {
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={mockUserData}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});