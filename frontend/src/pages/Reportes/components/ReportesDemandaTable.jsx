import PropTypes from 'prop-types';
import CustomPagination from '../../../components/Pagination/CustomPagination';
import { formatDate } from '../../../lib/dateUtils';

export default function ReportesDemandaTable({
    filteredUsuarios,
    paginatedUsuarios,
    searchUsuario,
    setSearchUsuario,
    tipoBusquedaUsuario,
    setTipoBusquedaUsuario,
    paginaUsuarios,
    setPaginaUsuarios,
    totalPagesUsuarios,
    totalTicketsGeneral
}) {
    return (
        <div className="card-app p-0 overflow-hidden">
            <div className="p-4 sm:p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                            Mapeo de Demanda por Solicitante
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                            {filteredUsuarios.length} {filteredUsuarios.length === 1 ? 'solicitante' : 'solicitantes'}
                        </span>
                    </div>
                    <p className="text-xs mt-1 mb-0 opacity-70" style={{ color: 'var(--text-secondary)' }}>
                        Trazabilidad y desglose de requerimientos generados por cada usuario.
                    </p>
                </div>

                {/* Buscador: Nombre o Correo con selector de campo */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <label className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>Buscar por:</label>
                        <select
                            value={tipoBusquedaUsuario}
                            onChange={(e) => {
                                setTipoBusquedaUsuario(e.target.value);
                                setPaginaUsuarios(1);
                            }}
                            className="px-2.5 py-2 text-xs rounded-xl border focus:outline-none cursor-pointer"
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                borderColor: 'var(--border-color)'
                            }}
                        >
                            <option value="todos">Nombre o Correo</option>
                            <option value="nombre">Solo Nombre</option>
                            <option value="email">Solo Correo</option>
                        </select>
                    </div>

                    <div className="relative flex-1 sm:w-64">
                        <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-60" style={{ color: 'var(--text-secondary)' }}></i>
                        <input
                            type="text"
                            value={searchUsuario}
                            onChange={(e) => {
                                setSearchUsuario(e.target.value);
                                setPaginaUsuarios(1);
                            }}
                            placeholder={
                                tipoBusquedaUsuario === 'nombre'
                                    ? "Buscar por nombre..."
                                    : tipoBusquedaUsuario === 'email'
                                        ? "Buscar por correo..."
                                        : "Buscar por nombre o correo..."
                            }
                            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                        {searchUsuario && (
                            <button
                                onClick={() => {
                                    setSearchUsuario('');
                                    setPaginaUsuarios(1);
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 p-1 border-0 bg-transparent"
                                style={{ color: 'var(--text-primary)' }}
                                title="Limpiar búsqueda"
                            >
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left">
                    <thead className="text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                        <tr>
                            <th className="px-5 sm:px-6 py-3.5 border-b" style={{ borderColor: 'var(--border-color)' }}>Solicitante</th>
                            <th className="px-5 sm:px-6 py-3.5 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Tickets Generados</th>
                            <th className="px-5 sm:px-6 py-3.5 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Estado</th>
                            <th className="px-5 sm:px-6 py-3.5 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Efectividad</th>
                            <th className="px-5 sm:px-6 py-3.5 border-b text-end" style={{ borderColor: 'var(--border-color)' }}>Último Requerimiento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsuarios.length > 0 ? (
                            paginatedUsuarios.map((u, idx) => {
                                const inicial = (u.nombre_completo || u.email || 'U').charAt(0).toUpperCase();
                                return (
                                    <tr
                                        key={u.usuario_id || idx}
                                        className="border-b transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/60"
                                        style={{ borderColor: 'var(--border-color)' }}
                                    >
                                        <td className="px-5 sm:px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-600/15 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-500/20">
                                                    {inicial}
                                                </div>
                                                <div>
                                                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                        {u.nombre_completo}
                                                    </div>
                                                    <div className="text-[11px] opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                                        {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 sm:px-6 py-3.5 text-center">
                                            <span className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                                                {u.total_tickets}
                                            </span>
                                            <span className="text-[11px] block opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                                {totalTicketsGeneral > 0 ? `${((u.total_tickets / totalTicketsGeneral) * 100).toFixed(1)}% de la demanda` : '0%'}
                                            </span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                                    <i className="bi bi-check2"></i>
                                                    {u.resueltos} resuelto{u.resueltos !== 1 ? 's' : ''}
                                                </span>
                                                {u.pendientes > 0 && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                                                        <i className="bi bi-hourglass-split"></i>
                                                        {u.pendientes} pendiente{u.pendientes !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 sm:px-6 py-3.5 text-center min-w-[130px]">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                                                    {u.porcentaje_exito}%
                                                </span>
                                                <div className="w-24 h-1.5 rounded-full overflow-hidden mt-1" style={{ backgroundColor: 'var(--border-color)' }}>
                                                    <div
                                                        className="h-full rounded-full bg-emerald-500"
                                                        style={{ width: `${u.porcentaje_exito}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 sm:px-6 py-3.5 text-end font-medium" style={{ color: 'var(--text-secondary)' }}>
                                            <div className="inline-flex items-center gap-1 text-xs">
                                                <i className="bi bi-calendar3 opacity-70"></i>
                                                <span>{formatDate(u.ultimo_ticket)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center" style={{ color: 'var(--text-secondary)' }}>
                                    <i className="bi bi-people text-3xl mb-2 opacity-40"></i>
                                    <p className="font-semibold text-sm m-0">No se encontraron solicitantes</p>
                                    <p className="text-xs mt-1 opacity-75">No hay requerimientos que coincidan con el criterio ingresado.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPagesUsuarios > 1 && (
                <div className="p-3 sm:p-4 border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                    <CustomPagination
                        currentPage={paginaUsuarios}
                        totalPages={totalPagesUsuarios}
                        onPageChange={setPaginaUsuarios}
                    />
                </div>
            )}
        </div>
    );
}

ReportesDemandaTable.propTypes = {
    filteredUsuarios: PropTypes.array.isRequired,
    paginatedUsuarios: PropTypes.array.isRequired,
    searchUsuario: PropTypes.string.isRequired,
    setSearchUsuario: PropTypes.func.isRequired,
    tipoBusquedaUsuario: PropTypes.string.isRequired,
    setTipoBusquedaUsuario: PropTypes.func.isRequired,
    paginaUsuarios: PropTypes.number.isRequired,
    setPaginaUsuarios: PropTypes.func.isRequired,
    totalPagesUsuarios: PropTypes.number.isRequired,
    totalTicketsGeneral: PropTypes.number.isRequired
};
