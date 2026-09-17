import PropTypes from 'prop-types';

export default function DashboardHeader({
    user,
    isAdmin,
    filtroAlcance,
    setFiltroAlcance,
    filtroUsuarioId,
    setFiltroUsuarioId,
    usuariosList
}) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight m-0" style={{ color: 'var(--text-primary)' }}>
                        Bienvenido, {user?.nombre || 'Usuario'} {user?.apellido || ''}
                    </h1>
                    {!isAdmin && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                            <i className="bi bi-person-fill"></i> Mis tareas
                        </span>
                    )}
                </div>
                <p className="text-xs sm:text-sm mt-1 mb-0" style={{ color: 'var(--text-secondary)' }}>
                    {isAdmin
                        ? 'Resumen de métricas y tareas del sistema.'
                        : 'Resumen y estado de tus tareas.'}
                </p>
            </div>

            {isAdmin && (
                <div
                    className="w-full lg:w-auto flex flex-wrap items-center gap-2 p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800"
                    style={{ backgroundColor: 'var(--bg-secondary)', boxShadow: 'var(--card-shadow)' }}
                >
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs">
                        <i className="bi bi-people-fill text-indigo-500 text-xs"></i>
                        <select
                            value={filtroAlcance}
                            onChange={e => {
                                const val = e.target.value;
                                setFiltroAlcance(val);
                                if (val !== 'usuario_especifico') {
                                    setFiltroUsuarioId('');
                                }
                            }}
                            className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200"
                        >
                            <option value="todos" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Todas las tareas</option>
                            <option value="mis_tareas" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Mis tareas creadas</option>
                            <option value="otros" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Tareas de otros</option>
                            <option value="usuario_especifico" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Buscar por usuario...</option>
                        </select>
                    </div>

                    {filtroAlcance === 'usuario_especifico' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs animate-fade-in">
                            <i className="bi bi-person-badge text-blue-500 text-xs"></i>
                            <select
                                value={filtroUsuarioId}
                                onChange={e => setFiltroUsuarioId(e.target.value)}
                                className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer max-w-[200px] text-slate-800 dark:text-slate-200"
                            >
                                <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Selecciona un usuario...</option>
                                {(Array.isArray(usuariosList) ? usuariosList : []).map(u => (
                                    <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                                        {u.persona_nombre ? `${u.persona_nombre} ${u.persona_apellido}` : u.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

DashboardHeader.propTypes = {
    user: PropTypes.shape({
        nombre: PropTypes.string,
        apellido: PropTypes.string
    }),
    isAdmin: PropTypes.bool.isRequired,
    filtroAlcance: PropTypes.string,
    setFiltroAlcance: PropTypes.func.isRequired,
    filtroUsuarioId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    setFiltroUsuarioId: PropTypes.func.isRequired,
    usuariosList: PropTypes.array
};
