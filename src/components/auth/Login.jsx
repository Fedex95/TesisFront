import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api' 
import { decodeJwt } from '../../lib/jwt';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Link } from 'react-router-dom';
import isEmail from 'validator/lib/isEmail';
import '../../styles/Login.css';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState(''); 
    const toast = useRef(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim().toLowerCase();
        setEmail(trimmedEmail);
        if (!trimmedEmail || !pass) {
            toast.current.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Por favor complete todos los campos',
                life: 3000
            });
            return;
        }
        if (!isEmail(trimmedEmail)) {
            toast.current.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Por favor ingrese un correo electrónico válido',
                life: 3000
            });
            return;
        }
        try {
            const data = await apiFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email: trimmedEmail, pass })
            });
            if (!data?.token) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Token de autenticación no recibido',
                    life: 3000
                });
                return;
            }

            // Guardar tokens en sesión
            sessionStorage.setItem('auth_token', data.token);
            sessionStorage.setItem('refresh_token', data.refreshToken);
            const claims = decodeJwt(data.token);
            const user = {
                id: claims?.userId ?? claims?.id,
                nombre: claims?.nombre || claims?.sub,
                rol: claims?.rol,
                token: data.token,
                refreshToken: data.refreshToken
            };

            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('userData', JSON.stringify(user));

            onLogin(user);
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Inicio de sesión exitoso',
                life: 3000
            });
            setEmail('');
            setPass('');
            navigate('/home');
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error.message || 'Error de red';
            if (error.status === 403) {
                toast.current.show({
                    severity: 'warn',
                    summary: 'Cuenta no verificada',
                    detail: 'Redirigiendo a verificación.',
                    life: 3000
                });
                navigate('/verify', { state: { email } });
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage,
                    life: 3000
                });
            }
        }
    };

    
    return (
        <div className="login-container flex justify-center items-center p-4 min-h-screen">
            <Toast ref={toast} />
            <div className="login-box flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden w-full md:w-3/4 lg:w-1/2 xl:w-1/3">
                {/* Imagen y texto del lado izquierdo */}
                <div className="login-image-side hidden md:block relative w-full md:w-1/2 bg-blue-600">
                    <div className="overlay absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
                        <h2 className="text-4xl font-bold mb-2">Biblioteca Digital</h2>
                        <p className="text-lg">Los mejores libros para leer</p>
                    </div>
                </div>

                {/* Formulario de inicio de sesión */}
                <div className="login-form-side w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center items-center">
                    <div className="login-header text-center mb-6">
                        <h1 className="text-3xl font-semibold">Iniciar Sesión</h1>
                    </div>

                    <form className="login-form w-full" onSubmit={handleLogin}>
                        <div className="form-group mb-4">
                            <label htmlFor="email" className="block text-sm font-medium">Correo</label>
                            <InputText
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Ingresa tu correo"
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
                            disabled={!email || !pass}
                            className="w-full p-3 bg-blue-600 text-white rounded-lg mt-4"
                        />

                        <div className="register-prompt text-center mt-4">
                            ¿No tienes una cuenta? {' '}
                            <Link to="/register" className="register-link">
                                Regístrate aquí
                            </Link>
                        </div>
                        <div className="register-prompt text-center mt-4">
                            ¿No has verificado tu cuenta? {' '}
                            <Link to="/verify" className="register-link">
                                Verifica aquí
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;