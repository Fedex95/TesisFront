import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export default function Pedidos({ userId }) {
    const [pedidos, setPedidos] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                const response = await fetch(`/api/historial/${userId}`);
                if (!response.ok) {
                    throw new Error('Error al obtener el historial de pedidos');
                }
                const data = await response.json();
                setPedidos(data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchHistorial();
    }, [userId]);

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