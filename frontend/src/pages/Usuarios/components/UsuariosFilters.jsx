import PropTypes from 'prop-types';

export default function UsuariosFilters({
    search,
    setSearch,
    filtroEstado,
    setFiltroEstado,
    filtroRol,
    setFiltroRol,
    roles,
    hasActiveFilters,
    handleClearFilters,
    totalFiltrados,
    totalCount
}) {
    return (
        <div
            className="rounded-2xl p-3 sm:p-4 mb-5 sm:mb-6 border"
            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-4 items-end">
                <div className="col-span-1 sm:col-span-2 lg:col-span-5">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                        Buscar usuario
                    </label>
                    <div className="relative flex items-center">
                        <i className="bi bi-search absolute left-3 text-sm pointer-events-none opacity-50"></i>
                        <input
                            type="text"
                            placeholder="Nombre, apellido o correo..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-lg border focus:outline-none transition-all"
                            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-2.5 hover:text-red-500 text-sm opacity-60 hover:opacity-100"
                                title="Limpiar búsqueda"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        )}
                    </div>
                </div>

                <div className="col-span-1 sm:col-span-1 lg:col-span-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                        Estado
                    </label>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border focus:outline-none transition-all cursor-pointer"
                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="activo">Solo Activos</option>
                        <option value="inactivo">Solo Inactivos</option>
                    </select>
                </div>

                <div className="col-span-1 sm:col-span-1 lg:col-span-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                        Rol
                    </label>
                    <select
                        value={filtroRol}
                        onChange={(e) => setFiltroRol(e.target.value)}
                        className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border focus:outline-none transition-all cursor-pointer"
                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                    >
                        <option value="">Todos los roles</option>
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex items-center">
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border hover:opacity-80 transition-all flex items-center justify-center gap-1"
                            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                            title="Restablecer filtros"
                        >
                            <i className="bi bi-arrow-counterclockwise"></i>
                            <span className="lg:hidden text-xs">Limpiar</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                    Mostrando <strong style={{ color: 'var(--text-primary)' }}>{totalFiltrados}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong> usuarios
                </span>
            </div>
        </div>
    );
}

UsuariosFilters.propTypes = {
    search: PropTypes.string.isRequired,
    setSearch: PropTypes.func.isRequired,
    filtroEstado: PropTypes.string.isRequired,
    setFiltroEstado: PropTypes.func.isRequired,
    filtroRol: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    setFiltroRol: PropTypes.func.isRequired,
    roles: PropTypes.array.isRequired,
    hasActiveFilters: PropTypes.bool,
    handleClearFilters: PropTypes.func.isRequired,
    totalFiltrados: PropTypes.number.isRequired,
    totalCount: PropTypes.number.isRequired
};
