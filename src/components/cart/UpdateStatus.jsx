import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { apiFetch } from '../../lib/api';  

export default function UpdateStatus({ userData, toast }) {
    const [prestamos, setPrestamos] = useState([]);
    const [statuses, setStatuses] = useState({});

    const statusOptions = [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Listo', value: 'listo' },
        { label: 'Retirado', value: 'retirado' },
        { label: 'Devuelto', value: 'devuelto' }
    ];

    useEffect(() => {
        const fetchPrestamos = async () => {
            if (!userData?.id) return;
            try {
                const data = await apiFetch('/api/prestamos/all');
                setPrestamos(data);
                const initialStatuses = {};
                data.forEach(prestamo => {
                    initialStatuses[prestamo.id] = prestamo.estado;
                });
                setStatuses(initialStatuses);
            } catch (error) {
                console.error('Error fetching loans:', error);
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los préstamos',
                    life: 3000
                });
            }
        };

        fetchPrestamos();
    }, [userData, toast]);

    const handleStatusChange = (prestamoId, newStatus) => {
        setStatuses(prev => ({
            ...prev,
            [prestamoId]: newStatus
        }));
    };

    const handleUpdateStatus = async (prestamoId) => {
        const newStatus = statuses[prestamoId];
        try {
            await apiFetch(`/api/prestamos/${prestamoId}/estado`, {
                method: 'PUT',
                body: JSON.stringify({ estado: newStatus })
            });
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Estado del préstamo actualizado',
                life: 3000
            });
            setPrestamos(prev => prev.map(p => p.id === prestamoId ? { ...p, estado: newStatus } : p));
        } catch (error) {
            console.error('Error updating status:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar el estado',
                life: 3000
            });
        }
    };

    const itemTemplate = (prestamo) => {
        const totalLibros = prestamo.detallesPrestamo.reduce((acc, item) => acc + item.cantidad, 0);

        return (
            <Card key={prestamo.id} className="mb-4">
                <div className="p-grid">
                    <div className="p-col-12 p-md-4">
                        <div className="font-bold">ID Préstamo: {prestamo.id}</div>
                        <div>Fecha de solicitud: {new Date(prestamo.fechaSolicitud).toLocaleDateString('es-EC')}</div>
                        <div>Usuario: {prestamo.usuario.nombre}</div>
                        <div>Estado actual: {prestamo.estado}</div>
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
                        <div className="p-field p-mt-3">
                            <label htmlFor={`status-${prestamo.id}`}>Nuevo Estado</label>
                            <Dropdown
                                id={`status-${prestamo.id}`}
                                value={statuses[prestamo.id]}
                                options={statusOptions}
                                onChange={(e) => handleStatusChange(prestamo.id, e.value)}
                                placeholder="Seleccionar estado"
                            />
                        </div>
                        <Button
                            label="Actualizar Estado"
                            icon="pi pi-check"
                            onClick={() => handleUpdateStatus(prestamo.id)}
                            className="p-button-primary p-mt-2"
                        />
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