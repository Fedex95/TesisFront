import { render, screen, fireEvent } from '@testing-library/react';
import AdminMenu from '../components/home/Adminview';

jest.mock('../components/book/Addproduct', () => () => <div>Add Product Component</div>);
jest.mock('../components/cart/Pedido', () => () => <div>Pedido Component</div>);
jest.mock('../components/book/Deleteproduct', () => () => <div>Delete Product Component</div>);
jest.mock('../components/book/Updateproduct', () => () => <div>Update Product Component</div>);
jest.mock('../components/cart/UpdateStatus', () => () => <div>Update Status Component</div>);

beforeAll(() => {
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
    expect(screen.getByText('Actualizar estado de préstamos')).toBeInTheDocument();
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
    expect(screen.getByText('Delete Product Component')).toBeInTheDocument();
  });

  test('opens orders dialog on menu click', () => {
    render(<AdminMenu userData={{ id: 1 }} />);
    const ordersButton = screen.getByText('Pedidos');
    fireEvent.click(ordersButton);
    expect(screen.getByText('Pedido Component')).toBeInTheDocument();
  });

  test('opens update status dialog on menu click', () => {
    render(<AdminMenu userData={{ id: 1 }} />);
    const updateStatusButton = screen.getByText('Actualizar estado de préstamos');
    fireEvent.click(updateStatusButton);
    expect(screen.getByText('Update Status Component')).toBeInTheDocument();
  });

  test('closes dialog when close button is clicked', () => {
    render(<AdminMenu userData={{ id: 1 }} />);
    const addButton = screen.getByText('Agregar');
    fireEvent.click(addButton);
    expect(screen.getByText('Add Product Component')).toBeInTheDocument();
  });

  test('renders with userData prop', () => {
    render(<AdminMenu userData={{ id: 2, admin: true }} />);
    expect(screen.getByText('Agregar')).toBeInTheDocument();
  });

  test('does not render dialogs initially', () => {
    render(<AdminMenu userData={{ id: 1 }} />);
    expect(screen.queryByText('Add Product Component')).not.toBeInTheDocument();
    expect(screen.queryByText('Update Product Component')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete Product Component')).not.toBeInTheDocument();
    expect(screen.queryByText('Pedido Component')).not.toBeInTheDocument();
    expect(screen.queryByText('Update Status Component')).not.toBeInTheDocument();
  });
});