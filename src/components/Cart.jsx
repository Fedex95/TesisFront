import { useEffect, useState, useRef, useCallback } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css';

function Cart({ userData }) {
    const [cartItems, setCartItems] = useState([]);
    const toast = useRef(null);
    const navigate = useNavigate();

    const fetchCartItems = useCallback(async () => {
        try {
            const response = await fetch(`/api/usuarios/get/all`);

            if (!response.ok) {
                throw new Error('Error al cargar el carrito');
            }

            const users = await response.json();
            const currentUser = users.find(user => user.id === userData.id);

            if (currentUser && currentUser.cart && currentUser.cart.items) {
                setCartItems(currentUser.cart.items);
            } else {
                setCartItems([]);
            }

        } catch (error) {
            console.error('Error:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar los items del carrito',
                life: 3000
            });
        }
    }, [userData.id]);

    useEffect(() => {
        if (userData?.id) {
            fetchCartItems();
        }
    }, [userData, fetchCartItems]);

    const removeItem = async (cartId, itemId) => {
        if (!cartId) {
            console.error('Cart ID is undefined. Cannot remove item.');
            return;
        }

        try {
            const response = await fetch(`/api/cart/eliminar/${cartId}/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el item');
            }

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Producto eliminado del carrito',
                life: 3000
            });

            fetchCartItems();

        } catch (error) {
            console.error('Error:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el producto',
                life: 3000
            });
        }
    };

    const calculateTotal = () => {
        if (!cartItems || cartItems.length === 0) return 0;

        return cartItems.reduce((total, item) => {
            const precio = item.producto?.precio || 0;
            const cantidad = item.cantidad || 0;
            return total + (precio * cantidad);
        }, 0);
    };

    const handlePayment = async () => {
        try {
            if (!userData?.cart?.id) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se encontró el carrito',
                    life: 3000
                });
                return;
            }

            const response = await fetch(`/api/cart/pagar/${userData.cart.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al procesar el pago');
            }

            toast.current.show({
                severity: 'success',
                summary: '¡Éxito!',
                detail: 'Pago procesado correctamente',
                life: 3000
            });

            fetchCartItems();

        } catch (error) {
            console.error('Error:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo procesar el pago',
                life: 3000
            });
        }
    };

    return (
        <div className="cart-container p-4">
            <Toast ref={toast} />
            <h1 className="cart-title text-center text-3xl font-semibold mb-6">Carrito</h1>

            {cartItems.length === 0 ? (
                <Card className="empty-cart p-4">
                    <div className="empty-cart-content text-center">
                        <i className="pi pi-shopping-cart text-5xl mb-4"></i>
                        <h2 className="text-xl">Tu carrito está vacío</h2>
                        <Button
                            label="Catálogo"
                            icon="pi pi-list"
                            onClick={() => navigate('/home')}
                            className="p-button-primary mt-4"
                        />
                    </div>
                </Card>
            ) : (
                <div className="cart-content">
                    <div className="cart-items grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cartItems.map(item => (
                            <Card key={item.id} className="cart-item p-3 flex flex-col justify-between">
                                <div className="cart-item-content flex flex-col items-start">
                                    <img
                                        src={item.producto?.imagenURL}
                                        alt={item.producto?.nombre}
                                        className="cart-item-image w-72 h-72 object-cover rounded-lg mb-4"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <div className="cart-item-details text-left w-full">
                                        <h3 className="text-lg font-medium">{item.producto?.nombre}</h3>
                                        <p className="cart-item-price text-xl text-green-600">
                                            ${item.producto?.precio}
                                        </p>
                                    </div>
                                    <div className="cart-item-actions mt-3 flex justify-between w-full">
                                        <span className="cart-item-quantity">
                                            Cantidad: {item.cantidad}
                                        </span>
                                        <Button
                                            icon="pi pi-trash"
                                            className="p-button-danger p-button-text"
                                            onClick={() => removeItem(userData.cart?.id, item.id)}
                                            tooltip="Eliminar"
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card className="cart-summary mt-6 p-4">
                        <h3 className="text-xl font-semibold">Resumen del Pedido</h3>
                        <div className="cart-summary-content mt-4">
                            <div className="summary-row flex justify-between py-2">
                                <span>Subtotal: <span>${calculateTotal().toFixed(2)}</span></span>
                            </div>
                            <span className='justify-between py-2'> Precio incluye IVA</span>
                            <div className="summary-row flex justify-between py-2">
                                <span>Envío:</span>
                                <span>Gratis</span>
                            </div>
                            <div className="summary-total flex justify-between py-3 border-t mt-4">
                                <span>Total:</span>
                                <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
                            </div>
                            <Button
                                label="Proceder al pago"
                                icon="pi pi-shopping-cart"
                                className="p-button-success p-button-raised mt-4 w-full"
                                onClick={handlePayment}
                                disabled={cartItems.length === 0}
                            />
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default Cart;
