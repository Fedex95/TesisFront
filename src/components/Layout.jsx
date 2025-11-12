import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import Navbar from './Navbar'; 
import { apiFetch } from '../lib/api';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function Layout({ children, onLogout, cartItemsCount, userData }) {
    const userMenu = useRef(null);
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(false);
    console.log('UserData in Layout:', userData);

    useEffect(() => {
        if (userData?.admin != null) {
          setAdmin(!!userData.admin);
          return;
        }
        (async () => {
          if (!userData?.id) return;
          try {
            const isAdmin = await apiFetch(`/usuarios/${userData.id}/admin`);
            setAdmin(!!isAdmin);
          } catch (error) {
            console.error('Error verificando si el usuario es admin:', error);
            setAdmin(false);
          }
        })();
    }, [userData]);

    const userMenuItems = [
        {
            label: 'Perfil',
            icon: 'pi pi-user',
            command: () => navigate('/perfil'),
        },
        
        ...(admin ? [
            {
                label: 'Agregar/Editar productos',
                icon: 'pi pi-cog',
                command: () => navigate('/admin'),
            },
        ] : []),
        {
            separator: true,
        },
        {
            label: 'Cerrar Sesión',
            icon: 'pi pi-sign-out',
            command: () => onLogout(),
        },
    ];

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="layout-container" style={{ backgroundColor: "#f8f8f8" }}>
            <Navbar 
                onLogout={onLogout} 
                cartItemsCount={cartItemsCount} 
                userData={userData}
                handleNavigation={handleNavigation} 
                userMenuItems={userMenuItems} 
                userMenu={userMenu}
            />

            <div className="p-mb-4">
                <main className="main-content">{children}</main>
            </div>
        </div>
    );
}