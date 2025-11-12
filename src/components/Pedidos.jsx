import React, { useEffect, useState, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { apiFetch } from '../lib/api';

export default function Pedidos({ userId }) {
    const [pedidos, setPedidos] = useState([]);
    const [error] = useState(null);

    const fetchHistorial = useCallback(async () => {
        try {
            const data = await apiFetch('/api/historial/user');
            setPedidos(data);
        } catch (error) {
            console.error('Error:', error);
        }
    }, []);

    useEffect(() => {
        fetchHistorial();
    }, [userId, fetchHistorial]);

    if (error) return <div>Error: {error}</div>;

    const calcularTotal = (detalles) => {
        if (!detalles || !Array.isArray(detalles)) return 0;

        return detalles.reduce((total, detalle) => {
            return total + (detalle.precio || 0) * (detalle.cantidad || 1);
        }, 0);
    };

    const transformarPedidos = (pedidos) => {
        return (pedidos || []).map((pedido) => {
            const total = calcularTotal(pedido.detalles || []);
            return {
                fechaCompra: new Date(pedido.fecha).toLocaleDateString('es-EC'),
                usuario: `${pedido.usuario.nombre} (${pedido.usuario.usuario})`,
                total: total.toFixed(2),
                detalles: pedido.detalles || [],
            };
        });
    };

    const transformedPedidos = transformarPedidos(pedidos);

    return (
        <div className="card">
            <DataTable value={transformedPedidos} tableStyle={{ minWidth: '50rem' }}>
                <Column field="fechaCompra" header="Fecha de compra" />
                <Column 
                    field="total" 
                    header="Total" 
                    body={(rowData) => <span>${rowData.total}</span>} 
                />
                <Column
                    header="Nombre del producto"
                    body={(rowData) => rowData.detalles.map((detalle, index) => (
                        <div key={index}>{detalle.nombreProducto}</div>
                    ))}
                />
                <Column
                    header="Cantidad"
                    body={(rowData) => rowData.detalles.map((detalle, index) => (
                        <div key={index}>{detalle.cantidad}</div>
                    ))}
                />
                <Column
                    header="Precio"
                    body={(rowData) => rowData.detalles.map((detalle, index) => (
                        <div key={index}>{detalle.precio.toFixed(2)}</div>
                    ))}
                />
            </DataTable>
        </div>
    );
}