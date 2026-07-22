import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import CustomPagination from '../../components/Pagination/CustomPagination';
import './Usuarios.css';

function Usuarios() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    // Estados para el CRUD
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        rol_id: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resUsers, resCatalogos] = await Promise.all([
                api.get(`/usuarios?page=${currentPage}&limit=${limit}`),
                api.get('/catalogos')
            ]);
            
            // La respuesta ahora tiene { items, meta }
            setUsuarios(resUsers.data.data.items || []);
            setTotalPages(resUsers.data.data.meta?.totalPages || 1);

            if (resCatalogos.data?.data?.roles) {
                setRoles(resCatalogos.data.data.roles);
            }
        } catch (error) {
            console.error("Error fetching data", error);
            Swal.fire('Error', 'No tienes permisos o ocurrió un problema', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const getFormattedDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const resetForm = () => {
        setEditId(null);
        setFormData({ nombre: '', apellido: '', email: '', password: '', rol_id: '' });
        setShowModal(false);
    };

    const handleCreateClick = () => {
        resetForm();
        setShowModal(true);
    };

    const handleEditClick = (u) => {
        setEditId(u.id);
        setFormData({
            nombre: u.nombre || '',
            apellido: u.apellido || '',
            email: u.email || '',
            password: '', // Se deja vacío a menos que quiera cambiarla
            rol_id: u.rol_id || ''
        });
        setShowModal(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        
        const actionTitle = editId ? '¿Guardar cambios?' : '¿Crear usuario?';
        const actionText = editId ? 'Se actualizarán los datos del usuario.' : 'Se añadirá un nuevo usuario al sistema.';

        Swal.fire({
            title: actionTitle,
            text: actionText,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Clonamos formData para no mandar password vacío si es edición
                    const payload = { ...formData };
                    if (editId && !payload.password) {
                        delete payload.password;
                    }

                    if (editId) {
                        await api.put(`/usuarios/${editId}`, payload);
                        Swal.fire({ icon: 'success', title: 'Usuario actualizado', timer: 1500, showConfirmButton: false });
                        
                        // REGLA: Si el usuario se editó a sí mismo, cerrar sesión.
                        if (user && user.id === editId) {
                            await Swal.fire({
                                title: 'Sesión expirada',
                                text: 'Tus datos han cambiado, por favor vuelve a iniciar sesión.',
                                icon: 'info',
                                confirmButtonText: 'Entendido'
                            });
                            logout();
                            navigate('/login');
                            return; // Terminamos aquí
                        }
                    } else {
                        await api.post('/usuarios', payload);
                        Swal.fire({ icon: 'success', title: 'Usuario creado', timer: 1500, showConfirmButton: false });
                    }
                    
                    resetForm();
                    fetchData();
                } catch (error) {
                    Swal.fire('Error', error.response?.data?.message || 'Error al guardar usuario', 'error');
                }
            }
        });
    };

    const handleDeleteClick = (id) => {
        if (user && Number(user.id) === Number(id)) {
            Swal.fire('Error', 'No puedes desactivarte a ti mismo.', 'error');
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: "El usuario será desactivado del sistema",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, desactivar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/usuarios/${id}`);
                    fetchData();
                    Swal.fire({ icon: 'success', title: 'Desactivado', timer: 1500, showConfirmButton: false });
                } catch (error) {
                    Swal.fire('Error', error.response?.data?.message || 'Error al desactivar usuario', 'error');
                }
            }
        });
    };

    const handleRestoreClick = (id) => {
        Swal.fire({
            title: '¿Reactivar usuario?',
            text: "El usuario recuperará su acceso al sistema",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, reactivar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.patch(`/usuarios/${id}/restaurar`);
                    fetchData();
                    Swal.fire({ icon: 'success', title: 'Reactivado', timer: 1500, showConfirmButton: false });
                } catch (error) {
                    Swal.fire('Error', error.response?.data?.message || 'Error al reactivar usuario', 'error');
                }
            }
        });
    };

    return (
        <div>
            <Container fluid className="px-4 py-4">
                <Row className="justify-content-center">
                    <Col xs={12}>
                        <Card className="card-custom mb-4 shadow-sm border-0">
                            <Card.Body className="p-4">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                                    <h5 className="text-dark fw-bold m-0">Directorio de Usuarios</h5>
                                    {Number(user?.rol_id) === 1 && (
                                        <Button variant="primary" onClick={handleCreateClick} className="rounded-pill px-3 shadow-sm border-0 d-flex align-items-center">
                                            <i className="bi bi-person-plus-fill me-2 text-white"></i> 
                                            <span className="text-white fw-medium">Agregar usuario</span>
                                        </Button>
                                    )}
                                </div>
                                
                                {loading ? (
                                    <p className="text-center my-4 text-muted">Cargando usuarios...</p>
                                ) : usuarios.length === 0 ? (
                                    <p className="text-muted text-center my-4">No hay usuarios registrados.</p>
                                ) : (
                                    <Table hover responsive className="align-middle table-custom">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Nombre Completo</th>
                                                <th>Correo Electrónico</th>
                                                <th>Estado</th>
                                                <th>Rol</th>
                                                <th>Fecha de Registro</th>
                                                {user?.rol_id === 1 && <th>Acciones</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuarios.map(u => (
                                                <tr key={u.id} className={u.deleted_at ? 'opacity-75 bg-light' : ''}>
                                                    <td>
                                                        <div className={`fw-bold ${u.deleted_at ? 'text-secondary' : 'text-dark'}`}>
                                                            {u.nombre} {u.apellido}
                                                            {user && Number(user.id) === Number(u.id) && (
                                                                <Badge bg="secondary" className="ms-2 fw-normal" style={{fontSize: '0.75rem'}}>Tú</Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="text-muted">{u.email}</td>
                                                    <td>
                                                        <Badge bg={u.deleted_at ? 'secondary' : 'success'} className="px-3 py-2 rounded-pill fw-medium">
                                                            {u.deleted_at ? 'Inactivo' : 'Activo'}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <Badge bg={u.rol_id === 1 ? 'primary' : 'info'} className="px-3 py-2 rounded-pill fw-medium">
                                                            {u.rol === 'Administrador' ? (
                                                                <><i className="bi bi-shield-lock-fill me-1"></i> {u.rol}</>
                                                            ) : (
                                                                <><i className="bi bi-person-fill me-1"></i> {u.rol}</>
                                                            )}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-muted">
                                                        {getFormattedDate(u.created_at)}
                                                    </td>
                                                    {user?.rol_id === 1 && (
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <button className="btn btn-sm btn-outline-primary rounded-circle" title="Editar" onClick={() => handleEditClick(u)}>
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                {Number(user?.id) !== Number(u.id) && (
                                                                    u.deleted_at ? (
                                                                        <button className="btn btn-sm btn-outline-success rounded-circle" title="Reactivar" onClick={() => handleRestoreClick(u.id)}>
                                                                            <i className="bi bi-person-check"></i>
                                                                        </button>
                                                                    ) : (
                                                                        <button className="btn btn-sm btn-outline-danger rounded-circle" title="Desactivar" onClick={() => handleDeleteClick(u.id)}>
                                                                            <i className="bi bi-person-x"></i>
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                                
                                {totalPages > 1 && (
                                    <CustomPagination 
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal de Creación / Edición */}
            <Modal show={showModal} onHide={resetForm} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editId ? 'Editar Usuario' : 'Nuevo Usuario'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSaveUser} autoComplete="off">
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Apellido</Form.Label>
                                    <Form.Control type="text" name="apellido" value={formData.apellido} onChange={handleInputChange} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required autoComplete="off" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Contraseña {editId && <small className="text-muted">(Dejar en blanco para no cambiar)</small>}</Form.Label>
                            <Form.Control type="password" name="password" value={formData.password} onChange={handleInputChange} required={!editId} minLength={6} autoComplete="new-password" />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label>Rol</Form.Label>
                            <Form.Select name="rol_id" value={formData.rol_id} onChange={handleInputChange} required>
                                <option value="">Seleccione un rol...</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.nombre}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={resetForm}>Cancelar</Button>
                            <Button variant="primary" type="submit">{editId ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Usuarios;