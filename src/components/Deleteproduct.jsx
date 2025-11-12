import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { apiFetch } from '../lib/api'; 

export default function DeleteProducto({ userId, toast, onClose }) {
    const [productos, setProductos] = useState([]); 

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const data = await apiFetch('/producto/find/all'); 
                setProductos(data);
            } catch (error) {
                console.error('Error:', error);
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los productos.',
                    life: 3000,
                });
            }
        };
        fetchProductos();
    }, [toast]);

    const handleDelete = async (productoId) => {
        try {
            await apiFetch(`/producto/delete/${productoId}`, { 
                method: 'DELETE'
            });
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `El producto con ID ${productoId} fue eliminado correctamente.`,
                life: 3000,
            });
            setProductos(productos.filter((producto) => producto.id !== productoId));
        } catch (error) {
            console.error('Error:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el producto.',
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
            <DataTable value={productos} responsiveLayout="scroll">
                <Column field="id" header="ID" />
                <Column field="nombre" header="Nombre" />
                <Column field="precio" header="Precio" />
                <Column field="categoria" header="Categoría" />
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