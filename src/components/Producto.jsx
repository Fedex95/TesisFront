import { useEffect, useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

export default function Menu({ userData }) {
    const [productos, setProductos] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const toast = useRef(null);

    const categories = [
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
    ]

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await fetch(`/api/producto/find/all`);
                const data = await response.json();

                if (data && data.length > 0) {
                    const initialQuantities = {};
                    data.forEach(producto => {
                        initialQuantities[producto.id] = 1;
                    });
                    setQuantities(initialQuantities);
                    setProductos(data);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchProductos();
    }, []);

    const openDialog = (producto) => {
        setSelectedProducto(producto);
        setDialogVisible(true);
    };

    const productsByCategory = productos.reduce((acc, producto) => {
        const category = producto.categoria;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(producto);
        return acc;
    }, {});

    const handleQuantityChange = (productoId, newQuantity) => {
        setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [productoId]: Math.max(1, newQuantity),
        }));
    };

    const addToCart = async (productoId) => {
        const quantity = quantities[productoId];
        const productItem = productos.find((producto) => producto.id === productoId);

        if (!productItem || !quantity) return;

        try {
            const response = await fetch(`/api/cart/agregar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usuarioId: userData.id,
                    productoId: productItem.id,
                    cantidad: quantity,
                }),
            });

            if (response.ok) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `${productItem.nombre} agregado al carrito`,
                    life: 3000,
                });
                setDialogVisible(false);
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo agregar al carrito',
                    life: 3000,
                });
            }
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Ocurrió un problema al agregar al carrito',
                life: 3000,
            });
        }
    };

    return (
        <div className="menu-container">
            <Toast ref={toast} />

            {Object.entries(productsByCategory).map(([category, items], index) => (
                <div key={category} className="category-section">
                    <h2 className="category-title">
                        {categories[category] || category}
                    </h2>

                    {index > 0 && <hr className="category-divider" />}

                    <div className="menu-grid" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '20px',
                        marginTop: '20px'
                    }}>
                        {items.map(producto => (
                            <Card
                                key={producto.id}
                                className="menu-card"
                                style={{
                                    height: '450px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    maxWidth: '300px',
                                    margin: '10px',
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
                                <div
                                    className="menu-content"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        padding: '15px',
                                        flexGrow: 1
                                    }}
                                >
                                    <h3
                                        className="menu-title"
                                        style={{
                                            margin: '10px 0',
                                            fontSize: '16px'
                                        }}
                                    >
                                        {producto.nombre}
                                    </h3>
                                    <p
                                        className="menu-description"
                                        style={{
                                            fontSize: '14px',
                                            color: '#555',
                                            flexGrow: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 3,
                                        }}
                                    >
                                        {producto.descripcion}
                                    </p>
                                    <div
                                        className="menu-details"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '10px'
                                        }}
                                    >
                                        <span
                                            className="menu-price"
                                            style={{
                                                fontSize: '18px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ${producto.precio.toFixed(2)}
                                        </span>
                                        <span
                                            className="menu-category"
                                            style={{
                                                fontSize: '14px',
                                                color: '#888'
                                            }}
                                        >
                                            {categories[producto.categoria] || producto.categoria}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            <Dialog
                header="Detalles del plato"
                visible={dialogVisible}
                style={{
                    width: '30vw',
                    padding: '15px',
                    borderRadius: '10px',
                    backgroundColor: '#f5f5f5',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
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
                        boxShadow: '0px 4px 15px rgba(0,0,0,0.1)',
                        textAlign: 'center',
                    }}
                >
                    <img
                        src={selectedProducto?.imagenURL}
                        alt={selectedProducto?.nombre}
                        className="menu-image"
                        style={{
                            width: '100%',
                            maxHeight: '200px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
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
                        {selectedProducto?.nombre}
                    </h3>
                    <p
                        style={{
                            fontSize: '14px',
                            color: '#555',
                            marginBottom: '12px',
                        }}
                    >
                        {selectedProducto?.descripcion}
                    </p>
                    <p
                        style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#007BFF',
                            marginBottom: '10px',
                        }}
                    >
                        ${selectedProducto?.precio.toFixed(2)}
                    </p>
                    <p
                        style={{
                            fontSize: '14px',
                            color: '#888',
                            fontStyle: 'italic',
                            marginBottom: '20px',
                        }}
                    >
                        {categories[selectedProducto?.categoria]}
                    </p>

                    {selectedProducto && (
                        <div>
                            <Button
                                icon="pi pi-minus"
                                onClick={() =>
                                    handleQuantityChange(
                                        selectedProducto.id,
                                        quantities[selectedProducto.id] - 1
                                    )
                                }
                                style={{ marginRight: '10px' }}
                            />
                            <span>{quantities[selectedProducto.id]}</span>
                            <Button
                                icon="pi pi-plus"
                                onClick={() =>
                                    handleQuantityChange(
                                        selectedProducto.id,
                                        quantities[selectedProducto.id] + 1
                                    )
                                }
                                style={{ marginLeft: '10px' }}
                            />
                            <div style={{ marginTop: '20px' }}>
                                <Button
                                    label="Agregar al carrito"
                                    icon="pi pi-shopping-cart"
                                    onClick={() => addToCart(selectedProducto.id)}
                                    style={{ width: '100%' }}
                                    className="p-button-success"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>
        </div>
    );
}