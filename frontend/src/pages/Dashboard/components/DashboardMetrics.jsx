import PropTypes from 'prop-types';

export default function DashboardMetrics({
    total,
    enProgresoCount,
    finalizadasCount,
    completionRate,
    totalUsuarios,
    isAdmin,
    isUpdating,
    filtroAlcance,
    filtroUsuarioId
}) {
    return (
        <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
    );
}

DashboardMetrics.propTypes = {
    total: PropTypes.number.isRequired,
    enProgresoCount: PropTypes.number.isRequired,
    finalizadasCount: PropTypes.number.isRequired,
    completionRate: PropTypes.number.isRequired,
    totalUsuarios: PropTypes.number,
    isAdmin: PropTypes.bool,
    isUpdating: PropTypes.bool,
    filtroAlcance: PropTypes.string,
    filtroUsuarioId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
