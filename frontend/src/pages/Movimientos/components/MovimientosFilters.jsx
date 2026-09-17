import PropTypes from 'prop-types';

export default function MovimientosFilters({
    searchQuery,
    setSearchQuery,
    filtroModulo,
    setFiltroModulo,
    filtroAlcance,
    setFiltroAlcance,
    filtroUsuarioId,
    setFiltroUsuarioId,
    usuariosList,
    filtroAccion,
    setFiltroAccion,
    accionesUnicas,
    limit,
    setLimit,
    hasActiveFilters,
    handleClearFilters,
    isAdmin,
    totalFiltrados,
    totalRegistros
}) {
    return (
        <div className="mb-4 pb-4 border-b space-y-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                {/* Pestañas de Módulo Rápido */}
                <div
                    className="inline-flex p-0.5 rounded-xl border text-xs font-semibold shrink-0"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                >
                    <button
                        type="button"
                        onClick={() => setFiltroModulo('')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95 ${filtroModulo === ''
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'opacity-70 hover:opacity-100'
                            }`}
                        style={{ color: filtroModulo === '' ? '#fff' : 'var(--text-primary)' }}
                    >
                        Todos
                    </button>
                    <button
                        type="button"
                        onClick={() => setFiltroModulo('tareas')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${filtroModulo === 'tareas'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'opacity-70 hover:opacity-100'
                            }`}
                        style={{ color: filtroModulo === 'tareas' ? '#fff' : 'var(--text-primary)' }}
                    >
                        <i className="bi bi-card-checklist text-[11px]"></i>
                        <span>Tareas</span>
                    </button>
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={() => setFiltroModulo('usuarios')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${filtroModulo === 'usuarios'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'opacity-70 hover:opacity-100'
                                }`}
                            style={{ color: filtroModulo === 'usuarios' ? '#fff' : 'var(--text-primary)' }}
                        >
                            <i className="bi bi-people text-[11px]"></i>
                            <span>Usuarios</span>
                        </button>
                    )}
                </div>

                {/* Filtros desplegables y buscador */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Buscador en tiempo real */}
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs w-full sm:w-64 md:w-72 focus-within:border-blue-500 transition-all"
                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                    >
                        <i className="bi bi-search text-xs opacity-60" style={{ color: 'var(--text-secondary)' }}></i>
                        <input
                            type="text"
                            placeholder="Buscar por usuario, tarea, email o #ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-0 outline-none shadow-none text-xs w-full font-medium"
                            style={{ color: 'var(--text-primary)' }}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="text-xs opacity-60 hover:opacity-100 cursor-pointer border-0 bg-transparent p-0"
                                style={{ color: 'var(--text-secondary)' }}
                                title="Limpiar búsqueda"
                            >
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        )}
                    </div>

                    {isAdmin && (
                        <>
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs"
                                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                            >
                                <i className="bi bi-people-fill text-indigo-500 text-xs"></i>
                                <select
                                    value={filtroAlcance}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFiltroAlcance(val);
                                        if (val !== 'usuario_especifico') {
                                            setFiltroUsuarioId('');
                                        }
                                    }}
                                    className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    <option value="todos">Todos los movimientos</option>
                                    <option value="mis_movimientos">Mis movimientos</option>
                                    <option value="otros">Movimientos de otros</option>
                                    <option value="usuario_especifico">Buscar por usuario...</option>
                                </select>
                            </div>

                            {filtroAlcance === 'usuario_especifico' && (
                                <div
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs animate-fade-in"
                                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                                >
                                    <i className="bi bi-person-badge text-blue-500 text-xs"></i>
                                    <select
                                        value={filtroUsuarioId}
                                        onChange={(e) => setFiltroUsuarioId(e.target.value)}
                                        className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer max-w-[200px]"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        <option value="">Seleccionar usuario...</option>
                                        {(Array.isArray(usuariosList) ? usuariosList : []).map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.persona_nombre ? `${u.persona_nombre} ${u.persona_apellido}` : u.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    {/* Filtro Tipo de Acción */}
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs"
                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                    >
                        <i className="bi bi-activity text-xs opacity-60"></i>
                        <select
                            value={filtroAccion}
                            onChange={(e) => setFiltroAccion(e.target.value)}
                            className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <option value="">Todas las Acciones</option>
                            {accionesUnicas.map((a) => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de límite por página */}
                    <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-xs"
                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                        title="Elementos por página"
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

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="px-3 py-1.5 text-xs rounded-xl font-semibold border text-rose-500 hover:bg-rose-500/10 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            style={{ borderColor: 'var(--border-color)' }}
                            title="Restablecer todos los filtros"
                        >
                            <i className="bi bi-arrow-counterclockwise"></i>
                            <span className="hidden sm:inline">Limpiar</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <span>
                    Mostrando <strong style={{ color: 'var(--text-primary)' }}>{totalFiltrados}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{totalRegistros}</strong> movimientos registrados
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

MovimientosFilters.propTypes = {
    searchQuery: PropTypes.string,
    setSearchQuery: PropTypes.func.isRequired,
    filtroModulo: PropTypes.string,
    setFiltroModulo: PropTypes.func.isRequired,
    filtroAlcance: PropTypes.string,
    setFiltroAlcance: PropTypes.func.isRequired,
    filtroUsuarioId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    setFiltroUsuarioId: PropTypes.func.isRequired,
    usuariosList: PropTypes.array,
    filtroAccion: PropTypes.string,
    setFiltroAccion: PropTypes.func.isRequired,
    accionesUnicas: PropTypes.array.isRequired,
    limit: PropTypes.number.isRequired,
    setLimit: PropTypes.func.isRequired,
    hasActiveFilters: PropTypes.bool,
    handleClearFilters: PropTypes.func.isRequired,
    isAdmin: PropTypes.bool,
    totalFiltrados: PropTypes.number.isRequired,
    totalRegistros: PropTypes.number.isRequired
};
