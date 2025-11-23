import { useEffect, useState, useRef, useCallback } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import '../../styles/Cart.css';

function Cart({ userData }) {
    const [cartItems, setCartItems] = useState([]);
    const toast = useRef(null);
    const navigate = useNavigate();

    const fetchCartItems = useCallback(async () => {
        try {
            const cartData = await apiFetch('/api/cart/get');  

            if (cartData && cartData.items) {
                setCartItems(cartData.items);
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
    }, []);  

    useEffect(() => {
        if (userData?.id) {
            fetchCartItems();
        }
    }, [userData, fetchCartItems]);

    const removeItem = async (itemId) => {
        try {
            await apiFetch(`/api/cart/eliminar/${itemId}`, {
                method: 'DELETE'
            });

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Libro eliminado del carrito',
                life: 3000
            });

            fetchCartItems();

        } catch (error) {
            console.error('Error:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el libro',
                life: 3000
            });
        }
    };

    const handleLoanRequest = async () => {
        const cartData = { items: cartItems }; 
        try {
            await apiFetch('/api/prestamos', {
                method: 'POST',
                body: JSON.stringify(cartData),
            });
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Préstamo solicitado exitosamente',
                life: 3000,
            });
            setCartItems([]); 
        } catch (error) {
            const message = error.message || 'Error desconocido';
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: message,  
                life: 5000,
            });
        }
    };

    return (
        <div className="cart-container p-4">
            <Toast ref={toast} />
            <h1 className="cart-title text-center text-3xl font-semibold mb-6">Carrito de Préstamos</h1>  

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
                                        src={item.libro?.imagenUrl}  
                                        alt={item.libro?.titulo}  
                                        className="cart-item-image w-72 h-72 object-cover rounded-lg mb-4"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <div className="cart-item-details text-left w-full">
                                        <h3 className="text-lg font-medium">{item.libro?.titulo}</h3>  
                                        <p className="cart-item-author">Autor: {item.libro?.autor}</p> 
                                    </div>
                                    <div className="cart-item-actions mt-3 flex justify-between w-full">
                                        <span className="cart-item-quantity">
                                            Cantidad: {item.cantidad}
                                        </span>
                                        <Button
                                            icon="pi pi-trash"
                                            className="p-button-danger p-button-text"
                                            onClick={() => removeItem(item.id)} 
                                            tooltip="Eliminar"
                                            aria-label="Eliminar"
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card className="cart-summary mt-6 p-4">
                        <h3 className="text-xl font-semibold">Resumen del Préstamo</h3>
                        <div className="cart-summary-content mt-4">
                            <div className="summary-row flex justify-between py-2">
                                <span>Libros solicitados: {cartItems.length}</span>
                            </div>
                            <Button
                                label="Solicitar Préstamo"  
                                icon="pi pi-book"  
                                className="p-button-success p-button-raised mt-4 w-full"
                                onClick={handleLoanRequest}  
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