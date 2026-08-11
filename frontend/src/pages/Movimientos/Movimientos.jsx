import { Container, Row, Col, Table } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import { useMovimientos } from "./useMovimientos";
import CustomPagination from "../../components/Pagination/CustomPagination";

function Movimientos() {
    const {
        user,
        loading,
        filtroUsuario,
        setFiltroUsuario,
        filtroAccion,
        setFiltroAccion,
        filtroModulo,
        setFiltroModulo,
        currentPage,
        setCurrentPage,
        totalPages,
        usuariosUnicos,
        accionesUnicas,
        modulosUnicos,
        movimientosFiltrados,
        getActionText
    } = useMovimientos();

    if (user && Number(user.rol_id) !== 1) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner-border text-blue-600 mr-3" role="status"></div>
                <span className="font-medium text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Cargando bitácora...</span>
            </div>
        );
    }

    return (
        <div className="py-2 sm:py-6 px-1 sm:px-4 max-w-7xl mx-auto">
            <Container fluid className="p-0">
                <Row className="justify-content-center m-0">
                    <Col xs={12} className="p-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight m-0" style={{ color: 'var(--text-primary)' }}>
                                    Movimientos del Sistema
                                </h2>
                                <p className="text-xs sm:text-sm mt-1 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                    Registro de auditoría y bitácora de cambios realizados.
                                </p>
                            </div>
                        </div>

                        <div className="card-app p-4 sm:p-6 mb-6">
                            {/* Filtros superiores */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                <h5 className="text-sm sm:text-base font-bold m-0 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                    <i className="bi bi-clock-history text-blue-600"></i>
                                    <span>Historial de Acciones</span>
                                </h5>

                                <div className="flex flex-col sm:flex-row flex-wrap w-full md:w-auto gap-2.5">
                                    {/* Filtro Usuario */}
                                    <div 
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs w-full sm:w-auto"
                                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                                    >
                                        <i className="bi bi-person-circle text-xs opacity-60"></i>
                                        <select
                                            value={filtroUsuario}
                                            onChange={(e) => setFiltroUsuario(e.target.value)}
                                            className="w-full bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            <option value="">Todos los Usuarios</option>
                                            {usuariosUnicos.map(u => (
                                                <option key={u} value={u}>{u}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filtro Acción */}
                                    <div 
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs w-full sm:w-auto"
                                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                                    >
                                        <i className="bi bi-activity text-xs opacity-60"></i>
                                        <select
                                            value={filtroAccion}
                                            onChange={(e) => setFiltroAccion(e.target.value)}
                                            className="w-full bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            <option value="">Todas las Acciones</option>
                                            {accionesUnicas.map(a => (
                                                <option key={a} value={a}>{a}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filtro Módulo */}
                                    <div 
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs w-full sm:w-auto"
                                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                                    >
                                        <i className="bi bi-box text-xs opacity-60"></i>
                                        <select
                                            value={filtroModulo}
                                            onChange={(e) => setFiltroModulo(e.target.value)}
                                            className="w-full bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer capitalize"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            <option value="">Todos los Módulos</option>
                                            {modulosUnicos.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {movimientosFiltrados.length === 0 ? (
                                <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                                    <p className="text-sm m-0" style={{ color: 'var(--text-secondary)' }}>
                                        No se encontraron movimientos que coincidan con los filtros seleccionados.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table hover className="table-movimientos min-w-[650px]">
                                        <thead>
                                            <tr>
                                                <th className="w-1/4">Usuario</th>
                                                <th className="w-1/6">Acción</th>
                                                <th className="w-5/12">Descripción</th>
                                                <th className="w-1/6">Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {movimientosFiltrados.map(mov => {
                                                let badgeStyle = 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
                                                let actionBadge = mov.tipo_accion;
                                                
                                                switch(mov.tipo_accion) {
                                                    case 'CREAR': 
                                                        badgeStyle = 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700';
                                                        break;
                                                    case 'ACTUALIZAR': 
                                                        badgeStyle = 'bg-blue-100 text-blue-950 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700';
                                                        break;
                                                    case 'ELIMINAR_LOGICO': 
                                                        badgeStyle = 'bg-red-100 text-red-950 border-red-300 dark:bg-red-950/80 dark:text-red-200 dark:border-red-700';
                                                        actionBadge = mov.modulo === 'usuarios' ? 'DESACTIVAR' : 'ELIMINAR';
                                                        break;
                                                    case 'RESTAURAR': 
                                                        badgeStyle = 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700';
                                                        actionBadge = 'REACTIVAR';
                                                        break;
                                                }

                                                return (
                                                    <tr key={mov.id}>
                                                        <td>
                                                            <div className="font-semibold text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>
                                                                {mov.persona_nombre} {mov.persona_apellido}
                                                            </div>
                                                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{mov.email}</div>
                                                        </td>
                                                        <td>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}>
                                                                {actionBadge}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                                {getActionText(mov)}
                                                            </span>
                                                        </td>
                                                        <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                            <i className="bi bi-calendar3 mr-1 opacity-70"></i>
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
                                </div>
                            )}
                            
                            {totalPages > 1 && (
                                <CustomPagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Movimientos;
