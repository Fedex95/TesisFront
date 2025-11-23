import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { apiFetch } from '../../lib/api';

export default function UpdateLibro({ toast, onClose }) {  
    const [libros, setLibros] = useState([]);  
    const [selectedLibro, setSelectedLibro] = useState(null); 
    const [libroData, setLibroData] = useState({
        titulo: '',  
        autor: '',  
        descripcion: '',
        isbn: '',  
        imagenUrl: '',  
        categoria: '',
        copiasDisponibles: null,  
    });

    const categorias = [  
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
                    setLibros(data);
                } catch (error) {
                    console.error('Error:', error);
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar los libros.',
                        life: 3000,
                    });
                }
            };
            fetchLibros();
        }, [toast]);
    

    const handleLibroSelect = (libroId) => {  
        const selected = libros.find((libro) => libro.id === libroId); 
        if (selected) {
            setSelectedLibro(selected.id);
            setLibroData({ 
                titulo: selected.titulo,  
                autor: selected.autor,  
                descripcion: selected.descripcion,
                isbn: selected.isbn,  
                imagenUrl: selected.imagenUrl,  
                categoria: selected.categoria,
                copiasDisponibles: selected.copiasDisponibles,  
            });
        }
    };

    const handleChange = (e, field) => {
        const value = e.target ? e.target.value : e.value;
        setLibroData({ ...libroData, [field]: value });  
    };

    const handleUpdate = async () => {
        if (!selectedLibro) {
            toast.current.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Por favor, selecciona un libro para actualizar.',
                life: 3000,
            });
            return;
        }

        try {
            await apiFetch(`/api/libros/${selectedLibro}`, { 
                method: 'PUT',
                body: JSON.stringify(libroData),  
            });

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `El libro con ID ${selectedLibro} fue actualizado correctamente.`,
                life: 3000,
            });
            onClose();
        } catch (error) {
            console.error('Error:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar el libro.',
                life: 3000,
            });
        }
    };

    return (
        <div>
            <div className="p-field">
                <label htmlFor="libro" className="p-mb-2">Seleccionar libro</label>  
                <Dropdown
                    id="libro"
                    value={selectedLibro}
                    options={libros.map((libro) => ({ label: libro.titulo, value: libro.id }))}  
                    onChange={(e) => handleLibroSelect(e.value)}  
                    className="p-mb-3"
                    aria-label="Seleccionar libro"
                />
            </div>

            {selectedLibro && (
                <>
                    <div className="p-field">
                        <label htmlFor="titulo">Título</label>  
                        <InputText
                            id="titulo"
                            value={libroData.titulo} 
                            onChange={(e) => handleChange(e, 'titulo')}  
                            aria-label="Título"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="autor">Autor</label>  
                        <InputText
                            id="autor"
                            value={libroData.autor}  
                            onChange={(e) => handleChange(e, 'autor')} 
                            aria-label="Autor"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="descripcion">Descripción</label>
                        <InputText
                            id="descripcion"
                            value={libroData.descripcion}
                            onChange={(e) => handleChange(e, 'descripcion')}
                            aria-label="Descripción"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="isbn">ISBN</label>  
                        <InputText
                            id="isbn"
                            value={libroData.isbn}  
                            onChange={(e) => handleChange(e, 'isbn')}  
                            aria-label="ISBN"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="imagenUrl">Imagen URL</label>  
                        <InputText
                            id="imagenUrl"
                            value={libroData.imagenUrl}  
                            onChange={(e) => handleChange(e, 'imagenUrl')}  
                            aria-label="Imagen URL"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="categoria">Categoría</label>
                        <Dropdown
                            id="categoria"
                            value={libroData.categoria}
                            options={categorias}
                            onChange={(e) => handleChange(e, 'categoria')}
                            aria-label="Categoría"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="copiasDisponibles">Copias Disponibles</label>  
                        <InputNumber
                            id="copiasDisponibles"
                            value={libroData.copiasDisponibles}  
                            onValueChange={(e) => handleChange(e, 'copiasDisponibles')}  
                            min={0}
                            aria-label="Copias Disponibles"
                        />
                    </div>
                    <Button label="Actualizar" icon="pi pi-check" onClick={handleUpdate} className="p-button-success p-mt-3" />
                </>
            )}
            <Button label="Cerrar" icon="pi pi-times" onClick={onClose} className="p-button-secondary p-mt-3" />
        </div>
    );
}
