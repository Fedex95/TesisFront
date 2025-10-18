import { render, screen, fireEvent } from '@testing-library/react';
import AdminMenu from './Adminview';

jest.mock('./Addproduct', () => () => <div>Add Product Component</div>);
jest.mock('./Pedido', () => () => <div>Pedido Component</div>);
jest.mock('./Deleteproduct', () => () => <div>Delete Product Component</div>);
jest.mock('./Updateproduct', () => () => <div>Update Product Component</div>);

beforeAll(() => {
  // Mock createStylesheet to avoid CSS parsing errors
  const helpers = require('jsdom/lib/jsdom/living/helpers/stylesheets');
  helpers.createStylesheet = jest.fn(() => ({}));
});

describe('AdminMenu Component', () => {
  test('renders menubar with menu items', () => {
    render(<AdminMenu userData={{ id: 1 }} />);
    expect(screen.getByText('Agregar')).toBeInTheDocument();
    expect(screen.getByText('Actualizar')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
    expect(screen.getByText('Pedidos')).toBeInTheDocument();
  });

  test('opens add product dialog on menu click', () => {
    render(<AdminMenu userData={{ id: 1 }} />);
    const addButton = screen.getByText('Agregar');
    fireEvent.click(addButton);
    expect(screen.getByText('Add Product Component')).toBeInTheDocument();
  });

  test('opens update product dialog on menu click', () => {
    render(<AdminMenu userData={{ id: 1 }} />);
    const updateButton = screen.getByText('Actualizar');
    fireEvent.click(updateButton);
    expect(screen.getByText('Actualizar producto')).toBeInTheDocument();
    expect(screen.getByText('Update Product Component')).toBeInTheDocument();
  });

  test('opens delete product dialog on menu click', () => {
    render(<AdminMenu userData={{ id: 1 }} />);
    const deleteButton = screen.getByText('Eliminar');
    fireEvent.click(deleteButton);
    expect(screen.getByText('Eliminar producto')).toBeInTheDocument();
    expect(screen.getByText('Delete Product Component')).toBeInTheDocument();
  });

  test('opens orders dialog on menu click', () => {
    render(<AdminMenu userData={{ id: 1 }} />);
    const ordersButton = screen.getByText('Pedidos');
    fireEvent.click(ordersButton);
    expect(screen.getByText('Pedido Component')).toBeInTheDocument();
  });

});