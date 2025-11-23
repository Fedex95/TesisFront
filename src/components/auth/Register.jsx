import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import '../../styles/Register.css';
import { Password } from 'primereact/password';
import isEmail from 'validator/lib/isEmail';

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
  const toast = useRef(null);
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
      toast.current.show({
        severity: 'warn',
        detail: 'Completa todos los campos obligatorios',
        life: 3000,
      });
      return;
    }

    // Validations
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(nombre)) {
      toast.current.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El nombre solo puede contener letras',
        life: 3000,
      });
      return;
    }
    if (!nameRegex.test(apellido)) {
      toast.current.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El apellido solo puede contener letras',
        life: 3000,
      });
      return;
    }

    const numberRegex = /^[0-9]+$/;
    if (!numberRegex.test(cedula)) {
      toast.current.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La cédula solo puede contener números',
        life: 3000,
      });
      return;
    }
    if (!numberRegex.test(telefono)) {
      toast.current.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El teléfono solo puede contener números',
        life: 3000,
      });
      return;
    }

    if (!isEmail(email)) {
      toast.current.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor ingrese un correo electrónico válido',
        life: 3000,
      });
      return;
    }

    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z0-9]).{8,}$/;
    if (!passRegex.test(pass)) {
      toast.current.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial',
        life: 3000,
      });
      return;
    }

    const userData = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      cedula: cedula.trim(),
      usuario: usuario.trim(),
      email: email.trim().toLowerCase(),
      telefono: telefono.trim(),
      pass: pass,
    };

    try {
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario registrado exitosamente',
          life: 3000,
        });
        navigate('/login');
      } else {
        const errorText = await response.text();
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: errorText || 'Error al registrar el usuario',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo conectar con el servidor',
        life: 3000,
      });
    }
  };

  return (
    <div className="register">
      <Toast ref={toast} />
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