import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useMovimientos } from "./useMovimientos";
import MovimientosMetrics from "./components/MovimientosMetrics";
import MovimientosFilters from "./components/MovimientosFilters";
import MovimientosTable from "./components/MovimientosTable";
import MovimientoDetailModal from "./components/MovimientoDetailModal";

export default function Movimientos() {
    const navigate = useNavigate();
    const movHook = useMovimientos();
    const { user, loading, movimientosFiltrados, metrics, handleExportExcel, isExporting, selectedMovimiento, setSelectedMovimiento, getActionText } = movHook;
    const isAdmin = Number(user?.rol_id) === 1;

    if (loading && movimientosFiltrados.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="spinner-border text-blue-600 mb-3" role="status"></div>
                <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>Cargando bitácora de movimientos...</span>
                <span className="text-xs mt-1 opacity-70" style={{ color: 'var(--text-secondary)' }}>Sincronizando auditoría en tiempo real</span>
            </div>
        );
    }

    return (
        <div className="py-2 sm:py-4 animate-fade-in">
            <Container fluid className="px-2 sm:px-4">
                <Row className="justify-content-center m-0">
                    <Col xs={12} className="p-0">
                        {/* Cabecera Principal y Métricas */}
                        <div className="card-app p-4 sm:p-6 mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/50 shrink-0">
                                            <i className="bi bi-clock-history text-lg"></i>
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-black tracking-tight m-0" style={{ color: 'var(--text-primary)' }}>
                                            Historial de Movimientos
                                        </h2>
                                        {!isAdmin && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                                                <i className="bi bi-person-fill"></i> Mis movimientos
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm mt-1.5 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                        {isAdmin
                                            ? 'Auditoría cronológica de cambios, creación de tareas y acciones de usuarios.'
                                            : 'Registro de todas las acciones y modificaciones realizadas en tus tareas.'}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleExportExcel}
                                    disabled={movimientosFiltrados.length === 0 || isExporting}
                                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 hover:bg-slate-500/10 active:scale-95"
                                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                    title="Descargar historial filtrado en formato Excel (.xlsx) estandarizado"
                                >
                                    {isExporting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm text-emerald-600" role="status" aria-hidden="true"></span>
                                            <span>Generando Excel...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-file-earmark-excel-fill text-emerald-600 dark:text-emerald-400 text-base"></i>
                                            <span>Exportar Excel</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <MovimientosMetrics metrics={metrics} />
                        </div>

                        {/* Contenedor Principal: Filtros y Tabla */}
                        <div className="card-app p-4 sm:p-6 mb-5 sm:mb-6">
                            <MovimientosFilters
                                {...movHook}
                                isAdmin={isAdmin}
                                totalRegistros={movHook.totalRegistros}
                                totalGeneral={metrics.total}
                            />

                            <MovimientosTable
                                {...movHook}
                                movimientos={movimientosFiltrados}
                                onSelectMovimiento={setSelectedMovimiento}
                                onNavigateToTask={(taskId) => navigate(`/gestion-tareas?id=${taskId}`)}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>

            <MovimientoDetailModal
                movimiento={selectedMovimiento}
                show={!!selectedMovimiento}
                onClose={() => setSelectedMovimiento(null)}
                onNavigateToTask={(taskId) => navigate(`/gestion-tareas?id=${taskId}`)}
                getActionText={getActionText}
            />
        </div>
    );
}
