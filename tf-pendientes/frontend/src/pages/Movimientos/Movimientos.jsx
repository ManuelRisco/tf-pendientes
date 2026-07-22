import { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Form, Table, Card } from "react-bootstrap";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import CustomPagination from "../../components/Pagination/CustomPagination";
import './Movimientos.css';

function Movimientos() {
    const { user } = useAuth();
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filtroUsuario, setFiltroUsuario] = useState('');
    const [filtroAccion, setFiltroAccion] = useState('');
    const [filtroModulo, setFiltroModulo] = useState('');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const usuariosUnicos = useMemo(() => {
        const users = movimientos.map(m => m.email).filter(Boolean);
        return [...new Set(users)];
    }, [movimientos]);

    const accionesUnicas = useMemo(() => {
        const actions = movimientos.map(m => m.tipo_accion).filter(Boolean);
        return [...new Set(actions)];
    }, [movimientos]);

    const modulosUnicos = useMemo(() => {
        const mods = movimientos.map(m => m.modulo).filter(Boolean);
        return [...new Set(mods)];
    }, [movimientos]);

    const movimientosFiltrados = useMemo(() => {
        return movimientos.filter(mov => {
            const matchUsuario = filtroUsuario === '' || mov.email === filtroUsuario;
            const matchAccion = filtroAccion === '' || mov.tipo_accion === filtroAccion;
            const matchModulo = filtroModulo === '' || mov.modulo === filtroModulo;
            return matchUsuario && matchAccion && matchModulo;
        });
    }, [movimientos, filtroUsuario, filtroAccion, filtroModulo]);

    // Redirigir si no es administrador
    if (user && Number(user.rol_id) !== 1) {
        return <Navigate to="/dashboard" replace />;
    }

    useEffect(() => {
        const fetchMovimientos = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/movimientos?page=${currentPage}&limit=${limit}`);
                setMovimientos(res.data.data.items || []);
                setTotalPages(res.data.data.meta?.totalPages || 1);
            } catch (error) {
                console.error("Error fetching movimientos", error);
            } finally {
                setLoading(false);
            }
        };
        
        if (user && Number(user.rol_id) === 1) {
            fetchMovimientos();
        }
    }, [currentPage, user]);

    const getActionText = (mov) => {
        const isUser = mov.modulo === 'usuarios';
        const articulo = isUser ? 'un usuario' : 'una tarea';

        let targetInfo = '';
        if (mov.detalles) {
            const data = mov.detalles.nuevo || mov.detalles.anterior || {};
            let name = data.email || data.titulo;
            if (name) {
                if (name.length > 35) name = name.substring(0, 35) + '...';
                targetInfo = ` (${name})`;
            }
        }

        switch (mov.tipo_accion) {
            case 'CREAR': return `Creó ${isUser ? 'un nuevo usuario' : 'una nueva tarea'}${targetInfo}`;
            case 'ACTUALIZAR': return `Actualizó ${articulo}${targetInfo}`;
            case 'ELIMINAR_LOGICO': return isUser ? `Desactivó ${articulo}${targetInfo}` : `Eliminó ${articulo}${targetInfo}`;
            case 'RESTAURAR': return `Reactivó ${articulo}${targetInfo}`;
            default: return `Acción en ${articulo}${targetInfo}`;
        }
    };

    if (loading) return <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>Cargando bitácora...</div>;

    return (
        <div>
            <Container fluid className="movimientos-container px-4">
                <Row className="justify-content-center">
                    <Col xs={12}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="page-header-title m-0">Movimientos del Sistema</h2>
                        </div>

                        <Card className="card-custom mb-4">
                            <Card.Body>
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 border-bottom pb-3 gap-3" style={{ borderColor: 'var(--border-color)' }}>
                                    <h5 className="text-dark fw-bold m-0">
                                        <i className="bi bi-clock-history me-2 text-primary"></i> Historial de Acciones
                                    </h5>

                                    {/* FILTROS */}
                                    <div className="d-flex flex-wrap gap-3">
                                        <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill shadow-sm" style={{cursor: 'pointer'}} onClick={(e) => e.currentTarget.querySelector('select').focus()}>
                                            <i className="bi bi-person-circle text-secondary"></i>
                                            <Form.Select
                                                size="sm"
                                                value={filtroUsuario}
                                                onChange={(e) => setFiltroUsuario(e.target.value)}
                                                className="border-0 bg-transparent text-secondary shadow-none form-select-transparent w-auto pe-4"
                                                style={{ outline: 'none', appearance: 'none', backgroundImage: 'none', cursor: 'pointer' }}
                                            >
                                                <option value="">Todos los Usuarios</option>
                                                {usuariosUnicos.map(u => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </Form.Select>
                                            <i className="bi bi-chevron-down text-secondary" style={{fontSize: '0.75rem'}}></i>
                                        </div>

                                        <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill shadow-sm" style={{cursor: 'pointer'}} onClick={(e) => e.currentTarget.querySelector('select').focus()}>
                                            <i className="bi bi-activity text-secondary"></i>
                                            <Form.Select
                                                size="sm"
                                                value={filtroAccion}
                                                onChange={(e) => setFiltroAccion(e.target.value)}
                                                className="border-0 bg-transparent text-secondary shadow-none form-select-transparent w-auto pe-4"
                                                style={{ outline: 'none', appearance: 'none', backgroundImage: 'none', cursor: 'pointer' }}
                                            >
                                                <option value="">Todas las Acciones</option>
                                                {accionesUnicas.map(a => (
                                                    <option key={a} value={a}>{a}</option>
                                                ))}
                                            </Form.Select>
                                            <i className="bi bi-chevron-down text-secondary" style={{fontSize: '0.75rem'}}></i>
                                        </div>

                                        <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill shadow-sm" style={{cursor: 'pointer'}} onClick={(e) => e.currentTarget.querySelector('select').focus()}>
                                            <i className="bi bi-box text-secondary"></i>
                                            <Form.Select
                                                size="sm"
                                                value={filtroModulo}
                                                onChange={(e) => setFiltroModulo(e.target.value)}
                                                className="border-0 bg-transparent text-secondary shadow-none form-select-transparent w-auto pe-4 text-capitalize"
                                                style={{ outline: 'none', appearance: 'none', backgroundImage: 'none', cursor: 'pointer' }}
                                            >
                                                <option value="">Todos los Módulos</option>
                                                {modulosUnicos.map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </Form.Select>
                                            <i className="bi bi-chevron-down text-secondary" style={{fontSize: '0.75rem'}}></i>
                                        </div>
                                    </div>
                                </div>
                                
                                {movimientosFiltrados.length === 0 ? (
                                    <p className="text-muted text-center py-5 my-4 bg-light rounded border">
                                        No se encontraron movimientos que coincidan con los filtros.
                                    </p>
                                ) : (
                                    <Table hover responsive className="table-custom align-middle">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '25%' }}>Usuario</th>
                                                <th style={{ width: '15%' }}>Acción</th>
                                                <th style={{ width: '40%' }}>Descripción</th>
                                                <th style={{ width: '20%' }}>Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {movimientosFiltrados.map(mov => {
                                                let actionClass = 'badge-default';
                                                let actionBadge = mov.tipo_accion;
                                                
                                                switch(mov.tipo_accion) {
                                                    case 'CREAR': actionClass = 'badge-crear'; break;
                                                    case 'ACTUALIZAR': actionClass = 'badge-actualizar'; break;
                                                    case 'ELIMINAR_LOGICO': 
                                                        actionClass = 'badge-eliminar'; 
                                                        actionBadge = mov.modulo === 'usuarios' ? 'DESACTIVAR' : 'ELIMINAR';
                                                        break;
                                                    case 'RESTAURAR': 
                                                        actionClass = 'badge-restaurar'; 
                                                        actionBadge = 'REACTIVAR';
                                                        break;
                                                }

                                                return (
                                                    <tr key={mov.id}>
                                                        <td>
                                                            <div className="fw-bold text-dark">
                                                                {mov.persona_nombre} {mov.persona_apellido}
                                                            </div>
                                                            <div className="text-muted small">{mov.email}</div>
                                                        </td>
                                                        <td>
                                                            <span className={`action-badge ${actionClass}`}>
                                                                {actionBadge}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="text-dark small">
                                                                {getActionText(mov)}
                                                            </span>
                                                        </td>
                                                        <td className="text-muted small">
                                                            {new Date(mov.created_at).toLocaleString('es-ES', {
                                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
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
        </div>
    );
}

export default Movimientos;
