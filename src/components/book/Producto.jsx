import { useEffect, useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { apiFetch } from '../../lib/api';
import BookDialog from '../shared/BookDialog'; 

export default function Producto({ userData }) {  
    const [libros, setLibros] = useState([]);  
    const [quantities, setQuantities] = useState({});
    const [selectedLibro, setSelectedLibro] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const toast = useRef(null);

    const categories = [  
        { label: 'Ficción', value: 'Ficción' },
        { label: 'No Ficción', value: 'NoFicción' },
        { label: 'Ciencia', value: 'Ciencia' },
        { label: 'Historia', value: 'Historia' },
        { label: 'Biografía', value: 'Biografía' },
    ];

    useEffect(() => {
        const fetchLibros = async () => {  
            try {
                const data = await apiFetch('/api/libros');  

                if (data && data.length > 0) {
                    const initialQuantities = {};
                    data.forEach(libro => {  
                        initialQuantities[libro.id] = 1;
                    });
                    setQuantities(initialQuantities);
                    setLibros(data); 
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchLibros();
    }, []);

    const openDialog = (libro) => {  
        setSelectedLibro(libro);  
        setDialogVisible(true);
    };

    const librosByCategory = libros.reduce((acc, libro) => {  
        const category = libro.categoria;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(libro);  
        return acc;
    }, {});

    const handleQuantityChange = (libroId, newQuantity) => {  
        setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [libroId]: Math.max(1, newQuantity),
        }));
    };

    const addToCart = async (libroId) => { 
        const quantity = quantities[libroId];
        const libroItem = libros.find((libro) => libro.id === libroId);

        if (!libroItem || !quantity) return;

        try {
            const response = await apiFetch('/api/cart/agregar', {  
                method: 'POST',
                body: JSON.stringify({
                    libroId: libroItem.id,  
                    cantidad: quantity,
                }),
            });

            if (response.ok) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `${libroItem.titulo} agregado al carrito`,  
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

            {Object.entries(librosByCategory).map(([category, items], index) => (  
                <div key={category} className="category-section">
                    <h2 className="category-title">
                        {categories.find(c => c.value === category)?.label || category}
                    </h2>

                    {index > 0 && <hr className="category-divider" />}

                    <div className="menu-grid" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '20px',
                        marginTop: '20px'
                    }}>
                        {items.map(libro => (  
                            <Card
                                key={libro.id}
                                className="menu-card"
                                style={{
                                    height: '450px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    maxWidth: '300px',
                                    margin: '10px',
                                }}
                                onClick={() => openDialog(libro)}  
                            >
                                <img
                                    src={libro.imagenUrl}  
                                    alt={libro.titulo} 
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
                                        {libro.titulo}  
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
                                        {libro.descripcion}
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
                                            className="menu-author"
                                            style={{
                                                fontSize: '14px',
                                                color: '#888'
                                            }}
                                        >
                                            Autor: {libro.autor} 
                                        </span>
                                        <span
                                            className="menu-category"
                                            style={{
                                                fontSize: '14px',
                                                color: '#888'
                                            }}
                                        >
                                            {categories.find(c => c.value === libro.categoria)?.label || libro.categoria}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            <BookDialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                selectedLibro={selectedLibro}
                quantities={quantities}
                handleQuantityChange={handleQuantityChange}
                addToCart={addToCart}
                categorias={categories}
            />
        </div>
    );
}
