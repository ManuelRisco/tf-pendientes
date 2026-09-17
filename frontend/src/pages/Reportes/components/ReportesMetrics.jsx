import PropTypes from 'prop-types';

export default function ReportesMetrics({
    resumen,
    totalTicketsGeneral,
    resueltosCount,
    totalPendientes,
    tasaResolucion,
    tasaPendientes,
    tiempoPromedioTexto,
    porcentajeFotos,
    totalCriticosAbiertos
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Grupo 1: Flujo de Tickets */}
            <div className="card-app p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
                            <i className="bi bi-ticket-detailed-fill"></i>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>Flujo de Tickets</h4>
                            <span className="text-[11px] opacity-70" style={{ color: 'var(--text-secondary)' }}>Volumen en el período</span>
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                        {totalTicketsGeneral}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 text-center">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">Resueltos</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{resueltosCount}</span>
                        <span className="text-[10px] opacity-75 block text-emerald-600/80 dark:text-emerald-400/80">({tasaResolucion}%)</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 block">Pendientes</span>
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400">{totalPendientes}</span>
                        <span className="text-[10px] opacity-75 block text-amber-600/80 dark:text-amber-400/80">({tasaPendientes}%)</span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 block">Tasa Cierre</span>
                        <span className="text-sm font-black text-purple-600 dark:text-purple-400">{tasaResolucion}%</span>
                        <span className="text-[10px] opacity-75 block text-purple-600/80 dark:text-purple-400/80">Efectividad</span>
                    </div>
                </div>
            </div>

            {/* Grupo 2: Rendimiento y Tiempos */}
            <div className="card-app p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-sm">
                            <i className="bi bi-speedometer2"></i>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>Rendimiento y Tiempos</h4>
                            <span className="text-[11px] opacity-70" style={{ color: 'var(--text-secondary)' }}>Velocidad y calidad técnica</span>
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
                        {tiempoPromedioTexto}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 text-center">
                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 block">Cobertura Soporte</span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{resumen?.cobertura_respuesta || 0}%</span>
                        <span className="text-[10px] opacity-75 block text-indigo-600/80 dark:text-indigo-400/80">{resumen?.con_respuesta || 0} con respuesta</span>
                    </div>
                    <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
                        <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 block">Con Evidencia</span>
                        <span className="text-sm font-black text-teal-600 dark:text-teal-400">{resumen?.con_imagenes || 0}</span>
                        <span className="text-[10px] opacity-75 block text-teal-600/80 dark:text-teal-400/80">({porcentajeFotos}%) fotos</span>
                    </div>
                </div>
            </div>

            {/* Grupo 3: Urgencias y Críticos */}
            <div className="card-app p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${totalCriticosAbiertos > 0
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            }`}>
                            <i className="bi bi-exclamation-triangle-fill"></i>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>Casos Urgentes Abiertos</h4>
                            <span className="text-[11px] opacity-70" style={{ color: 'var(--text-secondary)' }}>Prioridad Alta o Crítica</span>
                        </div>
                    </div>
                    <div className={`text-2xl font-extrabold ${totalCriticosAbiertos > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                        {totalCriticosAbiertos}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 text-center">
                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 block">Prioridad Crítica</span>
                        <span className="text-sm font-black text-purple-600 dark:text-purple-400">{resumen?.prioridad_critica || 0}</span>
                        <span className="text-[10px] opacity-75 block text-purple-600/80 dark:text-purple-400/80">Urgencia máxima</span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 block">Prioridad Alta</span>
                        <span className="text-sm font-black text-rose-600 dark:text-rose-400">{resumen?.prioridad_alta || 0}</span>
                        <span className="text-[10px] opacity-75 block text-rose-600/80 dark:text-rose-400/80">Atención rápida</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

ReportesMetrics.propTypes = {
    resumen: PropTypes.object,
    totalTicketsGeneral: PropTypes.number.isRequired,
    resueltosCount: PropTypes.number.isRequired,
    totalPendientes: PropTypes.number.isRequired,
    tasaResolucion: PropTypes.number.isRequired,
    tasaPendientes: PropTypes.number.isRequired,
    tiempoPromedioTexto: PropTypes.string.isRequired,
    porcentajeFotos: PropTypes.number.isRequired,
    totalCriticosAbiertos: PropTypes.number.isRequired
};
