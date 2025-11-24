import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/home/Navbar';

const mockToggle = jest.fn();
const mockUserMenu = { current: { toggle: mockToggle } };
const mockUserMenuItems = [
  { label: 'Perfil', command: jest.fn() },
  { label: 'Cerrar Sesión', command: jest.fn() },
];
const mockUserData = { nombre: 'Juan', apellido: 'Pérez' };

beforeAll(() => {
  const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
  helpers.createStylesheet = jest.fn(() => ({}));
});

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders navbar with brand link', () => {
    render(
      <MemoryRouter>
        <Navbar
          cartItemsCount={0}
          userMenuItems={mockUserMenuItems}
          userMenu={mockUserMenu}
          userData={mockUserData}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Library Master')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Library Master' })).toHaveAttribute('href', '/home');
  });

  test('displays user name and surname', () => {
    render(
      <MemoryRouter>
        <Navbar
          cartItemsCount={0}
          userMenuItems={mockUserMenuItems}
          userMenu={mockUserMenu}
          userData={mockUserData}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('Pérez')).toBeInTheDocument();
  });

  test('shows cart badge when cartItemsCount > 0', () => {
    render(
      <MemoryRouter>
        <Navbar
          cartItemsCount={3}
          userMenuItems={mockUserMenuItems}
          userMenu={mockUserMenu}
          userData={mockUserData}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('does not show cart badge when cartItemsCount is 0', () => {
    render(
      <MemoryRouter>
        <Navbar
          cartItemsCount={0}
          userMenuItems={mockUserMenuItems}
          userMenu={mockUserMenu}
          userData={mockUserData}
        />
      </MemoryRouter>
    );
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});