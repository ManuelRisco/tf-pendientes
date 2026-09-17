import PropTypes from 'prop-types';

export default function DashboardCharts({
    estados,
    prioridades,
    total,
    estadoColors,
    prioridadColors
}) {
    return (
        <div className="space-y-5 sm:space-y-6">
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
    );
}

DashboardCharts.propTypes = {
    estados: PropTypes.array.isRequired,
    prioridades: PropTypes.array.isRequired,
    total: PropTypes.number.isRequired,
    estadoColors: PropTypes.object.isRequired,
    prioridadColors: PropTypes.object.isRequired
};
