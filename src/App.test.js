import { render, screen} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

const renderWithRouter = (ui, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders login page when not authenticated', () => {
    renderWithRouter(<App />);
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument(); 
  });

  test('renders home page when authenticated', () => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userData', JSON.stringify({ id: 1, name: 'User' }));
    renderWithRouter(<App />, { route: '/' });
    expect(screen.getByText(/electro master/i)).toBeInTheDocument();
  });

  test('handleLogin updates state and localStorage', async () => {
  });

  test('handleLogout clears state and localStorage', () => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userData', JSON.stringify({ id: 1 }));
    localStorage.setItem('admin', 'true');
    renderWithRouter(<App />, { route: '/' });
  });

  test('redirects to login if not authenticated and accessing protected route', () => {
    renderWithRouter(<App />, { route: '/cart' });
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();  
  });

  test('renders admin view only if admin', () => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userData', JSON.stringify({ id: 1 }));
    localStorage.setItem('admin', 'true');
    renderWithRouter(<App />, { route: '/admin' });
    expect(screen.getByText(/agregar/i)).toBeInTheDocument();
  });
});
