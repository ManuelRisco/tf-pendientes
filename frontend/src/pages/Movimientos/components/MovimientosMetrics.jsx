import PropTypes from 'prop-types';

export default function MovimientosMetrics({ metrics }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="p-3 rounded-xl border flex items-center gap-3" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg shrink-0 border border-blue-200 dark:border-blue-900/40">
                    <i className="bi bi-database-fill"></i>
                </div>
                <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-slate-400 block truncate">Total Registros</span>
                    <span className="text-base sm:text-lg font-black" style={{ color: 'var(--text-primary)' }}>{metrics?.total ?? 0}</span>
                </div>
            </div>

            <div className="p-3 rounded-xl border flex items-center gap-3" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shrink-0 border border-indigo-200 dark:border-indigo-900/40">
                    <i className="bi bi-clipboard-check-fill"></i>
                </div>
                <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-slate-400 block truncate">En Tareas</span>
                    <span className="text-base sm:text-lg font-black" style={{ color: 'var(--text-primary)' }}>{metrics?.tareas ?? 0}</span>
                </div>
            </div>

            <div className="p-3 rounded-xl border flex items-center gap-3" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg shrink-0 border border-purple-200 dark:border-purple-900/40">
                    <i className="bi bi-people-fill"></i>
                </div>
                <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-slate-400 block truncate">En Usuarios</span>
                    <span className="text-base sm:text-lg font-black" style={{ color: 'var(--text-primary)' }}>{metrics?.usuarios ?? 0}</span>
                </div>
            </div>

            <div className="p-3 rounded-xl border flex items-center gap-3" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shrink-0 border border-emerald-200 dark:border-emerald-900/40">
                    <i className="bi bi-lightning-charge-fill"></i>
                </div>
                <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-slate-400 block truncate">Registrados Hoy</span>
                    <span className="text-base sm:text-lg font-black" style={{ color: 'var(--text-primary)' }}>{metrics?.hoy ?? 0}</span>
                </div>
            </div>
        </div>
    );
}

MovimientosMetrics.propTypes = {
    metrics: PropTypes.shape({
        total: PropTypes.number,
        tareas: PropTypes.number,
        usuarios: PropTypes.number,
        hoy: PropTypes.number
    })
};
