import PropTypes from 'prop-types';

export default function GestionTareasFilters({
    isAdmin,
    searchQuery,
    setSearchQuery,
    filtroAlcance,
    setFiltroAlcance,
    setFiltroUsuarioId,
    filtroEstado,
    setFiltroEstado,
    filtroPrioridad,
    setFiltroPrioridad,
    filtroAtencion,
    setFiltroAtencion,
    estados,
    prioridades,
    hasActiveFilters,
    handleClearFilters,
    totalTasksCount,
    limit,
    setLimit,
    currentPage = 1
}) {
    const startItem = totalTasksCount === 0 ? 0 : (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalTasksCount);
    return (
        <div className="mb-4 pb-3 border-b space-y-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
                <div className="flex items-center gap-2 shrink-0">
                    <h5 className="text-sm sm:text-base font-bold m-0" style={{ color: 'var(--text-primary)' }}>Lista de tareas</h5>
                    {!isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                            <i className="bi bi-person-fill"></i> Mis tareas
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs w-full sm:w-80 md:w-96 lg:w-[340px] xl:w-[360px] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shrink-0"
                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                    >
                        <i className="bi bi-search text-xs opacity-60 shrink-0" style={{ color: 'var(--text-secondary)' }}></i>
                        <input
                            type="text"
                            placeholder={isAdmin ? "Buscar por título, usuario o #ID..." : "Buscar en mis tareas..."}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-transparent border-0 outline-none shadow-none text-xs w-full font-medium placeholder:text-[11px] sm:placeholder:text-xs"
                            style={{ color: 'var(--text-primary)' }}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="text-xs opacity-60 hover:opacity-100 cursor-pointer border-0 bg-transparent p-0 shrink-0 transition-opacity"
                                style={{ color: 'var(--text-secondary)' }}
                                title="Limpiar búsqueda"
                            >
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        )}
                    </div>

                    {isAdmin && (
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-xs w-full sm:w-auto"
                            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                        >
                            <i className="bi bi-people-fill text-indigo-500 text-xs shrink-0"></i>
                            <select
                                value={filtroAlcance}
                                onChange={e => {
                                    setFiltroAlcance(e.target.value);
                                    setFiltroUsuarioId('');
                                }}
                                className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer w-full sm:w-auto"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                <option value="todos">Todas las tareas</option>
                                <option value="mis_tareas">Mis tareas creadas</option>
                                <option value="por_otros_usuarios">Por otros usuarios</option>
                            </select>
                        </div>
                    )}

                    <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-xs flex-1 sm:flex-initial min-w-[130px]"
                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                    >
                        <i className="bi bi-funnel-fill text-blue-500 text-xs shrink-0"></i>
                        <select
                            value={filtroEstado}
                            onChange={e => setFiltroEstado(e.target.value)}
                            className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer w-full sm:w-auto"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <option value="">Todos los estados</option>
                            {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                        </select>
                    </div>

                    <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-xs flex-1 sm:flex-initial min-w-[130px]"
                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                    >
                        <i className="bi bi-flag-fill text-red-500 text-xs shrink-0"></i>
                        <select
                            value={filtroPrioridad}
                            onChange={e => setFiltroPrioridad(e.target.value)}
                            className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer w-full sm:w-auto"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <option value="">Todas las prioridades</option>
                            {prioridades.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>

                    <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-xs flex-1 sm:flex-initial min-w-[130px]"
                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                    >
                        <i className="bi bi-chat-check-fill text-emerald-500 text-xs shrink-0"></i>
                        <select
                            value={filtroAtencion}
                            onChange={e => setFiltroAtencion(e.target.value)}
                            className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer w-full sm:w-auto"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <option value="">Todas (Atención)</option>
                            <option value="atendidos">Atendidos</option>
                            <option value="por_atender">Por atender</option>
                        </select>
                    </div>

                    {limit !== undefined && setLimit && (
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-xs shrink-0"
                            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                            title="Tareas por página"
                        >
                            <span className="text-[11px] opacity-60 font-semibold" style={{ color: 'var(--text-secondary)' }}>Filas:</span>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    )}

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="px-3 py-1.5 text-xs rounded-xl font-semibold border text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shrink-0"
                            style={{ borderColor: 'var(--border-color)' }}
                            title="Restablecer todos los filtros"
                        >
                            <i className="bi bi-arrow-counterclockwise"></i>
                            <span className="inline">Limpiar</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <span>
                    {totalTasksCount === 0 ? (
                        <span>No se encontraron tareas registradas</span>
                    ) : (
                        <>
                            Mostrando <strong style={{ color: 'var(--text-primary)' }}>{startItem} - {endItem}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{totalTasksCount}</strong> tareas encontradas
                        </>
                    )}
                </span>
                {hasActiveFilters && (
                    <span className="italic text-blue-600 dark:text-blue-400">
                        Filtros activos aplicados
                    </span>
                )}
            </div>
        </div>
    );
}

GestionTareasFilters.propTypes = {
    isAdmin: PropTypes.bool,
    searchQuery: PropTypes.string.isRequired,
    setSearchQuery: PropTypes.func.isRequired,
    filtroAlcance: PropTypes.string.isRequired,
    setFiltroAlcance: PropTypes.func.isRequired,
    setFiltroUsuarioId: PropTypes.func.isRequired,
    filtroEstado: PropTypes.string.isRequired,
    setFiltroEstado: PropTypes.func.isRequired,
    filtroPrioridad: PropTypes.string.isRequired,
    setFiltroPrioridad: PropTypes.func.isRequired,
    filtroAtencion: PropTypes.string,
    setFiltroAtencion: PropTypes.func,
    estados: PropTypes.array.isRequired,
    prioridades: PropTypes.array.isRequired,
    hasActiveFilters: PropTypes.bool,
    handleClearFilters: PropTypes.func.isRequired,
    totalTasksCount: PropTypes.number.isRequired,
    limit: PropTypes.number,
    setLimit: PropTypes.func,
    currentPage: PropTypes.number
};
