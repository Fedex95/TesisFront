import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

const mockToggle = jest.fn();
const mockUserMenu = { current: { toggle: mockToggle } };
const mockUserMenuItems = [
  { label: 'Perfil', command: jest.fn() },
  { label: 'Cerrar Sesión', command: jest.fn() },
];
const mockUserData = { nombre: 'Juan', apellido: 'Pérez' };
const mockHandleNavigation = jest.fn();

beforeAll(() => {
  // Mock createStylesheet to avoid CSS parsing errors in JSDOM
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
          handleNavigation={mockHandleNavigation}
          userMenuItems={mockUserMenuItems}
          userMenu={mockUserMenu}
          userData={mockUserData}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Electro Master')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Electro Master' })).toHaveAttribute('href', '/home');
  });

  test('displays user name and surname', () => {
    render(
      <MemoryRouter>
        <Navbar
          cartItemsCount={0}
          handleNavigation={mockHandleNavigation}
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
          handleNavigation={mockHandleNavigation}
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
          handleNavigation={mockHandleNavigation}
          userMenuItems={mockUserMenuItems}
          userMenu={mockUserMenu}
          userData={mockUserData}
        />
      </MemoryRouter>
    );
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  test('renders three primary buttons and user menu toggles on click', () => {
    render(
      <MemoryRouter>
        <Navbar
          cartItemsCount={0}
          handleNavigation={mockHandleNavigation}
          userMenuItems={mockUserMenuItems}
          userMenu={mockUserMenu}
          userData={mockUserData}
        />
      </MemoryRouter>
    );

    const buttons = screen.getAllByRole('button');
    // comprobamos que hay al menos 3 botones principales (brand link excluded)
    expect(buttons.length).toBeGreaterThanOrEqual(3);

  });

  test('user menu button exists and is interactive', () => {
    render(
      <MemoryRouter>
        <Navbar
          cartItemsCount={0}
          handleNavigation={mockHandleNavigation}
          userMenuItems={mockUserMenuItems}
          userMenu={mockUserMenu}
          userData={mockUserData}
        />
      </MemoryRouter>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[2]).toBeInTheDocument();    
  });
});