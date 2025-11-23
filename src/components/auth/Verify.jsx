import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import '../../styles/Verify.css';

export default function Verify() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [resendDisabled, setResendDisabled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const stateEmail = location.state?.email;
        if (stateEmail) {
            setEmail(stateEmail);
        }
    }, [location]);

    const handleVerify = async () => {
        if (!email || !code) {
            alert('Completa email y código');
            return;
        }

        alert('Cuenta verificada exitosamente');
        navigate('/login');
    };

    const handleResend = async () => {
        if (!email) {
            alert('Ingresa tu email primero');
            return;
        }
        setResendDisabled(true);
        alert('Código reenviado');
        setTimeout(() => setResendDisabled(false), 30000);
    };

    return (
        <div className="verify">
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