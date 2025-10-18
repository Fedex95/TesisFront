import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Link } from 'react-router-dom';
import '../styles/Login.css';

function Login({ onLogin }) {
    const [usuario, setUsuario] = useState('');
    const [pass, setPass] = useState('');
    const toast = useRef(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!usuario || !pass) {
            toast.current.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Por favor complete todos los campos',
                life: 3000
            });
            return;
        }

        try {
            const verifyResponse = await fetch(
                `/api/usuarios/viewPass?usuario=${usuario}&pass=${pass}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (verifyResponse.status === 200) {
                const usersResponse = await fetch(`/api/usuarios/get/all`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (usersResponse.ok) {
                    const users = await usersResponse.json();
                    const currentUser = users.find(user => user.usuario === usuario);

                    if (currentUser) {
                        onLogin(currentUser);
                        toast.current.show({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Inicio de sesión exitoso',
                            life: 3000
                        });
                        setUsuario('');
                        setPass('');
                        navigate('/home');
                    }
                }
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Usuario o contraseña incorrectos',
                    life: 3000
                });
            }
        } catch (error) {
            console.error('Error:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al iniciar sesión',
                life: 3000
            });
        }
    };

    return (
        <div className="login-container flex justify-center items-center p-4 min-h-screen">
            <Toast ref={toast} />
            <div className="login-box flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden w-full md:w-3/4 lg:w-1/2 xl:w-1/3">
                {/* Imagen y texto del lado izquierdo */}
                <div className="login-image-side hidden md:block relative w-full md:w-1/2 bg-blue-600">
                    <div className="overlay absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
                        <h2 className="text-4xl font-bold mb-2">Electro Master</h2>
                        <p className="text-lg">Los mejores productos electrónicos</p>
                    </div>
                </div>

                {/* Formulario de inicio de sesión */}
                <div className="login-form-side w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center items-center">
                    <div className="login-header text-center mb-6">
                        <h1 className="text-3xl font-semibold">Iniciar Sesión</h1>
                    </div>

                    <form className="login-form w-full" onSubmit={handleLogin}>
                        <div className="form-group mb-4">
                            <label htmlFor="usuario" className="block text-sm font-medium">Usuario</label>
                            <InputText
                                id="usuario"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                placeholder="Ingresa tu usuario"
                                className="w-full p-3 border rounded-lg mt-2"
                            />
                        </div>

                        <div className="form-group mb-4">
                            <label htmlFor="pass" className="block text-sm font-medium">Contraseña</label>
                            <Password
                                id="pass"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                feedback={false}
                                placeholder="Ingresa tu contraseña"
                                className="w-full p-3 border rounded-lg mt-2"
                            />
                        </div>

                        <Button
                            label="Iniciar Sesión"
                            icon="pi pi-sign-in"
                            disabled={!usuario || !pass}
                            className="w-full p-3 bg-blue-600 text-white rounded-lg mt-4"
                        />

                        <div className="register-prompt text-center mt-4">
                            ¿No tienes una cuenta? {' '}
                            <Link to="/register" className="register-link">
                                Regístrate aquí
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
