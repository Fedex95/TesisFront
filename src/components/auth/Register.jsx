import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import '../../styles/Register.css';
import { Password } from 'primereact/password';

function Register() {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        cedula: '',
        usuario: '',
        email: '',
        telefono: '',
        pass: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { nombre, apellido, cedula, usuario, email, telefono, pass } = formData;
        if (!nombre || !apellido || !cedula || !usuario || !email || !telefono || !pass) {
            alert('Completa todos los campos');
            return;
        }

        alert('Usuario registrado exitosamente');
        navigate('/login');
    };

    return (
        <div className="register">
            <div className="image-side">
                <div className="overlay"></div>
            </div>
            <div className="form-side">
                <form onSubmit={handleSubmit}>
                    <h1>Regístrate en la Biblioteca</h1>
                    <div className="form-group grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="nombre">Nombre</label>
                            <InputText
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="register-w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="apellido">Apellido</label>
                            <InputText
                                id="apellido"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                className="register-w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="cedula">Cédula</label>
                            <InputText
                                id="cedula"
                                name="cedula"
                                value={formData.cedula}
                                onChange={handleChange}
                                className="register-w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="usuario">Nombre de usuario</label>
                            <InputText
                                id="usuario"
                                name="usuario"
                                value={formData.usuario}
                                onChange={handleChange}
                                className="register-w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="email">Correo</label>
                            <InputText
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="ejemplo@ejemplo.com"
                                className="register-w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="telefono">Teléfono</label>
                            <InputText
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className="register-w-full"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="pass">Contraseña</label>
                            <Password
                                inputId="pass"
                                name="pass"
                                value={formData.pass}
                                onChange={handleChange}
                                className="w-full-pass"
                            />
                        </div>
                    </div>
                    <Button
                        label="Registrarse"
                        icon="pi pi-user-plus"
                        className="register-button w-full"
                    />
                    <div className="login-prompt text-center mt-4">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="login-link text-blue-600 hover:underline">
                            Inicia sesión
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;