import { useEffect, useState, useRef } from 'react';
import { Carousel } from 'primereact/carousel';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

function Home({ userData }) {
    const toast = useRef(null);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);

    const categorias = [
        { label: 'Mouse', value: 'Mouse' },
        { label: 'Teclado', value: 'Teclado' },
        { label: 'Case', value: 'Case' },
        { label: 'Procesador', value: 'Procesador' },
        { label: 'Tarjeta Gráfica', value: 'TarjetaGrafica' },
        { label: 'Memoria RAM', value: 'MemoriaRAM' },
        { label: 'Memoria ROM', value: 'MemoriaROM' },
        { label: 'Placa Madre', value: 'PlacaMadre' },
        { label: 'Accesorios', value: 'Accesorios' },
        { label: 'Fuente de Poder', value: 'FuentePoder' },
        { label: 'Ventilador', value: 'Ventilador' },
        { label: 'Monitores', value: 'Monitores' }
    ];

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await fetch(`/api/producto/find/all`);
                const data = await response.json();

                if (data && data.length > 0) {
                    const shuffled = data.sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, 9);

                    const initialQuantities = {};
                    selected.forEach(producto => {
                        initialQuantities[producto.id] = 1;
                    });
                    setQuantities(initialQuantities);
                    setFeaturedProducts(selected);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchProductos();
    }, []);

    const handleQuantityChange = (productoId, value) => {
        setQuantities(prev => ({
            ...prev,
            [productoId]: value
        }));
    };

    const checkIfItemInCart = async (productoId) => {
        try {
            const response = await fetch(`/api/usuarios/get/all`);
            if (!response.ok) {
                throw new Error('Error al verificar el carrito');
            }

            const users = await response.json();
            const currentUser = users.find(user => user.id === userData.id);

            if (currentUser?.cart?.items) {
                return currentUser.cart.items.some(item => item.producto.id === productoId);
            }
            return false;
        } catch (error) {
            console.error('Error al verificar el carrito:', error);
            return false;
        }
    };

    const addToCart = async (productoId) => {
        if (!userData || !userData.id) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Debe iniciar sesión para agregar al carrito',
                life: 3000
            });
            return;
        }

        const isInCart = await checkIfItemInCart(productoId);
        if (isInCart) {
            toast.current.show({
                severity: 'warn',
                summary: 'Aviso',
                detail: 'Este producto ya está en tu carrito',
                life: 3000
            });
            return;
        }

        try {
            const quantity = quantities[productoId] || 1;
            const response = await fetch(`/api/cart/agregar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usuarioId: userData.id,
                    productoId: productoId,
                    cantidad: quantity
                })
            });

            if (!response.ok) {
                throw new Error('Error al agregar al carrito');
            }

            toast.current.show({
                severity: 'success',
                summary: '¡Éxito!',
                detail: 'Producto agregado al carrito',
                life: 3000
            });

        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo agregar al carrito',
                life: 3000
            });
        }
    };

    const openDialog = (producto) => {
        setSelectedProduct(producto);
        setDialogVisible(true);
    };

    const quantityTemplate = (productoId, currentQuantity, onQuantityChange) => (
        <div className="p-d-flex p-ai-center space-x-2">
            <Button
                icon="pi pi-minus"
                className="p-button-rounded p-button-outlined p-mr-2"
                onClick={(e) => {
                    e.stopPropagation();
                    onQuantityChange(productoId, Math.max(1, currentQuantity - 1));
                }}
                disabled={currentQuantity <= 1}
            />
            <InputNumber
                value={currentQuantity}
                onValueChange={(e) => onQuantityChange(productoId, e.value)}
                showButtons={false}
                min={1}
                max={10}
                inputClassName="quantity-input"
                readOnly
            />
            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-outlined p-ml-2"
                onClick={(e) => {
                    e.stopPropagation();
                    onQuantityChange(productoId, Math.min(10, currentQuantity + 1));
                }}
                disabled={currentQuantity >= 10}
            />
        </div>
    );

    const menuTemplate = (producto) => (
        <Card
            className="menu-card p-shadow-2 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"
            style={{
                height: '450px',
                marginBottom: '20px',
            }}
            onClick={() => openDialog(producto)}
        >
            <img
                src={producto.imagenURL}
                alt={producto.nombre}
                className="menu-image"
                onError={(e) => e.target.src = 'https://via.placeholder.com/300'}
                style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    flexShrink: 0
                }}
            />
            <div className="menu-content flex flex-col justify-between p-4">
                <h3 className="menu-title text-lg font-semibold">{producto.nombre}</h3>
                <p className="menu-description text-sm text-gray-600 line-clamp-3">
                    {producto.descripcion}
                </p>
                <div className="menu-details flex justify-between mt-2">
                    <span className="menu-price text-xl font-bold">${producto.precio.toFixed(2)}</span>
                    <span className="menu-category text-sm text-gray-500">
                        {categorias[producto.categoria] || producto.categoria}
                    </span>
                </div>

                <div className="mt-3">
                    {quantityTemplate(producto.id, quantities[producto.id] ?? 1, handleQuantityChange)}
                </div>
            </div>
        </Card>
    );


    const responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 3,
            size: 'small',
            numScroll: 1
        },
        {
            breakpoint: '768px',
            numVisible: 2,
            size: 'small',
            numScroll: 1
        },
        {
            breakpoint: '560px',
            numVisible: 1,
            size: 'small',
            numScroll: 1
        }
    ];

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <div className="mb-4">
                <Carousel
                    className='card-container'
                    value={featuredProducts}
                    itemTemplate={menuTemplate}
                    numVisible={3}
                    numScroll={1}
                    responsiveOptions={responsiveOptions}
                    circular
                    style={{ marginLeft: '10px', marginRight: '10px', display:'grid', gap:'20px' }} // Aquí aplicamos márgenes al contenedor
                />
            </div>

            <Dialog
                header="Especificaciones"
                visible={dialogVisible}
                style={{
                    width: '30vw',
                    padding: '15px',
                    borderRadius: '10px',
                    backgroundColor: '#f5f5f5',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                }}
                onHide={() => setDialogVisible(false)}
                modal
                draggable={false}
                className="p-d-flex p-ai-center"
                baseZIndex={1000}
            >
                <div
                    style={{
                        background: '#fff',
                        borderRadius: '10px',
                        padding: '20px',
                        marginTop: '10px',
                        textAlign: 'center',
                    }}
                >
                    <img
                        src={selectedProduct?.imagenURL}
                        alt={selectedProduct?.nombre}
                        className="menu-image"
                        style={{
                            width: '100%',
                            maxHeight: '200px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            marginBottom: '15px',
                        }}
                    />
                    <h3
                        style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#333',
                            marginBottom: '8px',
                        }}
                    >
                        {selectedProduct?.nombre}
                    </h3>
                    <p
                        style={{
                            fontSize: '14px',
                            color: '#555',
                            marginBottom: '12px',
                        }}
                    >
                        {selectedProduct?.descripcion}
                    </p>
                    <p
                        style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#007BFF',
                            marginBottom: '10px',
                        }}
                    >
                        ${selectedProduct?.precio.toFixed(2)}
                    </p>
                    <p
                        style={{
                            fontSize: '14px',
                            color: '#888',
                            fontStyle: 'italic',
                            marginBottom: '20px',
                        }}
                    >
                        {categorias[selectedProduct?.categoria]}
                    </p>

                    {selectedProduct && (
                        <div>
                            <p
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    marginBottom: '10px',
                                }}
                            >
                                <strong>Cantidad:</strong>
                            </p>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '15px',
                                }}
                            >
                                <Button
                                    icon="pi pi-minus"
                                    className="p-button-rounded p-button-outlined"
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        padding: '0',
                                        fontSize: '16px',
                                    }}
                                    onClick={() => handleQuantityChange(selectedProduct.id, quantities[selectedProduct.id] - 1)}
                                    disabled={quantities[selectedProduct.id] <= 1}
                                />
                                <span
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {quantities[selectedProduct.id]}
                                </span>
                                <Button
                                    icon="pi pi-plus"
                                    className="p-button-rounded p-button-outlined"
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        padding: '0',
                                        fontSize: '16px',
                                    }}
                                    onClick={() => handleQuantityChange(selectedProduct.id, quantities[selectedProduct.id] + 1)}
                                />
                            </div>
                            <Button
                                label="Agregar al carrito"
                                icon="pi pi-cart-plus"
                                className="p-button-success p-mt-3 p-button-rounded"
                                style={{
                                    width: '70%',
                                    padding: '10px 0',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                }}
                                onClick={() => addToCart(selectedProduct.id)}
                            />
                        </div>
                    )}
                </div>
            </Dialog>
        </div>
    );
}

export default Home;
