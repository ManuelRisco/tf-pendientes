import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

function ProfileModal({ show, onHide }) {
    const { user, checkAuth, logout } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (show && user) {
            setFormData({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                email: user.email || '',
                password: ''
            });
            setShowPassword(false);
        }
    }, [show, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.id) return;

        if (formData.password && formData.password.length < 6) {
            Swal.fire('Atención', 'La nueva contraseña debe tener al menos 6 caracteres.', 'warning');
            return;
        }

        const passwordChanged = Boolean(formData.password && formData.password.trim().length >= 6);

        const result = await Swal.fire({
            title: '¿Actualizar perfil?',
            text: passwordChanged 
                ? 'Al cambiar tu contraseña, deberás volver a iniciar sesión con tus nuevas credenciales.' 
                : 'Se guardarán las modificaciones realizadas en tu perfil.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        setSaving(true);
        try {
            const payload = {
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                email: formData.email.trim(),
            };

            if (passwordChanged) {
                payload.password = formData.password.trim();
            }

            await api.put(`/usuarios/${user.id}`, payload);

            if (passwordChanged) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Perfil actualizado',
                    text: 'Tu contraseña ha cambiado con éxito. Por favor vuelve a iniciar sesión.',
                    confirmButtonColor: '#2563eb'
                });
                onHide();
                logout();
                navigate('/login');
            } else {
                await checkAuth();
                Swal.fire({
                    icon: 'success',
                    title: 'Perfil actualizado',
                    text: 'Tus datos se han actualizado correctamente.',
                    timer: 1800,
                    showConfirmButton: false
                });
                onHide();
            }
        } catch (error) {
            console.error('Error al actualizar perfil', error);
            const msg = error.response?.data?.message || 'No se pudo actualizar el perfil.';
            Swal.fire('Error', msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static" size="md">
            <Modal.Header closeButton className="border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <Modal.Title className="font-bold text-base sm:text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-500/20">
                        <i className="bi bi-person-gear text-base"></i>
                    </div>
                    <span>Mi Perfil</span>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-4 sm:p-5" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                {/* Datos del usuario */}
                <div 
                    className="flex items-center gap-3 p-3 mb-4 rounded-xl border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                >
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {(formData.nombre?.charAt(0) || user?.nombre?.charAt(0) || 'U').toUpperCase()}
                        {(formData.apellido?.charAt(0) || user?.apellido?.charAt(0) || '').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                            {formData.nombre} {formData.apellido}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                                {Number(user?.rol_id) === 1 ? 'Administrador' : 'Empleado'}
                            </span>
                            <span className="text-xs truncate opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                ID: #{user?.id}
                            </span>
                        </div>
                    </div>
                </div>

                <Form onSubmit={handleSubmit} autoComplete="off">
                    <Row>
                        <Col xs={12} sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Nombre <span className="text-red-500">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Tu nombre"
                                    required
                                    className="rounded-lg text-sm"
                                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Apellido <span className="text-red-500">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleInputChange}
                                    placeholder="Tu apellido"
                                    required
                                    className="rounded-lg text-sm"
                                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Correo Electrónico <span className="text-red-500">*</span>
                        </Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="correo@tecnofilm.com"
                            required
                            className="rounded-lg text-sm"
                            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                            <Form.Label className="text-xs sm:text-sm font-semibold m-0" style={{ color: 'var(--text-primary)' }}>
                                Cambiar Contraseña
                            </Form.Label>
                            <span className="text-[11px] opacity-75 font-normal" style={{ color: 'var(--text-secondary)' }}>
                                (Opcional - dejar vacío para conservar)
                            </span>
                        </div>
                        <div className="relative flex items-center">
                            <Form.Control
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="•••••••• (mínimo 6 caracteres)"
                                minLength={6}
                                autoComplete="new-password"
                                className="rounded-lg text-sm pr-10"
                                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 text-sm opacity-60 hover:opacity-100 transition-opacity bg-transparent border-0"
                                style={{ color: 'var(--text-primary)' }}
                                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                aria-label="Alternar visibilidad de contraseña"
                            >
                                <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                            </button>
                        </div>
                    </Form.Group>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <button
                            type="button"
                            onClick={onHide}
                            disabled={saving}
                            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm rounded-lg opacity-80 hover:opacity-100 font-medium transition-all"
                            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg"></i>
                                    <span>Guardar Cambios</span>
                                </>
                            )}
                        </button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default ProfileModal;
