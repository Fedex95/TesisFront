import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';
import '../../styles/Login.css';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !pass) {
            alert('Completa todos los campos');
            return;
        }

        // Simulación de login exitoso
        const user = { id: 1, nombre: 'Usuario', rol: 'USER' };
        onLogin(user);
        setEmail('');
        setPass('');
        navigate('/home');
    };

    return (
        <div className="login-container flex justify-center items-center p-4 min-h-screen">
            <div className="login-box flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden w-full md:w-3/4 lg:w-1/2 xl:w-1/3">
                <div className="login-image-side hidden md:block relative w-full md:w-1/2 bg-blue-600">
                    <div className="overlay absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
                        <h2 className="text-4xl font-bold mb-2">Biblioteca Digital</h2>
                        <p className="text-lg">Los mejores libros para leer</p>
                    </div>
                </div>
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