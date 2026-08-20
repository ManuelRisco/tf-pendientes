import { useDashboard } from "./useDashboard";

function Dashboard() {
    const {
        user,
        loading,
        isUpdating,
        total,
        estados,
        prioridades,
        estadoColors,
        prioridadColors,
        totalUsuarios,
        actividadReciente,
        filtroAlcance,
        setFiltroAlcance,
        filtroUsuarioId,
        setFiltroUsuarioId,
        usuariosList,
        getTimeAgo,
        getActionColor,
        getActionText
    } = useDashboard();

    const isAdmin = Number(user?.rol_id) === 1;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner-border text-blue-600 mr-3" role="status"></div>
                <span className="font-medium text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Cargando dashboard...</span>
            </div>
        );
    }

    // Calcular tareas finalizadas para empleados
    const finalizadasCount = estados.find(e => e.nombre === 'Finalizado' || e.nombre === 'Completada')?.cantidad || 0;

    return (
        <div className="py-1 sm:py-4 px-0 sm:px-2 max-w-7xl mx-auto space-y-5 sm:space-y-6">
            {/* Encabezado con Filtro de Alcance/Usuario */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight m-0" style={{ color: 'var(--text-primary)' }}>
                            Bienvenido, {user?.nombre || 'Usuario'}
                        </h1>
                        {!isAdmin && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                                <i className="bi bi-person-fill"></i> Mis tareas
                            </span>
                        )}
                    </div>
                    <p className="text-xs sm:text-sm mt-1 mb-0" style={{ color: 'var(--text-secondary)' }}>
                        {isAdmin 
                            ? 'Métricas analíticas consolidadas y estado operativo del sistema.'
                            : 'Resumen actualizado de tus tareas registradas y actividad reciente.'}
                    </p>
                </div>

                {/* Filtro de Alcance / Usuario (Solo Administrador) */}
                {isAdmin && (
                    <div 
                        className="w-full lg:w-auto flex flex-wrap items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl border"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}
                    >
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs"
                            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                        >
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
                                className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                <option value="todos">Todas las tareas</option>
                                <option value="mis_tareas">Mis tareas creadas</option>
                                <option value="otros">Tareas de otros</option>
                                <option value="usuario_especifico">Buscar por usuario...</option>
                            </select>
                        </div>

                        {/* Selector de Usuario Específico */}
                        {filtroAlcance === 'usuario_especifico' && (
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs animate-fade-in"
                                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                            >
                                <i className="bi bi-person-badge text-blue-500 text-xs"></i>
                                <select
                                    value={filtroUsuarioId}
                                    onChange={e => setFiltroUsuarioId(e.target.value)}
                                    className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer max-w-[200px]"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    <option value="">Selecciona un usuario...</option>
                                    {(Array.isArray(usuariosList) ? usuariosList : []).map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.persona_nombre ? `${u.persona_nombre} ${u.persona_apellido}` : u.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Grid Superior de Métricas */}
            <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {/* Card 1: Total Tareas */}
                <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20 flex flex-col justify-between min-h-[120px] sm:min-h-[140px] relative overflow-hidden">
                    <div className="flex justify-center items-center gap-1.5 opacity-90">
                        <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">
                            {isAdmin 
                                ? (filtroAlcance === 'mis_tareas' ? 'Mis Tareas' : filtroAlcance === 'otros' ? 'Tareas de Otros' : filtroUsuarioId ? 'Tareas de Usuario' : 'Total Tareas')
                                : 'Mis Tareas'}
                        </span>
                        <i className="bi bi-clipboard2-check text-base sm:text-xl"></i>
                    </div>
                    <div className="flex-1 flex items-center justify-center py-1 sm:py-2">
                        <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold m-0 text-center ${isUpdating ? 'animate-pulse' : ''}`}>{total}</h2>
                    </div>
                </div>

                {/* Card 2: Active Users (Admin) o Tareas Finalizadas (Empleado) */}
                {isAdmin ? (
                    <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 flex flex-col justify-between min-h-[120px] sm:min-h-[140px] relative overflow-hidden">
                        <div className="flex justify-center items-center gap-1.5 opacity-90">
                            <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">Usuarios Activos</span>
                            <i className="bi bi-people text-base sm:text-xl"></i>
                        </div>
                        <div className="flex-1 flex items-center justify-center py-1 sm:py-2">
                            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold m-0 text-center ${isUpdating ? 'animate-pulse' : ''}`}>{totalUsuarios}</h2>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 flex flex-col justify-between min-h-[120px] sm:min-h-[140px] relative overflow-hidden">
                        <div className="flex justify-center items-center gap-1.5 opacity-90">
                            <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">Tareas Finalizadas</span>
                            <i className="bi bi-check-circle-fill text-base sm:text-xl"></i>
                        </div>
                        <div className="flex-1 flex items-center justify-center py-1 sm:py-2">
                            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold m-0 text-center ${isUpdating ? 'animate-pulse' : ''}`}>{finalizadasCount}</h2>
                        </div>
                    </div>
                )}

                {/* Card 3: Recent Activity */}
                <div className="card-app p-4 sm:p-5 flex flex-col justify-between min-h-[120px] sm:min-h-[140px] col-span-1 sm:col-span-2 lg:col-span-1">
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                        <h3 className="text-xs sm:text-sm font-bold tracking-wide uppercase m-0" style={{ color: 'var(--text-primary)' }}>
                            Actividad reciente
                        </h3>
                        <i className="bi bi-activity text-blue-500 text-base sm:text-lg"></i>
                    </div>
                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                        {actividadReciente.length > 0 ? (
                            actividadReciente.slice(0, 3).map((mov, index) => (
                                <div key={mov.id || index} className="flex items-start gap-2 text-xs">
                                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getActionColor(mov.tipo_accion)}`}></span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate m-0 text-xs" style={{ color: 'var(--text-primary)' }}>{getActionText(mov)}</p>
                                        <span className="text-[10px] sm:text-[11px]" style={{ color: 'var(--text-secondary)' }}>{getTimeAgo(mov.created_at)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs m-0" style={{ color: 'var(--text-secondary)' }}>No hay actividad reciente.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid Gráficas y Métricas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Tareas por Estado */}
                <div className="card-app p-4 sm:p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 m-0" style={{ color: 'var(--text-primary)' }}>
                            <i className="bi bi-pie-chart-fill text-blue-600 dark:text-blue-400"></i>
                            <span>Tareas por Estado</span>
                        </h3>
                        <span className="text-xs px-2.5 py-0.5 sm:py-1 rounded-full font-semibold border" style={{ backgroundColor: 'var(--track-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                            Total: <strong>{total}</strong>
                        </span>
                    </div>

                    <div className="space-y-3 sm:space-y-4 py-1 sm:py-2">
                        {estados.map(estado => {
                            const p = total > 0 ? parseFloat(((estado.cantidad / total) * 100).toFixed(1)) : 0;
                            const color = estadoColors[estado.nombre] || '#cbd5e1';
                            return (
                                <div key={estado.nombre} className="space-y-1.5 p-2 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                    <div className="flex justify-between text-xs sm:text-sm font-semibold">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }}></span>
                                            <span className="truncate font-bold" style={{ color: 'var(--text-primary)' }}>{estado.nombre}</span>
                                        </div>
                                        <span className="shrink-0 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                            <strong className="text-sm" style={{ color: 'var(--text-primary)' }}>{estado.cantidad}</strong> ({p}%)
                                        </span>
                                    </div>
                                    {/* Track con fondo visible y contraste en ambos modos */}
                                    <div
                                        className="w-full h-3 rounded-full overflow-hidden border"
                                        style={{ backgroundColor: 'var(--track-bg)', borderColor: 'var(--border-color)' }}
                                    >
                                        <div
                                            className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                                            style={{ width: `${p}%`, backgroundColor: color }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tareas por Prioridad */}
                <div className="card-app p-4 sm:p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 m-0" style={{ color: 'var(--text-primary)' }}>
                            <i className="bi bi-layers-fill text-amber-500"></i>
                            <span>Tareas por Prioridad</span>
                        </h3>
                        <span className="text-xs px-2.5 py-0.5 sm:py-1 rounded-full font-semibold border" style={{ backgroundColor: 'var(--track-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                            Niveles de urgencia
                        </span>
                    </div>

                    <div className="space-y-3 sm:space-y-4 py-1 sm:py-2">
                        {prioridades.map(prioridad => {
                            const p = total > 0 ? parseFloat(((prioridad.cantidad / total) * 100).toFixed(1)) : 0;
                            const color = prioridadColors[prioridad.nombre] || '#cbd5e1';
                            return (
                                <div key={prioridad.nombre} className="space-y-1.5 p-2 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                    <div className="flex justify-between text-xs sm:text-sm font-semibold">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }}></span>
                                            <span className="truncate font-bold" style={{ color: 'var(--text-primary)' }}>{prioridad.nombre}</span>
                                        </div>
                                        <span className="shrink-0 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                            <strong className="text-sm" style={{ color: 'var(--text-primary)' }}>{prioridad.cantidad}</strong> ({p}%)
                                        </span>
                                    </div>
                                    {/* Track con fondo visible y contraste en ambos modos */}
                                    <div
                                        className="w-full h-3 rounded-full overflow-hidden border"
                                        style={{ backgroundColor: 'var(--track-bg)', borderColor: 'var(--border-color)' }}
                                    >
                                        <div
                                            className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                                            style={{ width: `${p}%`, backgroundColor: color }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
