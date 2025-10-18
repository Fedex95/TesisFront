import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export default function DeleteProducto({ userId, toast, onClose }) {
    const [productos, setProductos] = useState([]); 

    useEffect(() => {
        fetch(`/api/producto/find/all`)
            .then((response) => response.json())
            .then((data) => setProductos(data))
            .catch((error) => {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los menús.',
                    life: 3000,
                });
            });
    }, [toast]);

    const handleDelete = (productoId) => {
        fetch(`/api/producto/delete/${productoId}?userId=${userId}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (response.ok) {
                    toast.current.show({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `El producto con ID ${productoId} fue eliminado correctamente.`,
                        life: 3000,
                    });

                    setProductos(productos.filter((producto) => producto.id !== productoId));
                } else {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: `No se pudo eliminar el menú con ID ${productoId}.`,
                        life: 3000,
                    });
                }
            })
            .catch((error) => {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Ocurrió un problema al intentar eliminar el producto.',
                    life: 3000,
                });
            });
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