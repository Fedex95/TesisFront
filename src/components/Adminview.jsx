import React, { useState, useRef } from 'react';
import { Menubar } from 'primereact/menubar';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import Addproduct from './Addproduct';
import Pedido from './Pedido';
import Deleteproduct from './Deleteproduct';
import Updateproduct from './Updateproduct';

export default function AdminMenu({ userData }) {
    const [displayAddDialog, setDisplayAddDialog] = useState(false);
    const [displayUpdateDialog, setDisplayUpdateDialog] = useState(false);
    const [displayDeleteDialog, setDisplayDeleteDialog] = useState(false);
    const [displayOrdersDialog, setDisplayOrdersDialog] = useState(false);
    const toast = useRef(null);

    const openDialog = (dialogType) => {
        switch (dialogType) {
            case 'add':
                setDisplayAddDialog(true);
                break;
            case 'update':
                setDisplayUpdateDialog(true);
                break;
            case 'delete':
                setDisplayDeleteDialog(true);
                break;
            case 'orders':
                setDisplayOrdersDialog(true);
                break;
            default:
                break;
        }
    };

    const closeDialog = () => {
        setDisplayAddDialog(false);
        setDisplayUpdateDialog(false);
        setDisplayDeleteDialog(false);
        setDisplayOrdersDialog(false);
    };

    const items = [
        {
            label: 'Agregar',
            icon: 'pi pi-plus',
            command: () => openDialog('add'),
        },
        {
            label: 'Actualizar',
            icon: 'pi pi-pencil',
            command: () => openDialog('update'),
        },
        {
            label: 'Eliminar',
            icon: 'pi pi-trash',
            command: () => openDialog('delete'),
        },
        {
            label: 'Pedidos',
            icon: 'pi pi-list',
            command: () => openDialog('orders'),
        },
    ];

    return (
        <div className="admin-container p-4">
            <Toast ref={toast} />
            {/* Menubar: Usando clases responsivas */}
            <Menubar model={items} className="mb-4" />

            {/* Diálogo de Agregar Producto */}
            <Dialog
                header="Agregar producto"
                visible={displayAddDialog}
                onHide={closeDialog}
                draggable={false}
                style={{
                    width: '100%',
                    maxWidth: '90vw',  // El ancho máximo en pantallas pequeñas
                }}
                className="p-fluid"
            >
                <Addproduct userId={userData.id} toast={toast} onClose={closeDialog} />
            </Dialog>

            {/* Diálogo de Actualizar Producto */}
            <Dialog
                header="Actualizar producto"
                visible={displayUpdateDialog}
                onHide={closeDialog}
                draggable={false}
                style={{
                    width: '100%',
                    maxWidth: '90vw',  // El ancho máximo en pantallas pequeñas
                }}
                className="p-fluid"
            >
                <Updateproduct userId={userData.id} toast={toast} onClose={closeDialog} />
            </Dialog>

            {/* Diálogo de Eliminar Producto */}
            <Dialog
                header="Eliminar producto"
                visible={displayDeleteDialog}
                onHide={closeDialog}
                draggable={false}
                style={{
                    width: '100%',
                    maxWidth: '90vw',  // El ancho máximo en pantallas pequeñas
                }}
                className="p-fluid"
            >
                <Deleteproduct userId={userData.id} toast={toast} onClose={closeDialog} />
            </Dialog>

            {/* Diálogo de Pedidos */}
            <Dialog
                header="Pedidos"
                visible={displayOrdersDialog}
                onHide={closeDialog}
                draggable={false}
                style={{
                    width: '100%',
                    maxWidth: '90vw',  // El ancho máximo en pantallas pequeñas
                }}
                className="p-fluid"
            >
                <Pedido userData={userData} />
            </Dialog>
        </div>
    );
}
