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
    totalTicketsGeneral,
    itemsPorPaginaUsuarios,
    setItemsPorPaginaUsuarios
}) {
    const pageSize = itemsPorPaginaUsuarios || 5;
    const startUsuarios = filteredUsuarios.length === 0 ? 0 : (paginaUsuarios - 1) * pageSize + 1;
    const endUsuarios = Math.min(paginaUsuarios * pageSize, filteredUsuarios.length);

    return (
        <div className="card-app p-0 overflow-hidden">
            <div className="p-4 sm:p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                            Mapeo de Demanda por Solicitante
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                            Mostrando {filteredUsuarios.length === 0 ? 0 : `${startUsuarios} - ${endUsuarios}`} de {filteredUsuarios.length} {filteredUsuarios.length === 1 ? 'solicitante' : 'solicitantes'}
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

                    <div className="relative flex-1 sm:w-72 md:w-80">
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
                            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-[11px] sm:placeholder:text-xs"
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

                    {itemsPorPaginaUsuarios !== undefined && setItemsPorPaginaUsuarios && (
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-xs shrink-0"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                            title="Filas por página"
                        >
                            <span className="text-[11px] opacity-60 font-semibold" style={{ color: 'var(--text-secondary)' }}>Filas:</span>
                            <select
                                value={itemsPorPaginaUsuarios}
                                onChange={(e) => setItemsPorPaginaUsuarios(Number(e.target.value))}
                                className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto min-h-[260px]">
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
                                const pct = totalTicketsGeneral > 0 ? ((u.total_tickets / totalTicketsGeneral) * 100).toFixed(1) : 0;
                                const resolucionPct = u.porcentaje_exito ?? (u.total_tickets > 0 ? Math.round(((u.resueltos || 0) / u.total_tickets) * 100) : 0);
                                const tienePendientes = (u.pendientes || 0) > 0;

                                return (
                                    <tr
                                        key={u.usuario_id || idx}
                                        className="hover:bg-slate-500/5 transition-colors border-b"
                                        style={{ borderColor: 'var(--border-color)' }}
                                    >
                                        <td className="px-5 sm:px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200 dark:border-indigo-800">
                                                    {inicial}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-xs sm:text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                                        {u.nombre_completo || 'Usuario sin nombre'}
                                                    </div>
                                                    <div className="text-[11px] opacity-70 truncate" style={{ color: 'var(--text-secondary)' }}>
                                                        {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 sm:px-6 py-3.5 text-center">
                                            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                                                {u.total_tickets}
                                            </span>
                                            <span className="text-[11px] opacity-60 block" style={{ color: 'var(--text-secondary)' }}>
                                                {pct}% del total
                                            </span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-3.5 text-center">
                                            <div className="inline-flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                                    {u.resueltos || 0} resueltos
                                                </span>
                                                {tienePendientes && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                                        {u.pendientes} pendientes
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 sm:px-6 py-3.5 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                                                        {resolucionPct}%
                                                    </span>
                                                </div>
                                                <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            resolucionPct >= 80 ? 'bg-emerald-500' :
                                                            resolucionPct >= 50 ? 'bg-blue-500' :
                                                            resolucionPct >= 25 ? 'bg-amber-500' : 'bg-rose-500'
                                                        }`}
                                                        style={{ width: `${resolucionPct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 sm:px-6 py-3.5 text-end text-xs opacity-75" style={{ color: 'var(--text-secondary)' }}>
                                            {u.ultimo_ticket ? formatDate(u.ultimo_ticket) : 'Sin fecha'}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <i className="bi bi-person-x text-3xl opacity-40"></i>
                                        <span className="text-xs font-medium">
                                            {searchUsuario ? 'No se encontraron solicitantes que coincidan con la búsqueda.' : 'No hay datos de solicitantes en el período seleccionado.'}
                                        </span>
                                    </div>
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
    totalTicketsGeneral: PropTypes.number.isRequired,
    itemsPorPaginaUsuarios: PropTypes.number,
    setItemsPorPaginaUsuarios: PropTypes.func
};
