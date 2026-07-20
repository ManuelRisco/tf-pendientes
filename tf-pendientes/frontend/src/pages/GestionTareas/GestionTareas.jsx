import { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { Container, Row, Col, Form, Button, Table, Card, Badge, Modal, Dropdown } from 'react-bootstrap';
import Swal from 'sweetalert2';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import './GestionTareas.css';

function GestionTareas() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [estados, setEstados] = useState([]);
    const [prioridades, setPrioridades] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priorityId, setPriorityId] = useState('');
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const descRef = useRef(null);

    const fetchTareas = async () => {
        try {
            // Dos llamadas paralelas: tareas y catálogos
            const [resTareas, resCatalogos] = await Promise.all([
                api.get('/tareas'),
                api.get('/catalogos'),
            ]);
            setItems(resTareas.data.data || []);
            setEstados(resCatalogos.data.data?.estados || []);
            setPrioridades(resCatalogos.data.data?.prioridades || []);
        } catch (error) {
            console.error("Error fetching tareas", error);
            Swal.fire('Error', 'No se pudieron cargar las tareas', 'error');
        }
    };

    useEffect(() => {
        fetchTareas();
    }, []);

    const getFormattedDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Crear o Actualizar
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !priorityId) {
            Swal.fire('Error', 'El título y la prioridad son obligatorios', 'error');
            return;
        }

        const payload = {
            titulo: title,
            descripcion: description,
            estado_id: 1, // Por defecto Pendiente (asumiendo ID 1)
            prioridad_id: priorityId
        };

        if (editId) {
            Swal.fire({
                title: '¿Estás seguro?',
                text: "Se actualizará la tarea",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#198754',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, actualizar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        // Mantenemos el estado actual al editar título/desc/prioridad
                        const tareaActual = items.find(i => i.id === editId);
                        payload.estado_id = tareaActual.estado_id;

                        await api.put(`/tareas/${editId}`, payload);
                        fetchTareas();
                        resetForm();
                        Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1500, showConfirmButton: false });
                    } catch (error) {
                        Swal.fire('Error', 'No se pudo actualizar la tarea', 'error');
                    }
                }
            });
        } else {
            try {
                await api.post('/tareas', payload);
                fetchTareas();
                resetForm();
                Swal.fire({ icon: 'success', title: 'Agregado', timer: 1500, showConfirmButton: false });
            } catch (error) {
                Swal.fire('Error', 'No se pudo crear la tarea', 'error');
            }
        }
    };

    const resetForm = () => {
        setEditId(null);
        setTitle('');
        setDescription('');
        setPriorityId('');
        if (descRef.current) {
            descRef.current.style.height = 'auto';
        }
        setShowModal(false);
    };

    // Cambiar estado desde la tabla
    const handleChangeStatus = async (id, newStatusId, currentStatusId) => {
        if (newStatusId === currentStatusId) return;

        const newStatusName = estados.find(e => e.id === newStatusId)?.nombre || '';

        Swal.fire({
            title: '¿Cambiar estado?',
            text: `El estado de la tarea cambiará a "${newStatusName}"`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cambiar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const tareaActual = items.find(i => i.id === id);
                    await api.put(`/tareas/${id}`, {
                        titulo: tareaActual.titulo,
                        descripcion: tareaActual.descripcion,
                        prioridad_id: tareaActual.prioridad_id,
                        estado_id: newStatusId
                    });
                    fetchTareas();
                    Swal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                } catch (error) {
                    Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
                }
            }
        });
    };

    // Ver detalles de la tarea
    const handleView = (item) => {
        const displayTitle = item.titulo;
        const displayDesc = item.descripcion ? item.descripcion.replace(/\n/g, '<br/>') : '<em>Sin descripción</em>';

        Swal.fire({
            title: `<strong>${displayTitle}</strong>`,
            html: `
                <div style="text-align: left; margin-top: 15px; font-size: 1rem; color: inherit;">
                    <p><strong>Descripción:</strong><br/> ${displayDesc}</p>
                    <p><strong>Estado:</strong> ${item.estado || 'Desconocido'}</p>
                    <p><strong>Prioridad:</strong> ${item.prioridad || 'Desconocida'}</p>
                    <p><strong>Creada:</strong> ${getFormattedDate(item.created_at)}</p>
                    <p><strong>Última actualización:</strong> ${getFormattedDate(item.updated_at)}</p>
                </div>
            `,
            icon: 'info',
            width: '700px',
            confirmButtonColor: '#0d6efd',
            confirmButtonText: 'Cerrar'
        });
    };

    // Editar (cargar valor al input)
    const handleEdit = (item) => {
        setEditId(item.id);
        setTitle(item.titulo || '');
        setDescription(item.descripcion || '');
        setPriorityId(item.prioridad_id || '');
        setShowModal(true);
    };

    // Eliminar
    const handleDelete = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/tareas/${id}`);
                    fetchTareas();
                    Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
                } catch (error) {
                    Swal.fire('Error', 'No se pudo eliminar la tarea', 'error');
                }
            }
        });
    };

    const getPriorityBadgeClass = (prioName) => {
        switch (prioName) {
            case 'Baja': return 'badge-low';
            case 'Media': return 'badge-medium';
            case 'Alta': return 'badge-high';
            case 'Crítica': return 'badge-critical';
            default: return 'badge-default';
        }
    };

    const getStatusDotClass = (statusName) => {
        switch (statusName) {
            case 'Pendiente': return 'pendiente';
            case 'En Progreso': return 'en-curso';
            case 'En revisión': return 'en-revision';
            case 'Completada': return 'finalizado';
            default: return 'pendiente';
        }
    };

    return (
        <div>
            <Navbar />
            <Container fluid className="gestion-tareas-container px-4">
                <Row className="justify-content-center">
                    <Col xs={12}>
                        <Card className="card-custom mb-4">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="page-header-title m-0">Gestión de Tareas</h2>
                                    <Button variant="primary" onClick={() => setShowModal(true)} className="rounded-pill px-3">
                                        <i className="bi bi-plus-lg"></i> Agregar tarea
                                    </Button>
                                </div>

                                <Modal show={showModal} onHide={resetForm} centered size="lg" backdropClassName="modal-backdrop-blur" contentClassName="modal-content-custom">
                                    <Modal.Header closeButton className="modal-header-custom">
                                        <Modal.Title>{editId ? 'Editar Tarea' : 'Nueva Tarea'}</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body className="modal-body-custom">
                                        <Form onSubmit={handleSubmit}>
                                            <Row>
                                                <Col md={12}>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label className="form-label-custom">Título <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={title}
                                                            onChange={(e) => setTitle(e.target.value)}
                                                            placeholder="Ej. Configurar cámara..."
                                                            className="form-control-custom"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label className="form-label-custom">Descripción <span className="text-muted fw-normal fs-6">(Opcional)</span></Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            ref={descRef}
                                                            rows={2}
                                                            value={description}
                                                            className="textarea-auto form-control-custom"
                                                            onChange={(e) => {
                                                                setDescription(e.target.value);
                                                                e.target.style.height = 'auto';
                                                                e.target.style.height = e.target.scrollHeight + 'px';
                                                            }}
                                                            placeholder="Ej. Conexión del ethernet..."
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="form-label-custom">Prioridad <span className="text-danger">*</span></Form.Label>
                                                        <Form.Select
                                                            value={priorityId}
                                                            onChange={(e) => setPriorityId(e.target.value)}
                                                            className="form-select-custom"
                                                            required
                                                        >
                                                            <option value="">Seleccione prioridad...</option>
                                                            {prioridades.map(p => (
                                                                <option key={p.id} value={p.id}>{p.nombre}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <div className="d-flex justify-content-between align-items-center modal-footer-custom">
                                                <small className="text-muted"><span className="text-danger">*</span> Campos obligatorios</small>
                                                <div className="d-flex gap-2">
                                                    <button type="button" className="btn-secondary-custom" onClick={resetForm}>
                                                        Cancelar
                                                    </button>
                                                    <button type="submit" className="btn-primary-custom">
                                                        {editId ? (
                                                            <><i className="bi bi-check2"></i> Actualizar tarea</>
                                                        ) : (
                                                            <><i className="bi bi-cloud-arrow-up"></i> Subir tarea</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </Form>
                                    </Modal.Body>
                                </Modal>
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mt-4 mb-3 border-bottom pb-2 gap-3">
                                    <h5 className="text-dark fw-bold m-0">Lista de tareas</h5>
                                    <div className="d-flex flex-wrap gap-3">
                                        <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill shadow-sm" style={{cursor: 'pointer'}} onClick={(e) => e.currentTarget.querySelector('select').focus()}>
                                            <i className="bi bi-funnel-fill text-primary"></i>
                                            <Form.Select 
                                                className="form-select-custom form-select-transparent px-0" 
                                                value={filtroEstado} 
                                                onChange={e => setFiltroEstado(e.target.value)}
                                                style={{cursor: 'pointer', outline: 'none', backgroundImage: 'none', width: 'auto', minWidth: '140px'}}
                                            >
                                                <option value="">Todos los estados</option>
                                                {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                            </Form.Select>
                                            <i className="bi bi-chevron-down text-muted ms-1 small"></i>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill shadow-sm" style={{cursor: 'pointer'}} onClick={(e) => e.currentTarget.querySelector('select').focus()}>
                                            <i className="bi bi-flag-fill text-danger"></i>
                                            <Form.Select 
                                                className="form-select-custom form-select-transparent px-0" 
                                                value={filtroPrioridad} 
                                                onChange={e => setFiltroPrioridad(e.target.value)}
                                                style={{cursor: 'pointer', outline: 'none', backgroundImage: 'none', width: 'auto', minWidth: '150px'}}
                                            >
                                                <option value="">Todas las prioridades</option>
                                                {prioridades.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                            </Form.Select>
                                            <i className="bi bi-chevron-down text-muted ms-1 small"></i>
                                        </div>
                                    </div>
                                </div>
                                {(() => {
                                    const filteredItems = items.filter(item => {
                                        const matchEstado = filtroEstado ? item.estado_id === parseInt(filtroEstado) : true;
                                        const matchPrioridad = filtroPrioridad ? item.prioridad_id === parseInt(filtroPrioridad) : true;
                                        return matchEstado && matchPrioridad;
                                    });

                                    if (filteredItems.length === 0) {
                                        return <p className="text-muted text-center my-4">No hay tareas que coincidan con los filtros.</p>;
                                    }

                                    return (
                                    <Table hover className="table-custom align-middle">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '28%' }}>Tarea</th>
                                                <th style={{ width: '15%' }}>Estado</th>
                                                <th style={{ width: '10%' }}>Prioridad</th>
                                                <th style={{ width: '32%' }}>Fechas</th>
                                                <th style={{ width: '15%' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredItems.map(item => {
                                                const itemTitle = item.titulo;
                                                // El backend devuelve 'estado' y 'prioridad' como strings directos
                                                const estadoNombre = item.estado || 'Desconocido';
                                                const prioridadNombre = item.prioridad || 'Desconocida';
                                                return (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <div className="fw-bold text-dark">{itemTitle}</div>
                                                            <div className="text-muted small text-truncate desc-truncate" title={item.descripcion}>
                                                                {item.descripcion || 'Sin descripción'}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Dropdown>
                                                                <Dropdown.Toggle variant="light" className={`status-dropdown-toggle ${getStatusDotClass(estadoNombre)}`}>
                                                                    <span className={`status-dot ${getStatusDotClass(estadoNombre)}`}></span>
                                                                    {estadoNombre}
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu className="status-dropdown-menu">
                                                                    {estados.map(estado => (
                                                                        <Dropdown.Item
                                                                            key={estado.id}
                                                                            className="status-dropdown-item"
                                                                            onClick={() => handleChangeStatus(item.id, estado.id, item.estado_id)}
                                                                        >
                                                                            <span className={`status-dot ${getStatusDotClass(estado.nombre)}`}></span>
                                                                            {estado.nombre}
                                                                        </Dropdown.Item>
                                                                    ))}
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </td>
                                                        <td>
                                                            <Badge className={`badge-custom ${getPriorityBadgeClass(prioridadNombre)}`}>
                                                                {prioridadNombre}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <ul className="timeline">
                                                                <li className="timeline-item">
                                                                    <span className="timeline-dot"></span>
                                                                    Creada: {getFormattedDate(item.created_at)}
                                                                </li>
                                                                <li className="timeline-item">
                                                                    <span className="timeline-dot"></span>
                                                                    Actualizada: {getFormattedDate(item.updated_at)}
                                                                </li>
                                                            </ul>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-1 flex-wrap">
                                                                <button className="action-icon icon-view" title="Ver detalles" onClick={() => handleView(item)}>
                                                                    <i className="bi bi-eye"></i>
                                                                </button>
                                                                <button className="action-icon icon-edit" title="Editar" onClick={() => handleEdit(item)}>
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                {Number(user?.rol_id) === 1 && (
                                                                    <button className="action-icon icon-delete" title="Eliminar" onClick={() => handleDelete(item.id)}>
                                                                        <i className="bi bi-trash"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                    );
                                })()}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default GestionTareas;