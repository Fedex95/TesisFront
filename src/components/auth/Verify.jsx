import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { apiFetch } from '../../lib/api';
import isEmail from 'validator/lib/isEmail';
import '../../styles/Verify.css';  

export default function Verify() {
    const [email, setEmail] = useState('');  
    const [code, setCode] = useState('');
    const [resendDisabled, setResendDisabled] = useState(false);
    const toast = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const stateEmail = location.state?.email;
        if (stateEmail) {
            setEmail(stateEmail); 
        }
    }, [location]);

    const handleVerify = async () => {
        const trimmedEmail = email.trim().toLowerCase();
        setEmail(trimmedEmail);
        if (!trimmedEmail || !code || code.length !== 6) {
            toast.current.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Completa email y código de 6 caracteres',
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
            await apiFetch('/api/auth/verify', {
                method: 'POST',
                body: JSON.stringify({ email: trimmedEmail, code }),
            });
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Cuenta verificada exitosamente. Ahora puedes iniciar sesión.',
                life: 3000
            });
            navigate('/login');
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Código inválido. Intenta de nuevo.',
                life: 3000
            });
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.current.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Ingresa tu email primero',
                life: 3000
            });
            return;
        }
        setResendDisabled(true);
        try {
            await apiFetch('/api/auth/resend', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
            toast.current.show({
                severity: 'success',
                summary: 'Código reenviado',
                detail: 'Revisa tu correo.',
                life: 3000
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo reenviar el código.',
                life: 3000
            });
        }
        setTimeout(() => setResendDisabled(false), 30000);
    };

    return (
        <div className="verify">
            <Toast ref={toast} />
            <div className="verification-form">
                <h1>Verifica tu cuenta</h1>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <InputText
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ingresa tu email"
                        className="verify-w-full"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="code">Código</label>
                    <InputText
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Código de 6 caracteres"
                        maxLength={6}
                        className="verify-w-full"
                    />
                </div>
                <Button
                    label="Verificar"
                    icon="pi pi-check"
                    onClick={handleVerify}
                    className="verify-button"
                />
                <Button
                    label="Reenviar código"
                    icon="pi pi-refresh"
                    onClick={handleResend}
                    disabled={resendDisabled}
                    className="verify-button"
                />
                <div className="login-prompt">
                    <button onClick={() => navigate('/login')} className="login-link">
                        Volver al login
                    </button>
                </div>
            </div>
        </div>
    );
}