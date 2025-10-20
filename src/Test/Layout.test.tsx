import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../components/Layout';

global.fetch = jest.fn();

const mockOnLogout = jest.fn();
const mockUserData = { id: 1, role: 'ADMIN' };
const mockChildren = <div>Test Children</div>;

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(true)
    });
  });

  test('renders navigation (layout container)', async () => {
    render(
      <MemoryRouter>
        <Layout onLogout={mockOnLogout} cartItemsCount={0} userData={mockUserData}>
          {mockChildren}
        </Layout>
      </MemoryRouter>
    );
    // prefer semantic queries over direct DOM access
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
  });
});