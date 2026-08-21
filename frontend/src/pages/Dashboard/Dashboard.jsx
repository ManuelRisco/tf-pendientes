import { useDashboard } from "./useDashboard";
import ActividadReciente from "./components/ActividadReciente";

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
        refreshDashboard
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

    // Calcular tareas finalizadas y en progreso
    const finalizadasCount = estados.find(e => e.nombre === 'Finalizado' || e.nombre === 'Completada')?.cantidad || 0;
    const enProgresoCount = Math.max(0, total - finalizadasCount);
    const completionRate = total > 0 ? Math.round((finalizadasCount / total) * 100) : 0;

    return (
        <div className="py-1 sm:py-4 px-0 sm:px-2 max-w-7xl mx-auto space-y-5 sm:space-y-6">
            {/* Encabezado con Filtro de Alcance/Usuario */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight m-0" style={{ color: 'var(--text-primary)' }}>
                            Bienvenido, {user?.nombre || 'Usuario'}, {user?.apellido || 'Apellido'}
                        </h1>
                        {!isAdmin && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                                <i className="bi bi-person-fill"></i> Mis tareas
                            </span>
                        )}
                    </div>
                    <p className="text-xs sm:text-sm mt-1 mb-0" style={{ color: 'var(--text-secondary)' }}>
                        {isAdmin
                            ? 'Métricas consolidadas, auditoría de cambios.'
                            : 'Resumen actualizado de tus inconvenientes.'}
                    </p>
                </div>

                {/* Filtro de Alcance / Usuario (Solo Administrador) */}
                {isAdmin && (
                    <div
                        className="w-full lg:w-auto flex flex-wrap items-center gap-2 p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800"
                        style={{ backgroundColor: 'var(--bg-secondary)', boxShadow: 'var(--card-shadow)' }}
                    >
                        {/* Selector de Alcance */}
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

                        {/* Selector de Usuario Específico */}
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

            {/* Grid Superior de 4 Métricas KPI */}
            <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Card 1: Total Tareas */}
                <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 text-white shadow-lg shadow-indigo-500/20 flex flex-col justify-between min-h-[115px] relative overflow-hidden group hover:scale-[1.01] transition-transform">
                    <div className="flex justify-between items-center opacity-90">
                        <span className="text-xs font-bold tracking-wide uppercase">
                            {isAdmin
                                ? (filtroAlcance === 'mis_tareas' ? 'Mis Tareas' : filtroAlcance === 'otros' ? 'Tareas de Otros' : filtroUsuarioId ? 'Tareas de Usuario' : 'Total Tareas')
                                : 'Mis Tareas'}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                            <i className="bi bi-clipboard2-check-fill text-base"></i>
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                        <h2 className={`text-3xl sm:text-4xl font-extrabold m-0 ${isUpdating ? 'animate-pulse' : ''}`}>{total}</h2>
                        <span className="text-[11px] opacity-80 font-medium">Registradas</span>
                    </div>
                </div>

                {/* Card 2: En Progreso / Pendientes */}
                <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-amber-500 via-orange-600 to-amber-600 text-white shadow-lg shadow-orange-500/20 flex flex-col justify-between min-h-[115px] relative overflow-hidden group hover:scale-[1.01] transition-transform">
                    <div className="flex justify-between items-center opacity-90">
                        <span className="text-xs font-bold tracking-wide uppercase">En Progreso</span>
                        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                            <i className="bi bi-hourglass-split text-base"></i>
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                        <h2 className={`text-3xl sm:text-4xl font-extrabold m-0 ${isUpdating ? 'animate-pulse' : ''}`}>{enProgresoCount}</h2>
                        <span className="text-[11px] opacity-80 font-medium">Pendientes</span>
                    </div>
                </div>

                {/* Card 3: Finalizadas */}
                <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-lg shadow-emerald-500/20 flex flex-col justify-between min-h-[115px] relative overflow-hidden group hover:scale-[1.01] transition-transform">
                    <div className="flex justify-between items-center opacity-90">
                        <span className="text-xs font-bold tracking-wide uppercase">Finalizadas</span>
                        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                            <i className="bi bi-check2-circle text-base"></i>
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                        <h2 className={`text-3xl sm:text-4xl font-extrabold m-0 ${isUpdating ? 'animate-pulse' : ''}`}>{finalizadasCount}</h2>
                        <span className="text-[11px] opacity-90 font-semibold px-2 py-0.5 rounded-full bg-white/20">
                            {completionRate}% resuelto
                        </span>
                    </div>
                </div>

                {/* Card 4: Usuarios Activos (Admin) o Efectividad (Empleado) */}
                {isAdmin ? (
                    <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white shadow-lg shadow-purple-500/20 flex flex-col justify-between min-h-[115px] relative overflow-hidden group hover:scale-[1.01] transition-transform">
                        <div className="flex justify-between items-center opacity-90">
                            <span className="text-xs font-bold tracking-wide uppercase">Usuarios Activos</span>
                            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                                <i className="bi bi-people-fill text-base"></i>
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <h2 className={`text-3xl sm:text-4xl font-extrabold m-0 ${isUpdating ? 'animate-pulse' : ''}`}>{totalUsuarios}</h2>
                            <span className="text-[11px] opacity-80 font-medium">En el sistema</span>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white shadow-lg shadow-cyan-500/20 flex flex-col justify-between min-h-[115px] relative overflow-hidden group hover:scale-[1.01] transition-transform">
                        <div className="flex justify-between items-center opacity-90">
                            <span className="text-xs font-bold tracking-wide uppercase">Efectividad</span>
                            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                                <i className="bi bi-award-fill text-base"></i>
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <h2 className={`text-3xl sm:text-4xl font-extrabold m-0 ${isUpdating ? 'animate-pulse' : ''}`}>{completionRate}%</h2>
                            <span className="text-[11px] opacity-80 font-medium">Cumplimiento</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Layout Principal: Actividad Reciente (Col 7) + Métricas y Distribución (Col 5) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

                {/* Columna Izquierda: Tareas por Estado y Prioridad (5 Columnas en Desktop) */}
                <div className="lg:col-span-5 xl:col-span-5 space-y-5 sm:space-y-6">
                    {/* Tareas por Estado */}
                    <div className="card-app p-4 sm:p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4 sm:mb-5 pb-2.5 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 m-0 text-slate-900 dark:text-slate-100">
                                <i className="bi bi-pie-chart-fill text-blue-600 dark:text-blue-400"></i>
                                <span>Tareas por Estado</span>
                            </h3>
                        </div>

                        <div className="space-y-3 py-1">
                            {estados.map(estado => {
                                const p = total > 0 ? parseFloat(((estado.cantidad / total) * 100).toFixed(1)) : 0;
                                const color = estadoColors[estado.nombre] || '#cbd5e1';
                                return (
                                    <div key={estado.nombre} className="space-y-1.5 p-2 rounded-xl transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/40">
                                        <div className="flex justify-between text-xs sm:text-sm font-semibold">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }}></span>
                                                <span className="truncate font-bold text-slate-800 dark:text-slate-200">{estado.nombre}</span>
                                            </div>
                                            <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                <strong className="text-sm text-slate-800 dark:text-slate-100">{estado.cantidad}</strong> ({p}%)
                                            </span>
                                        </div>
                                        {/* Track suave sin bordes blancos */}
                                        <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-200/80 dark:bg-slate-800/80">
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
                        <div className="flex items-center justify-between mb-4 sm:mb-5 pb-2.5 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 m-0 text-slate-900 dark:text-slate-100">
                                <i className="bi bi-layers-fill text-amber-500"></i>
                                <span>Tareas por Prioridad</span>
                            </h3>
                        </div>

                        <div className="space-y-3 py-1">
                            {prioridades.map(prioridad => {
                                const p = total > 0 ? parseFloat(((prioridad.cantidad / total) * 100).toFixed(1)) : 0;
                                const color = prioridadColors[prioridad.nombre] || '#cbd5e1';
                                return (
                                    <div key={prioridad.nombre} className="space-y-1.5 p-2 rounded-xl transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/40">
                                        <div className="flex justify-between text-xs sm:text-sm font-semibold">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }}></span>
                                                <span className="truncate font-bold text-slate-800 dark:text-slate-200">{prioridad.nombre}</span>
                                            </div>
                                            <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                <strong className="text-sm text-slate-800 dark:text-slate-100">{prioridad.cantidad}</strong> ({p}%)
                                            </span>
                                        </div>
                                        {/* Track suave sin bordes blancos */}
                                        <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-200/80 dark:bg-slate-800/80">
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

                {/* Columna Derecha: Actividad Reciente del Sistema (7 Columnas en Desktop) */}
                <div className="lg:col-span-7 xl:col-span-7">
                    <ActividadReciente
                        actividadReciente={actividadReciente}
                        isUpdating={isUpdating}
                        onRefresh={refreshDashboard}
                        getTimeAgo={getTimeAgo}
                        isAdmin={isAdmin}
                    />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

