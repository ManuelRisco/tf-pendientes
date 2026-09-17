import PropTypes from 'prop-types';
import { Modal, Form, Row, Col } from 'react-bootstrap';

export default function UsuariosModal({
    showModal,
    editId,
    formData,
    roles,
    user,
    handleInputChange,
    handleSaveUser,
    resetForm
}) {
    return (
        <Modal show={showModal} onHide={resetForm} centered backdrop="static" size="lg">
            <Modal.Header closeButton className="border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <Modal.Title className="font-bold text-base sm:text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    {editId ? (
                        <><i className="bi bi-pencil-square text-blue-600"></i><span>Editar Usuario #{editId}</span></>
                    ) : (
                        <><i className="bi bi-person-plus text-blue-600"></i><span>Nuevo Usuario</span></>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <Form onSubmit={handleSaveUser} autoComplete="off">
                    <Row>
                        <Col xs={12} sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nombre *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Ej. Juan"
                                    required
                                    className="text-xs sm:text-sm"
                                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Apellido *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleInputChange}
                                    placeholder="Ej. Pérez"
                                    required
                                    className="text-xs sm:text-sm"
                                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Email *</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="usuario@tecnofilm.com"
                            required
                            autoComplete="off"
                            className="text-xs sm:text-sm"
                            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Contraseña {editId && <small className="opacity-75 font-normal" style={{ color: 'var(--text-secondary)' }}>(Dejar en blanco para conservar)</small>}
                        </Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder={editId ? "•••••••• (opcional)" : "Mínimo 6 caracteres"}
                            required={!editId}
                            minLength={6}
                            autoComplete="new-password"
                            className="text-xs sm:text-sm"
                            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Rol *</Form.Label>
                        <Form.Select
                            name="rol_id"
                            value={formData.rol_id}
                            onChange={handleInputChange}
                            disabled={Number(user?.rol_id) !== 1}
                            required
                            className="text-xs sm:text-sm"
                            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        >
                            <option value="">Seleccione un rol...</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.nombre}</option>
                            ))}
                        </Form.Select>
                        {Number(user?.rol_id) !== 1 && (
                            <small className="text-xs mt-1 block" style={{ color: 'var(--text-secondary)' }}>
                                Solo los administradores pueden cambiar los roles.
                            </small>
                        )}
                    </Form.Group>
                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm rounded-xl font-semibold transition-all cursor-pointer border hover:bg-slate-500/10 active:scale-95"
                            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                        >
                            {editId ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

UsuariosModal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    editId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    formData: PropTypes.object.isRequired,
    roles: PropTypes.array.isRequired,
    user: PropTypes.object,
    handleInputChange: PropTypes.func.isRequired,
    handleSaveUser: PropTypes.func.isRequired,
    resetForm: PropTypes.func.isRequired
};
