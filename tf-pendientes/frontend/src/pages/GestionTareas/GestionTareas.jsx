import { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import { Container, Row, Col, Form, Button, Table, Card, Badge, Modal, Dropdown } from 'react-bootstrap';
import Swal from 'sweetalert2';
import './GestionTareas.css';

function GestionTareas() {
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('crudItems');
        return saved ? JSON.parse(saved) : [];
    });
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('');
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const descRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('crudItems', JSON.stringify(items));
    }, [items]);

    const getFormattedDate = () => {
        const now = new Date();
        return now.toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Crear o Actualizar
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !priority) {
            Swal.fire('Error', 'El título y la prioridad son obligatorios', 'error');
            return;
        }

        if (editId) {
            Swal.fire({
                title: '¿Estás seguro?',
                text: "Se actualizará la tarea",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#198754',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, actualizar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    setItems(items.map(item => {
                        if (item.id === editId) {
                            return { ...item, title, description, priority };
                        }
                        return item;
                    }));
                    resetForm();
                    Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1500, showConfirmButton: false });
                }
            });
        } else {
            const newTask = {
                id: Date.now(),
                title,
                description,
                priority,
                status: 'Pendiente',
                history: [`Registrado: ${getFormattedDate()}`]
            };
            setItems([...items, newTask]);
            resetForm();
            Swal.fire({ icon: 'success', title: 'Agregado', timer: 1500, showConfirmButton: false });
        }
    };

    const resetForm = () => {
        setEditId(null);
        setTitle('');
        setDescription('');
        setPriority('');
        if (descRef.current) {
            descRef.current.style.height = 'auto';
        }
        setShowModal(false);
    };

    // Cambiar estado desde la tabla
    const handleChangeStatus = (id, newStatus, currentStatus) => {
        if (newStatus === currentStatus) return;

        Swal.fire({
            title: '¿Cambiar estado?',
            text: `El estado de la tarea cambiará a "${newStatus}"`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                setItems(items.map(item => {
                    if (item.id === id) {
                        const updatedHistory = item.history ? [...item.history] : [`Registrado (antiguo)`];
                        updatedHistory.push(`${newStatus}: ${getFormattedDate()}`);
                        return { ...item, status: newStatus, history: updatedHistory };
                    }
                    return item;
                }));
                Swal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
            }
        });
    };

    // Ver detalles de la tarea
    const handleView = (item) => {
        const displayTitle = item.title || item.text;
        const displayDesc = item.description ? item.description.replace(/\n/g, '<br/>') : '<em>Sin descripción</em>';
        const displayHistory = (item.history || []).map(h => `<li>${h}</li>`).join('');

        Swal.fire({
            title: `<strong>${displayTitle}</strong>`,
            html: `
                <div style="text-align: left; margin-top: 15px; font-size: 1rem; color: #555;">
                    <p><strong>Descripción:</strong><br/> ${displayDesc}</p>
                    <p><strong>Estado:</strong> ${item.status || 'Pendiente'}</p>
                    <p><strong>Prioridad:</strong> ${item.priority || 'No asignada'}</p>
                    <p><strong>Historial de fechas:</strong></p>
                    <ul>${displayHistory || '<li>Sin historial</li>'}</ul>
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
        setTitle(item.title || item.text || '');
        setDescription(item.description || '');
        setPriority(item.priority || '');
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
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                setItems(items.filter(item => item.id !== id));
                Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
            }
        });
    };

    const getPriorityBadgeClass = (prio) => {
        switch (prio) {
            case 'Bajo': return 'badge-low';
            case 'Medio': return 'badge-medium';
            case 'Alto': return 'badge-high';
            case 'Crítico': return 'badge-critical';
            default: return 'badge-default';
        }
    };

    const getStatusDotClass = (status) => {
        switch (status) {
            case 'Pendiente': return 'pendiente';
            case 'En curso': return 'en-curso';
            case 'En revisión': return 'en-revision';
            case 'Finalizado': return 'finalizado';
            default: return 'pendiente';
        }
    };

    const getUniqueHistory = (historyArr) => {
        if (!historyArr) return [];
        const seenStates = new Set();
        const uniqueHistory = [];

        for (const h of historyArr) {
            const stateName = h.split(':')[0].trim();
            if (!seenStates.has(stateName)) {
                seenStates.add(stateName);
                uniqueHistory.push(h);
            }
        }
        return uniqueHistory;
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
                                                            value={priority}
                                                            onChange={(e) => setPriority(e.target.value)}
                                                            className="form-select-custom"
                                                            required
                                                        >
                                                            <option value="">Seleccione prioridad...</option>
                                                            <option value="Bajo">Bajo</option>
                                                            <option value="Medio">Medio</option>
                                                            <option value="Alto">Alto</option>
                                                            <option value="Crítico">Crítico</option>
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
                                <h5 className="mt-4 mb-3 text-dark fw-bold border-bottom pb-2">Lista de tareas</h5>
                                {items.length === 0 ? (
                                    <p className="text-muted text-center my-4">No hay tareas registradas.</p>
                                ) : (
                                    <Table hover className="table-custom align-middle">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '28%' }}>Tarea</th>
                                                <th style={{ width: '15%' }}>Estado</th>
                                                <th style={{ width: '10%' }}>Prioridad</th>
                                                <th style={{ width: '32%' }}>Historial de Fechas</th>
                                                <th style={{ width: '15%' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(item => {
                                                const itemTitle = item.title || item.text;
                                                return (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <div className="fw-bold text-dark">{itemTitle}</div>
                                                            <div className="text-muted small text-truncate desc-truncate" title={item.description}>
                                                                {item.description || 'Sin descripción'}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Dropdown>
                                                                <Dropdown.Toggle variant="light" className={`status-dropdown-toggle ${getStatusDotClass(item.status || 'Pendiente')}`}>
                                                                    <span className={`status-dot ${getStatusDotClass(item.status || 'Pendiente')}`}></span>
                                                                    {item.status || 'Pendiente'}
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu className="status-dropdown-menu">
                                                                    {['Pendiente', 'En curso', 'En revisión', 'Finalizado'].map(status => (
                                                                        <Dropdown.Item
                                                                            key={status}
                                                                            className="status-dropdown-item"
                                                                            onClick={() => handleChangeStatus(item.id, status, item.status || 'Pendiente')}
                                                                        >
                                                                            <span className={`status-dot ${getStatusDotClass(status)}`}></span>
                                                                            {status}
                                                                        </Dropdown.Item>
                                                                    ))}
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </td>
                                                        <td>
                                                            <Badge className={`badge-custom ${getPriorityBadgeClass(item.priority)}`}>
                                                                {item.priority || 'No asignada'}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <ul className="timeline">
                                                                {getUniqueHistory(item.history).map((h, i) => (
                                                                    <li key={i} className="timeline-item">
                                                                        <span className="timeline-dot"></span>
                                                                        {h}
                                                                    </li>
                                                                ))}
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
                                                                <button className="action-icon icon-delete" title="Eliminar" onClick={() => handleDelete(item.id)}>
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default GestionTareas;