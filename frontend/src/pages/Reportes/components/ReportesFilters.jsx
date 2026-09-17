import PropTypes from 'prop-types';
import DateInput from '../../../components/Common/DateInput';
import { formatDate } from '../../../lib/dateUtils';

export default function ReportesFilters({
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    fechasAplicadas,
    maxDate,
    cargarReportes,
    loading,
    hayCambiosPendientes,
    handleExportarExcel,
    exportandoExcel,
    totalTicketsGeneral
}) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight m-0" style={{ color: 'var(--text-primary)' }}>
                        Reportes y Mapeo Operativo
                    </h1>
                    <span className="text-xs font-normal opacity-75" style={{ color: 'var(--text-secondary)' }}>
                        (Período: {formatDate(fechasAplicadas.inicio)} al {formatDate(fechasAplicadas.fin)})
                    </span>
                </div>
                <p className="text-xs sm:text-sm mt-1 mb-0 opacity-80" style={{ color: 'var(--text-secondary)' }}>
                    Panel consolidado para el seguimiento de tickets, demanda de usuarios y nivel de atención.
                </p>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-2.5 sm:p-3 rounded-2xl border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}
                >
                    <div className="flex items-center gap-2">
                        <label className="text-xs sm:text-sm font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>
                            Desde:
                        </label>
                        <DateInput
                            value={fechaInicio}
                            max={maxDate}
                            onChange={(e) => setFechaInicio(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs sm:text-sm font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>
                            Hasta:
                        </label>
                        <DateInput
                            value={fechaFin}
                            max={maxDate}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={cargarReportes}
                        disabled={loading}
                        className={`px-4 py-2 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-w-[95px] active:scale-95 ${hayCambiosPendientes
                            ? 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-400/60 shadow-blue-500/30 font-bold'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                            } disabled:opacity-75`}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Buscando...</span>
                            </>
                        ) : (
                            <>
                                <i className="bi bi-search"></i>
                                <span>Buscar</span>
                            </>
                        )}
                    </button>
                </div>

                <button
                    onClick={handleExportarExcel}
                    disabled={loading || exportandoExcel || totalTicketsGeneral === 0}
                    title="Exportar reporte consolidado a Excel con gráficos y formato"
                    className="px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 hover:bg-slate-500/10 active:scale-95"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                    }}
                >
                    {exportandoExcel ? (
                        <>
                            <span className="spinner-border spinner-border-sm text-emerald-500" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}></span>
                            <span>Generando Excel...</span>
                        </>
                    ) : (
                        <>
                            <i className="bi bi-file-earmark-excel-fill text-emerald-600 dark:text-emerald-400 text-sm"></i>
                            <span>Exportar Excel</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

ReportesFilters.propTypes = {
    fechaInicio: PropTypes.string.isRequired,
    setFechaInicio: PropTypes.func.isRequired,
    fechaFin: PropTypes.string.isRequired,
    setFechaFin: PropTypes.func.isRequired,
    fechasAplicadas: PropTypes.shape({
        inicio: PropTypes.string,
        fin: PropTypes.string
    }).isRequired,
    maxDate: PropTypes.string.isRequired,
    cargarReportes: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    hayCambiosPendientes: PropTypes.bool.isRequired,
    handleExportarExcel: PropTypes.func.isRequired,
    exportandoExcel: PropTypes.bool.isRequired,
    totalTicketsGeneral: PropTypes.number.isRequired
};
