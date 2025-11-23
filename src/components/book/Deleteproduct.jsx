import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { apiFetch } from '../../lib/api'; 

export default function Deleteproduct({ toast, onClose }) { 
    const [libros, setLibros] = useState([]);  

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

    const handleDelete = async (libroId) => {  
        try {
            await apiFetch(`/api/libros/${libroId}`, {  
                method: 'DELETE'
            });
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `El libro con ID ${libroId} fue eliminado correctamente.`,
                life: 3000,
            });
            setLibros(libros.filter((libro) => libro.id !== libroId));  
        } catch (error) {
            console.error('Error:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el libro.',
                life: 3000,
            });
        }
    };

    const deleteButtonTemplate = (rowData) => {
        return (
            <Button
                label="Eliminar"
                icon="pi pi-trash"
                className="p-button-danger"
                onClick={() => handleDelete(rowData.id)}
            />
        );
    };

    return (
        <div>
            <DataTable value={libros} responsive="scroll">  
                <Column field="id" header="ID" />
                <Column field="titulo" header="Título" />  
                <Column field="autor" header="Autor" />  
                <Column field="categoria" header="Categoría" />
                <Column field="isbn" header="ISBN" />  
                <Column body={deleteButtonTemplate} header="Acciones" />
            </DataTable>
            <Button
                label="Cerrar"
                icon="pi pi-times"
                className="p-button-secondary"
                onClick={onClose}
            />
        </div>
    );
}
