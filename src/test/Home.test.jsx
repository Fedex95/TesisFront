import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../components/Home';

describe('Home Component', () => {
  test('renders welcome message', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(screen.getByText('Bienvenido a Library Master')).toBeInTheDocument();
  });

  test('renders list of libros', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(screen.getByText('Libro 1')).toBeInTheDocument();
    expect(screen.getByText('Libro 2')).toBeInTheDocument();
  });

  test('renders libro details', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(screen.getByText('Descripción 1')).toBeInTheDocument();
    expect(screen.getByText('Autor: Autor 1')).toBeInTheDocument();
  });

  test('renders ver detalles button for each libro', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const buttons = screen.getAllByText('Ver detalles');
    expect(buttons).toHaveLength(2);
  });

  test('renders libro images', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const images = screen.getAllByAltText(/Libro/);
    expect(images).toHaveLength(2);
  });
});