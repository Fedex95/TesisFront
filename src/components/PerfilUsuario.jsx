import { Card } from 'primereact/card';
import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import '../styles/Profile.css';

export default function Profile({ userData }) {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userData?.id) {
                setError('Usuario no autenticado');
                setLoading(false);
                return;
            }
            try {
                const data = await apiFetch(`/usuario/getUsuario/${userData.id}`);
                setProfileData(data);
            } catch (err) {
                console.error('Error al obtener perfil:', err);
                setError('Error al cargar el perfil');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userData?.id]);

    if (loading) return <div className="text-center">Cargando...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="profile-container p-4 sm:p-6 md:p-8 min-h-screen flex justify-center items-center">
            <div className="w-full max-w-4xl">
                <h1 className="profile-title text-center text-3xl font-semibold mb-6">Datos personales</h1>
                <Card className="profile-card p-6 shadow-lg rounded-lg">
                    <div className="profile-info grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Nombres</h3>
                            <p>{profileData?.nombre || 'No disponible'}</p>
                        </div>
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Apellidos</h3>
                            <p>{profileData?.apellido || 'No disponible'}</p>
                        </div>
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Cédula</h3>
                            <p>{profileData?.cedula || 'No disponible'}</p>
                        </div>
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Email</h3>
                            <p>{profileData?.email || 'No disponible'}</p>
                        </div>
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Nombre de usuario</h3>
                            <p>{profileData?.usuario || 'No disponible'}</p>
                        </div>
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Teléfono</h3>
                            <p>{profileData?.telefono || 'No disponible'}</p>
                        </div>
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Dirección</h3>
                            <p>{profileData?.direccion || 'No disponible'}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
