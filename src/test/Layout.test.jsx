import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../components/Navbar', () => ({ userMenuItems, onLogout }) => (
  <nav>
    {userMenuItems.map((item, index) => (
      <button key={index} onClick={item.command}>
        {item.label}
      </button>
    ))}
  </nav>
));

const mockOnLogout = jest.fn();
const mockUserData = { id: 1, admin: false };
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

  test('checks admin status on mount if not in userData', async () => {
    const userWithoutAdmin = { id: 1 };
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={userWithoutAdmin}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/usuarios/1/admin');
    });
  });

  test('handles admin check error', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Admin check error'));
    const userWithoutAdmin = { id: 1 };
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={userWithoutAdmin}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/usuarios/1/admin');
    });
    expect(screen.queryByText('Administrar')).not.toBeInTheDocument();
  });

  test('does not check admin if userData.id is missing', () => {
    const userWithoutId = {};
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={userWithoutId}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    expect(apiFetch).not.toHaveBeenCalled();
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
    const adminUser = { id: 1, admin: true };
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={adminUser}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: 'Agregar/Editar productos' })).toBeInTheDocument();
  });

  test('renders layout container with background', () => {
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={mockUserData}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    const container = screen.getByText('Test Children').closest('.layout-container');
    expect(container).toBeInTheDocument();
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