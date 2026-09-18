import PropTypes from 'prop-types';
import CustomPagination from '../../../components/Pagination/CustomPagination';
import { formatDate } from '../../../lib/dateUtils';

export default function ReportesCriticosTable({
    criticosPendientes,
    filteredCriticos,
    paginatedCriticos,
    filtroPrioridadCriticos,
    setFiltroPrioridadCriticos,
    filtroEstadoCriticos,
    setFiltroEstadoCriticos,
    paginaCriticos,
    setPaginaCriticos,
    totalPagesCriticos,
    onNavigateToTask
}) {
    if (criticosPendientes.length === 0) return null;

    return (
        <div className="card-app p-0 overflow-hidden border-rose-500/30">
            <div className="p-4 sm:p-5 border-b bg-rose-500/5 flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm">
                        <i className="bi bi-exclamation-octagon-fill"></i>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold m-0 text-rose-700 dark:text-rose-400">
                            Incidentes Críticos y de Alta Prioridad Abiertos
                        </h3>
                        <p className="text-xs m-0 opacity-75" style={{ color: 'var(--text-secondary)' }}>
                            Tickets prioritarios que requieren atención ({filteredCriticos.length} de {criticosPendientes.length} casos)
                        </p>
                    </div>
                </div>

                {/* Filtros de Prioridad y Estado para casos críticos */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5">
                        <label className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>Prioridad:</label>
                        <select
                            value={filtroPrioridadCriticos}
                            onChange={(e) => {
                                setFiltroPrioridadCriticos(e.target.value);
                                setPaginaCriticos(1);
                            }}
                            className="px-2.5 py-1.5 text-xs rounded-xl border focus:outline-none cursor-pointer"
                            style={{
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                borderColor: 'var(--border-color)'
                            }}
                        >
                            <option value="todas">Todas (Crítica y Alta)</option>
                            <option value="4">Solo Crítica</option>
                            <option value="3">Solo Alta</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <label className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>Estado:</label>
                        <select
                            value={filtroEstadoCriticos}
                            onChange={(e) => {
                                setFiltroEstadoCriticos(e.target.value);
                                setPaginaCriticos(1);
                            }}
                            className="px-2.5 py-1.5 text-xs rounded-xl border focus:outline-none cursor-pointer"
                            style={{
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                borderColor: 'var(--border-color)'
                            }}
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="1">Pendiente</option>
                            <option value="2">En curso</option>
                            <option value="3">En revisión</option>
                        </select>
                    </div>

                    {(filtroPrioridadCriticos !== 'todas' || filtroEstadoCriticos !== 'todos') && (
                        <button
                            onClick={() => {
                                setFiltroPrioridadCriticos('todas');
                                setFiltroEstadoCriticos('todos');
                                setPaginaCriticos(1);
                            }}
                            className="px-3 py-1.5 text-xs rounded-xl border font-semibold text-rose-500 hover:bg-rose-500/10 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            style={{ borderColor: 'var(--border-color)' }}
                            title="Restablecer filtros de críticos"
                        >
                            <i className="bi bi-arrow-counterclockwise"></i>
                            <span>Limpiar</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto min-h-[260px]">
                <table className="w-full text-xs sm:text-sm text-left">
                    <thead className="text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                        <tr>
                            <th className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>ID & Ticket</th>
                            <th className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>Solicitante</th>
                            <th className="px-5 py-3 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Prioridad</th>
                            <th className="px-5 py-3 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Estado</th>
                            <th className="px-5 py-3 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Antigüedad</th>
                            <th className="px-5 py-3 border-b text-end" style={{ borderColor: 'var(--border-color)' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCriticos.length > 0 ? (
                            paginatedCriticos.map((ticket) => (
                                <tr
                                    key={ticket.id}
                                    className="border-b transition-colors hover:bg-rose-500/5"
                                    style={{ borderColor: 'var(--border-color)' }}
                                >
                                    <td className="px-5 py-3.5">
                                        <div className="font-semibold text-rose-700 dark:text-rose-400">
                                            #{ticket.id} — {ticket.titulo}
                                        </div>
                                        <div className="text-[11px] opacity-70 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                            Registrado el {formatDate(ticket.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {ticket.solicitante}
                                        </div>
                                        <div className="text-[11px] opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                            {ticket.email}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold ${ticket.prioridad_id === 4
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300'
                                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                                            }`}>
                                            {ticket.prioridad_nombre}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                                            {ticket.estado_nombre}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${ticket.dias_abierto > 3
                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                            }`}>
                                            <i className="bi bi-clock-history"></i>
                                            {ticket.dias_abierto === 0 ? 'Hoy' : `${ticket.dias_abierto} día${ticket.dias_abierto > 1 ? 's' : ''}`}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-end">
                                        <button
                                            onClick={() => onNavigateToTask(ticket.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer hover:bg-slate-500/10 active:scale-95 shadow-xs"
                                            style={{
                                                backgroundColor: 'var(--bg-secondary)',
                                                borderColor: 'var(--border-color)',
                                                color: 'var(--text-primary)'
                                            }}
                                        >
                                            <span>Ver en Gestión</span>
                                            <i className="bi bi-box-arrow-up-right text-[11px] text-blue-500"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                                    <p className="font-semibold text-sm m-0">No se encontraron tickets con los filtros seleccionados</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPagesCriticos > 1 && (
                <div className="p-3 sm:p-4 border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                    <CustomPagination
                        currentPage={paginaCriticos}
                        totalPages={totalPagesCriticos}
                        onPageChange={setPaginaCriticos}
                    />
                </div>
            )}
        </div>
    );
}

ReportesCriticosTable.propTypes = {
    criticosPendientes: PropTypes.array.isRequired,
    filteredCriticos: PropTypes.array.isRequired,
    paginatedCriticos: PropTypes.array.isRequired,
    filtroPrioridadCriticos: PropTypes.string.isRequired,
    setFiltroPrioridadCriticos: PropTypes.func.isRequired,
    filtroEstadoCriticos: PropTypes.string.isRequired,
    setFiltroEstadoCriticos: PropTypes.func.isRequired,
    paginaCriticos: PropTypes.number.isRequired,
    setPaginaCriticos: PropTypes.func.isRequired,
    totalPagesCriticos: PropTypes.number.isRequired,
    onNavigateToTask: PropTypes.func.isRequired
};
