import { useEffect, useState, useRef } from 'react';
import { Carousel } from 'primereact/carousel';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { apiFetch } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import BookDialog from '../shared/BookDialog'; 

function Home({ userData }) {
    const toast = useRef(null);
    const navigate = useNavigate();
    const [featuredLibros, setFeaturedLibros] = useState([]);  
    const [quantities, setQuantities] = useState({});
    const [selectedLibro, setSelectedLibro] = useState(null); 
    const [dialogVisible, setDialogVisible] = useState(false);

    const categorias = [  
        { label: 'Ficción', value: 'Ficción' },
        { label: 'No Ficción', value: 'NoFicción' },
        { label: 'Ciencia', value: 'Ciencia' },
        { label: 'Historia', value: 'Historia' },
        { label: 'Biografía', value: 'Biografía' },
        
    ];

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const randomArray = new Uint32Array(1);
            window.crypto.getRandomValues(randomArray);
            const j = randomArray[0] % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    useEffect(() => {
        const fetchLibros = async () => { 
            try {
                const data = await apiFetch('/api/libros'); 

                if (data && data.length > 0) {
                    const shuffled = shuffleArray(data);
                    const selected = shuffled.slice(0, 9);

                    const initialQuantities = {};
                    selected.forEach(libro => {  
                        initialQuantities[libro.id] = 1;
                    });
                    setQuantities(initialQuantities);
                    setFeaturedLibros(selected);  
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        const token = sessionStorage.getItem('auth_token');
        if (!token) {
            console.log('No hay token, redirigiendo a login');
            navigate('/login');
            return;
        }
        fetchLibros(); 
    }, [navigate]);

    const handleQuantityChange = (libroId, value) => {  
        setQuantities(prev => ({
            ...prev,
            [libroId]: value
        }));
    };

    const addToCart = async (libroId) => {  
        if (!userData || !userData.id) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Debe iniciar sesión para agregar al carrito',
                life: 3000
            });
            return;
        }
        

        try {
            const quantity = quantities[libroId] || 1;
            await apiFetch('/api/cart/agregar', { 
              method: 'POST',
              body: JSON.stringify({
                libroId: libroId,  
                cantidad: quantity
              })
            });

            toast.current.show({
                severity: 'success',
                summary: '¡Éxito!',
                detail: 'Libro agregado al carrito',
                life: 3000
            });

        } catch (error) {
            console.error('Error:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo agregar al carrito',
                life: 3000,
            });
        }
    };

    const openDialog = (libro) => { 
        setSelectedLibro(libro); 
        setDialogVisible(true);
    };

    const quantityTemplate = (libroId, currentQuantity, onQuantityChange) => ( 
        <div className="p-d-flex p-ai-center space-x-2">
            <Button
                icon="pi pi-minus"
                className="p-button-rounded p-button-outlined p-mr-2"
                onClick={(e) => {
                    e.stopPropagation();
                    onQuantityChange(libroId, Math.max(1, currentQuantity - 1)); 
                }}
                disabled={currentQuantity <= 1}
            />
            <InputNumber
                value={currentQuantity}
                onValueChange={(e) => onQuantityChange(libroId, e.value)} 
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
                    onQuantityChange(libroId, Math.min(10, currentQuantity + 1));  
                }}
                disabled={currentQuantity >= 10}
            />
        </div>
    );

    const menuTemplate = (libro) => ( 
        <Card
            className="menu-card p-shadow-2 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"
            style={{
                height: '450px',
                marginBottom: '20px',
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
            <div className="menu-content flex flex-col justify-between p-4">
                <h3 className="menu-title text-lg font-semibold">{libro.titulo}</h3>
                <p className="menu-description text-sm text-gray-600 line-clamp-3">
                    {libro.descripcion}
                </p>
                <div className="menu-details flex justify-between mt-2">
                    <span className="menu-author text-sm text-gray-500">Autor: {libro.autor}</span> 
                    <span className="menu-category text-sm text-gray-500">
                        {categorias.find(c => c.value === libro.categoria)?.label || libro.categoria}
                    </span>
                </div>

                <div className="mt-3">
                    {quantityTemplate(libro.id, quantities[libro.id] ?? 1, handleQuantityChange)}  
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
                    value={featuredLibros}  
                    itemTemplate={menuTemplate}
                    numVisible={3}
                    numScroll={1}
                    responsiveOptions={responsiveOptions}
                    circular
                    style={{ marginLeft: '10px', marginRight: '10px', display:'grid', gap:'20px' }} 
                />
            </div>

            <BookDialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                selectedLibro={selectedLibro}
                quantities={quantities}
                handleQuantityChange={handleQuantityChange}
                addToCart={addToCart}
                categorias={categorias}
            />
        </div>
    );
}

export default Home;