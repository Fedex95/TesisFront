import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { apiFetch } from '../../lib/api';

export default function Pedido({ userData }) {
    const [prestamos, setPrestamos] = useState([]);  
    const [tickets, setTickets] = useState({}); 

    useEffect(() => {
        const fetchPrestamos = async () => {  
            if (!userData?.id) return;
            try {
                const data = await apiFetch('/api/prestamos/all');  
                setPrestamos(data);

                if (data.length > 0) {
                    const ticketPromises = data.map(prestamo => apiFetch(`/api/prestamos/${prestamo.id}/ticket`));
                    const ticketResults = await Promise.all(ticketPromises);
                    const ticketMap = {};
                    data.forEach((prestamo, index) => {
                        ticketMap[prestamo.id] = ticketResults[index];
                    });
                    setTickets(ticketMap);
                }
            } catch (error) {
                console.error('Error fetching loans:', error);
            }
        };

        fetchPrestamos();
    }, [userData]);

    const itemTemplate = (prestamo) => { 
        const totalLibros = prestamo.detallesPrestamo.reduce((acc, item) => acc + item.cantidad, 0);  

        return (
            <Card key={prestamo.id} className="mb-4">
                <div className="p-grid">
                    <div className="p-col-12 p-md-4">
                        <div className="font-bold">ID Préstamo: {prestamo.id}</div>
                        <div>Fecha de solicitud: {new Date(prestamo.fechaSolicitud).toLocaleDateString('es-EC')}</div> 
                        <div>Usuario: {prestamo.usuario.nombre}</div>  
                        <div>Estado: {prestamo.estado}</div>  
                        <div>Ticket: {tickets[prestamo.id]?.codigo ? `${tickets[prestamo.id].codigo} ` : 'Cargando...'}</div> 
                    </div>
                    <div className="p-col-12 p-md-8">
                        <div className="font-bold">Detalles:</div>
                        <ul>
                            {prestamo.detallesPrestamo.map((detalle) => (  
                                <li key={detalle.id}>
                                    <div>{detalle.libro.titulo} - Autor: {detalle.libro.autor} x{detalle.cantidad}</div>  
                                </li>
                            ))}
                        </ul>
                        <div className="font-bold">Total libros: {totalLibros}</div>  
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="p-d-flex p-flex-column p-ai-center">
            <div className="p-d-flex p-flex-column p-ai-center p-mt-4">
                {prestamos.map(itemTemplate)}  
            </div>
        </div>
    );
}
