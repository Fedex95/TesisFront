import { Card } from 'primereact/card';
import '../styles/Profile.css';

export default function Profile({ userData }) {
    return (
        <div className="profile-container p-4 sm:p-6 md:p-8 min-h-screen flex justify-center items-center">
            <div className="w-full max-w-4xl">
                <h1 className="profile-title text-center text-3xl font-semibold mb-6">Datos personales</h1>
                <Card className="profile-card p-6 shadow-lg rounded-lg">
                    <div className="profile-info grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Nombres</h3>
                            <p>{userData?.nombre || 'No disponible'}</p>
                        </div>
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Apellidos</h3>
                            <p>{userData?.apellido || 'No disponible'}</p>
                        </div>
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Cédula</h3>
                            <p>{userData?.cedula || 'No disponible'}</p>
                        </div>
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Email</h3>
                            <p>{userData?.email || 'No disponible'}</p>
                        </div>
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Nombre de usuario</h3>
                            <p>{userData?.usuario || 'No disponible'}</p>
                        </div>
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Teléfono</h3>
                            <p>{userData?.telefono || 'No disponible'}</p>
                        </div>
                        <div className="profile-item">
                            <h3 className="text-lg font-medium">Dirección</h3>
                            <p>{userData?.direccion || 'No disponible'}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
