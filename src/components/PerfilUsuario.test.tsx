import { render, screen } from '@testing-library/react';
import Profile from './PerfilUsuario';

beforeAll(() => {
  // Mock createStylesheet to avoid CSS parsing errors
  const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
  helpers.createStylesheet = jest.fn(() => ({}));
});

describe('Profile Component', () => {
  test('renders profile title', () => {
    render(<Profile userData={{}} />);
    expect(screen.getByText('Datos personales')).toBeInTheDocument();
  });

  test('displays user data', () => {
    const userData = {
      nombre: 'Juan',
      apellido: 'Pérez',
      cedula: '123456789',
      email: 'juan@example.com',
      usuario: 'juanp',
      telefono: '123-456-7890',
      direccion: 'Calle 123',
    };
    render(<Profile userData={userData} />);
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('Pérez')).toBeInTheDocument();
    expect(screen.getByText('123456789')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    expect(screen.getByText('juanp')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    expect(screen.getByText('Calle 123')).toBeInTheDocument();
  });

  test('displays default text for missing data', () => {
    render(<Profile userData={{}} />);
    expect(screen.getAllByText('No disponible')).toHaveLength(7);
  });
});