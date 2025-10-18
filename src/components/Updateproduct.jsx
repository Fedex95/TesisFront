import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

export default function UpdateProducto({ userId, toast, onClose }) {
    const [productos, setProductos] = useState([]); 
    const [selectedProducto, setSelectedProducto] = useState(null); 
    const [productData, setProductData] = useState({
        nombre: '',
        descripcion: '',
        precio: null,
        imagenURL: '',
        categoria: '',
    });

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
    ]

    useEffect(() => {
        fetch(`/api/producto/find/all`)
            .then((response) => response.json())
            .then((data) => setProductos(data))
            .catch(() => {
                if (toast && toast.current) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar los productos.',
                        life: 3000,
                    });
                }
            });
    }, [toast]);

    const handleProductSelect = (productoId) => {
        const selected = productos.find((producto) => producto.id === productoId);
        if (selected) {
            setSelectedProducto(selected.id);
            setProductData({
                nombre: selected.nombre,
                descripcion: selected.descripcion,
                precio: selected.precio,
                imagenURL: selected.imagenURL,
                categoria: selected.categoria,
            });
        }
    };

    const handleChange = (e, field) => {
        const value = e.target ? e.target.value : e.value;
        setProductData({ ...productData, [field]: value });
    };

    const handleUpdate = () => {
        if (!selectedProducto) {
            toast.current.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Por favor, selecciona un producto para actualizar.',
                life: 3000,
            });
            return;
        }

        fetch(`/api/producto/edit/${selectedProducto}?userId=${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        })
            .then((response) => {
                if (response.ok) {
                    toast.current.show({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `El producto con ID ${selectedProducto} fue actualizado correctamente.`,
                        life: 3000,
                    });
                    onClose(); 
                } else {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: `No se pudo actualizar el producto con ID ${selectedProducto}.`,
                        life: 3000,
                    });
                }
            })
            .catch(() => {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Ocurrió un problema al intentar actualizar el producto.',
                    life: 3000,
                });
            });
    };

    return (
        <div>
            <div className="p-field">
                <label htmlFor="producto" className="p-mb-2">Seleccionar producto</label>
                <Dropdown
                    id="producto"
                    value={selectedProducto}
                    options={productos.map((producto) => ({ label: producto.nombre, value: producto.id }))}
                    onChange={(e) => handleProductSelect(e.value)}
                    className="p-mb-3"
                />
            </div>

            {selectedProducto && (
                <>
                    <div className="p-field">
                        <label htmlFor="nombre">Nombre</label>
                        <InputText
                            id="nombre"
                            value={productData.nombre}
                            onChange={(e) => handleChange(e, 'nombre')}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="descripcion">Descripción</label>
                        <InputText
                            id="descripcion"
                            value={productData.descripcion}
                            onChange={(e) => handleChange(e, 'descripcion')}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="precio">Precio</label>
                        <InputNumber
                            id="precio"
                            value={productData.precio}
                            onValueChange={(e) => handleChange(e, 'precio')}
                            mode="currency"
                            currency="USD"
                            locale="es-US"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="imagenURL">Imagen URL</label>
                        <InputText
                            id="imagenURL"
                            value={productData.imagenURL}
                            onChange={(e) => handleChange(e, 'imagenURL')}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="categoria">Categoría</label>
                        <Dropdown
                            id="categoria"
                            value={productData.categoria}
                            options={categorias}
                            onChange={(e) => handleChange(e, 'categoria')}
                        />
                    </div>
                    <Button label="Actualizar" icon="pi pi-check" onClick={handleUpdate} className="p-button-success p-mt-3" />
                </>
            )}
            <Button label="Cerrar" icon="pi pi-times" onClick={onClose} className="p-button-secondary p-mt-3" />
        </div>
    );
}