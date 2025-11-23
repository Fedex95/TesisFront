import { useEffect, useState, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { apiFetch } from '../../lib/api';

export default function Pedidos({ userData }) {  
    const [pedidos, setPedidos] = useState([]);
    const [tickets, setTickets] = useState({});  
    const [error, setError] = useState(null); 

    const fetchHistorial = useCallback(async () => {
        try {
            const data = await apiFetch('/api/prestamos/historial'); 

            const list =
                Array.isArray(data) ? data :
                Array.isArray(data?.data) ? data.data :
                Array.isArray(data?.content) ? data.content :
                Array.isArray(data?.items) ? data.items :
                [];

            setPedidos(list);

            if (list.length > 0) {
                const ticketPromises = list.map(pedido => apiFetch(`/api/prestamos/${pedido.id}/ticket`));
                const ticketResults = await Promise.all(ticketPromises);
                const ticketMap = {};
                list.forEach((pedido, index) => {
                    ticketMap[pedido.id] = ticketResults[index]; 
                });
                setTickets(ticketMap);
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar pedidos: ' + error.message);  
        }
    }, []);

    useEffect(() => {
        if (userData?.id) {
            fetchHistorial();
        }
    }, [userData, fetchHistorial]);

    if (error) return <div>Error: {error}</div>;

    const calcularTotal = (detalles) => { 
        if (!detalles || !Array.isArray(detalles)) return 0;

        return detalles.reduce((total, detalle) => {
            return total + (detalle.cantidad || 1);
        }, 0);
    };

    const transformarPedidos = (pedidos) => {  
        return (pedidos || []).map((pedido) => {
            const total = calcularTotal(pedido.detallesPrestamo || []);  
            return {
                fechaSolicitud: new Date(pedido.fechaSolicitud).toLocaleDateString('es-EC'), 
                usuario: `${pedido.usuario.nombre} (${pedido.usuario.usuario})`,
                estado: pedido.estado,  
                total: total,  
                detalles: pedido.detallesPrestamo || [],  
                ticket: tickets[pedido.id] || 'Cargando...',  
            };
        });
    };

    const transformedPedidos = transformarPedidos(pedidos);

    return (
        <div className="card">
            <div style={{ display: 'none' }}>Debug: {JSON.stringify(transformedPedidos)}</div>
            <DataTable value={transformedPedidos} tableStyle={{ minWidth: '50rem' }}> 
                <Column field="fechaSolicitud" header="Fecha de solicitud" />  
                <Column field="estado" header="Estado" />  
                <Column 
                    field="total" 
                    header="Total" 
                    body={(rowData) => <span>{rowData.total}</span>} 
                />
                <Column
                    header="Título del libro"  
                    body={(rowData) => rowData.detalles.map((detalle, index) => (
                        <div key={index}>{detalle.libro.titulo}</div> 
                    ))}
                />
                <Column
                    header="Autor"  
                    body={(rowData) => rowData.detalles.map((detalle, index) => (
                        <div key={index}>{detalle.libro.autor}</div>  
                    ))}
                />
                <Column
                    header="Cantidad"
                    body={(rowData) => rowData.detalles.map((detalle, index) => (
                        <div key={index}>{detalle.cantidad}</div>
                    ))}
                />
                <Column
                    field="ticket"
                    header="Ticket"
                    body={(rowData) => {
                        if (rowData.ticket && typeof rowData.ticket === 'object' && rowData.ticket.codigo) {
                            return <span>{rowData.ticket.codigo}</span>;
                        }
                        return <span>{rowData.ticket}</span>;
                    }}
                />
            </DataTable>
        </div>
    );
}
