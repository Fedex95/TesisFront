import { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import '../styles/Settings.css';
import { ConfirmDialog } from 'primereact/confirmdialog';

export default function ActualizarDatosUser({ userData }) {
    const toast = useRef(null);
    const [loading, setLoading] = useState({});
    const [updatedUserData, setUpdatedUserData] = useState(userData);
    const [formData, setFormData] = useState({
        id: userData?.id || '',
        nombre: '',
        apellido: '',
        email:'',
        usuario:'',
        cedula:'',
        currentPass: '',
        pass: '',
        confPass: '',
        telefono: '',
        direccion: '',
        nombreTarjeta: '',
        numeroTarjeta: '',
        fechaValidez: '',
        cvv: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateField = async (fieldName) => {
        try {
            setLoading(prev => ({ ...prev, [fieldName]: true }));

            if (fieldName === 'pass') {
                if (!formData.currentPass) {
                    throw new Error('Ingrese su contraseña actual');
                }
                if (formData.pass !== formData.confPass) {
                    throw new Error('Las contraseñas no coinciden');
                }
            }

            const dataToSend = {
                id: updatedUserData.id,
                nombre: updatedUserData.nombre,
                apellido: updatedUserData.apellido,
                pass: updatedUserData.pass,
                telefono: updatedUserData.telefono,
                direccion: updatedUserData.direccion,
                nombreTarjeta: updatedUserData.nombreTarjeta,
                numeroTarjeta: updatedUserData.numeroTarjeta,
                fechaValidez: updatedUserData.fechaValidez,
                email:userData.email,
                usuario:userData.usuario,
                cedula:userData.cedula,
                cvv: updatedUserData.cvv,
                rol: userData.rol,
                [fieldName]: formData[fieldName]
            };

            const response = await fetch(`/api/usuarios/editUsuario/${updatedUserData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el campo');
            }

            setUpdatedUserData(prev => ({
                ...prev,
                [fieldName]: formData[fieldName],
                rol: userData.rol
            }));

            setFormData(prev => ({
                ...prev,
                [fieldName]: ''
            }));

            toast.current.show({
                severity: 'success',
                summary: '¡Éxito!',
                detail: 'Dato actualizado correctamente',
                life: 3000,
                icon: 'pi pi-check-circle'
            });

            if (fieldName === 'pass') {
                setFormData(prev => ({
                    ...prev,
                    pass: '',
                    confPass: '',
                    currentPass: ''
                }));
            }

        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message,
                life: 3000,
                icon: 'pi pi-times-circle'
            });
        }
    };

    return (
        <div className="settings-container">
            <Toast ref={toast} position="bottom-right" />
            <ConfirmDialog />
            <h1 className="settings-title">Configuraciones</h1>

            <Card className="settings-card">
                <div className="settings-form">
                    <div className="form-field">
                        <label htmlFor="usuario">Usuario</label>
                        <div className="field-with-button">
                            <InputText
                                id="usuario"
                                name="usuario"
                                value={formData.usuario}
                                onChange={handleInputChange}
                                placeholder={updatedUserData?.usuario || 'No disponible'}
                                className="w-full"
                            />
                            <Button
                                icon="pi pi-check"
                                onClick={() => handleUpdateField('usuario')}
                                loading={loading.usuario}
                                disabled={!formData.usuario || formData.usuario === updatedUserData?.usuario}
                                tooltip="Actualizar usuario"
                                className="p-button-success"
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="nombre">Nombre</label>
                        <div className="field-with-button">
                            <InputText
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                placeholder={updatedUserData?.nombre || 'No disponible'}
                                className="w-full"
                            />
                            <Button
                                icon="pi pi-check"
                                onClick={() => handleUpdateField('nombre')}
                                loading={loading.nombre}
                                disabled={!formData.nombre || formData.nombre === updatedUserData?.nombre}
                                tooltip="Actualizar nombre"
                                className="p-button-success"
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="apellido">Apellido</label>
                        <div className="field-with-button">
                            <InputText
                                id="apellido"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleInputChange}
                                placeholder={updatedUserData?.apellido || 'No disponible'}
                                className="w-full"
                            />
                            <Button
                                icon="pi pi-check"
                                onClick={() => handleUpdateField('apellido')}
                                loading={loading.apellido}
                                disabled={!formData.apellido || formData.apellido === updatedUserData?.apellidoapellido}
                                tooltip="Actualizar apellido"
                                className="p-button-success"
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="telefono">Teléfono</label>
                        <div className="field-with-button">
                            <InputText
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                placeholder={updatedUserData?.telefono || 'No disponible'}
                                className="w-full"
                            />
                            <Button
                                icon="pi pi-check"
                                onClick={() => handleUpdateField('telefono')}
                                loading={loading.telefono}
                                disabled={!formData.telefono || formData.telefono === updatedUserData?.telefono}
                                tooltip="Actualizar teléfono"
                                className="p-button-success"
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="direccion">Dirección</label>
                        <div className="field-with-button">
                            <InputText
                                id="direccion"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                placeholder={updatedUserData?.direccion || 'No disponible'}
                                className="w-full"
                            />
                            <Button
                                icon="pi pi-check"
                                onClick={() => handleUpdateField('direccion')}
                                loading={loading.direccion}
                                disabled={!formData.direccion || formData.direccion === updatedUserData?.direccion}
                                tooltip="Actualizar dirección"
                                className="p-button-success"
                            />
                        </div>
                    </div>

                    <div className="password-section">
                        <h3>Contraseña</h3>
                        <div className="form-field">
                            <label htmlFor="currentPass">Contraseña actual</label>
                            <Password
                                id="currentPass"
                                name="currentPass"
                                value={formData.currentPass}
                                onChange={handleInputChange}
                                feedback={false}
                                className="w-full"
                                toggleMask
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="pass">Nueva contraseña</label>
                            <Password
                                id="pass"
                                name="pass"
                                value={formData.pass}
                                onChange={handleInputChange}
                                className="w-full"
                                toggleMask
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="confPass">Confirmar nueva contraseña</label>
                            <div className="field-with-button">
                                <Password
                                    id="confPass"
                                    name="confPass"
                                    value={formData.confPass}
                                    onChange={handleInputChange}
                                    feedback={false}
                                    className="w-full"
                                    toggleMask
                                />
                                <Button
                                    icon="pi pi-check"
                                    onClick={() => handleUpdateField('pass')}
                                    loading={loading.pass}
                                    disabled={!formData.pass || !formData.confPass || !formData.currentPass}
                                    tooltip="Actualizar contraseña"
                                    className="p-button-success"
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="nombreTarjeta">Titular de la tarjeta</label>
                            <div className="field-with-button">
                                <InputText
                                    id="nombreTarjeta"
                                    name="nombreTarjeta"
                                    value={formData.nombreTarjeta}
                                    onChange={handleInputChange}
                                    placeholder={updatedUserData?.nombreTarjeta || 'No disponible'}
                                    className="w-full"
                                />
                                <Button
                                    icon="pi pi-check"
                                    onClick={() => handleUpdateField('nombreTarjeta')}
                                    loading={loading.nombreTarjeta}
                                    disabled={!formData.nombreTarjeta || formData.nombreTarjeta === updatedUserData?.nombreTarjeta}
                                    tooltip="Actualizar titular"
                                    className="p-button-success"
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="numeroTarjeta">Dígitos de la tarjeta</label>
                            <div className="field-with-button">
                                <InputText
                                    id="numeroTarjeta"
                                    name="numeroTarjeta"
                                    value={formData.numeroTarjeta}
                                    onChange={handleInputChange}
                                    placeholder={updatedUserData?.numeroTarjeta || 'No disponible'}
                                    className="w-full"
                                />
                                <Button
                                    icon="pi pi-check"
                                    onClick={() => handleUpdateField('numeroTarjeta')}
                                    loading={loading.numeroTarjeta}
                                    disabled={!formData.numeroTarjeta || formData.numeroTarjeta === updatedUserData?.numeroTarjeta}
                                    tooltip="Actualizar dígitos"
                                    className="p-button-success"
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="fechaValidez">Fecha de validez</label>
                            <div className="field-with-button">
                                <InputText
                                    id="fechaValidez"
                                    name="fechaValidez"
                                    value={formData.fechaValidez}
                                    onChange={handleInputChange}
                                    placeholder={updatedUserData?.fechaValidez || 'No disponible'}
                                    className="w-full"
                                />
                                <Button
                                    icon="pi pi-check"
                                    onClick={() => handleUpdateField('fechaValidez')}
                                    loading={loading.fechaValidez}
                                    disabled={!formData.fechaValidez || formData.fechaValidez === updatedUserData?.fechaValidez}
                                    tooltip="Actualizar fecha de validez"
                                    className="p-button-success"
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="cvv">CVV</label>
                            <div className="field-with-button">
                                <InputText
                                    id="cvv"
                                    name="cvv"
                                    value={formData.cvv}
                                    onChange={handleInputChange}
                                    placeholder={updatedUserData?.cvv || 'No disponible'}
                                    className="w-full"
                                />
                                <Button
                                    icon="pi pi-check"
                                    onClick={() => handleUpdateField('cvv')}
                                    loading={loading.cvv}
                                    disabled={!formData.cvv || formData.cvv === updatedUserData?.cvv}
                                    tooltip="Actualizar CVV"
                                    className="p-button-success"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
