import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';

export default function Pedido({ userData }) {
    const [pedidos, setPedidos] = useState([]);


    useEffect(() => {
        if (userData && userData.id) {
            fetch(`/api/historial/all?userId=${userData.id}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Error fetching orders');
                    }
                    return response.json();
                })
                .then((data) => {
                    setPedidos(data); 
                })
                .catch((error) => {
                    console.error('Error fetching orders:', error);
                });
        }
    }, [userData]);


    const itemTemplate = (pedido) => {
        const total = pedido.detalles.reduce((acc, item) => acc + item.precio, 0);

        return (
            <Card key={pedido.id} className="mb-4">
                    <div className="p-grid">
                        <div className="p-col-12 p-md-4">
                            <div className="font-bold">ID Pedido: {pedido.id}</div>
                            <div>Fecha de compra: {new Date(pedido.fecha).toLocaleDateString('es-EC')}</div>
                            <div>Cliente: {pedido.usuario.nombre} {pedido.usuario.apellido}</div>
                            
                        <div className="p-col-12 p-md-8">
                            <div className="font-bold">Detalles:</div>
                            <ul>
                                {pedido.detalles.map((detalle) => (
                                    <li key={detalle.id}>
                                        <div>{detalle.nombreProducto} x{detalle.cantidad} - {detalle.precio} USD</div>
                                    </li>
                                ))}
                            </ul>
                            <div className="font-bold">Total: {total} USD</div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="p-d-flex p-flex-column p-ai-center">
                <div className="p-d-flex p-flex-column p-ai-center p-mt-4">
                    {pedidos.map(itemTemplate)}
                </div>
        </div>
    );
}