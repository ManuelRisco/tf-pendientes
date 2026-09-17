import PropTypes from 'prop-types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, LabelList, AreaChart, Area
} from 'recharts';
import { formatDate } from '../../../lib/dateUtils';

// Tooltip para los gráficos de barras (Estado y Prioridad)
const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const item = payload[0].payload;
        return (
            <div
                className="p-3 rounded-xl border shadow-xl text-xs space-y-2 min-w-[185px] transition-all duration-150"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    boxShadow: 'var(--card-shadow)',
                    color: 'var(--text-primary)'
                }}
            >
                <div className="flex items-center gap-2 font-bold pb-1.5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-sm">{label}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span>Cantidad exacta:</span>
                    <strong className="text-xs font-black text-blue-600 dark:text-blue-400">
                        {item.valor} {item.valor === 1 ? 'ticket' : 'tickets'}
                    </strong>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span>Participación:</span>
                    <span className="font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px]">
                        {item.porcentaje}% del total
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

CustomBarTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.string
};

// Tooltip para el gráfico de área (tendencia temporal)
const CustomAreaTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const item = payload[0]?.payload || {};
        return (
            <div
                className="p-3 rounded-xl border shadow-lg text-xs space-y-2 min-w-[190px]"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    boxShadow: 'var(--card-shadow)',
                    color: 'var(--text-primary)'
                }}
            >
                <div className="font-bold pb-1 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Fecha:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{formatDate(label)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                        Creados:
                    </span>
                    <strong className="text-blue-600 dark:text-blue-400 font-bold">{item.creados || 0}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        Resueltos:
                    </span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{item.resueltos || 0}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                        Pendientes:
                    </span>
                    <strong className="text-amber-600 dark:text-amber-400 font-bold">{item.pendientes || 0}</strong>
                </div>
            </div>
        );
    }
    return null;
};

CustomAreaTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.string
};

// Etiqueta sobre cada barra
const renderCustomBarLabel = (props) => {
    const { x, y, width, value } = props;
    if (value === undefined || value === null || value === '0') return null;
    return (
        <text
            x={x + width / 2}
            y={y - 8}
            fill="var(--text-primary)"
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
        >
            {value}
        </text>
    );
};

export default function ReportesCharts({
    datosTendenciaGrafico,
    totalTicketsGeneral,
    estadisticasTendencia,
    vistaTendencia,
    setVistaTendencia,
    tickInterval,
    formatTickDate,
    dataEstados,
    dataPrioridades
}) {
    return (
        <div className="space-y-6">
            {/* 1. Mapeo Temporal: Tendencia en el Tiempo */}
            <div className="card-app p-4 sm:p-6 min-h-[380px] flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                                Mapeo Temporal: Tendencia en el Tiempo
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                                {estadisticasTendencia.diasActivos} {estadisticasTendencia.diasActivos === 1 ? 'día con actividad' : 'días con actividad'}
                            </span>
                        </div>
                        <p className="text-xs mt-1 mb-0 opacity-70" style={{ color: 'var(--text-secondary)' }}>
                            Seguimiento intuitivo de tickets creados frente a resueltos por fecha.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        <div
                            className="inline-flex p-0.5 rounded-xl border text-xs font-semibold"
                            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                        >
                            <button
                                onClick={() => setVistaTendencia('activos')}
                                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 ${vistaTendencia === 'activos'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'opacity-70 hover:opacity-100'
                                    }`}
                                style={{ color: vistaTendencia === 'activos' ? '#fff' : 'var(--text-primary)' }}
                            >
                                Días con tickets
                            </button>
                            <button
                                onClick={() => setVistaTendencia('todos')}
                                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 ${vistaTendencia === 'todos'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'opacity-70 hover:opacity-100'
                                    }`}
                                style={{ color: vistaTendencia === 'todos' ? '#fff' : 'var(--text-primary)' }}
                            >
                                Período completo
                            </button>
                        </div>

                        <div className="flex items-center gap-3 pl-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                <span>Creados</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span>Resueltos</span>
                            </div>
                        </div>
                    </div>
                </div>

                {estadisticasTendencia.diasActivos > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                        <div
                            className="px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5"
                            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                        >
                            <i className="bi bi-calendar-check text-blue-500"></i>
                            <span style={{ color: 'var(--text-secondary)' }}>Días con movimiento:</span>
                            <strong style={{ color: 'var(--text-primary)' }}>{estadisticasTendencia.diasActivos}</strong>
                        </div>
                        {estadisticasTendencia.maxPico > 0 && (
                            <div
                                className="px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5"
                                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                            >
                                <i className="bi bi-graph-up-arrow text-emerald-500"></i>
                                <span style={{ color: 'var(--text-secondary)' }}>Día con más registros:</span>
                                <strong style={{ color: 'var(--text-primary)' }}>
                                    {formatDate(estadisticasTendencia.fechaPico)} ({estadisticasTendencia.maxPico} tickets)
                                </strong>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex-1 min-h-[250px]">
                    {datosTendenciaGrafico.length > 0 && totalTicketsGeneral > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={datosTendenciaGrafico} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorCreados" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="colorResueltos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.6} />
                                <XAxis
                                    dataKey="fecha"
                                    stroke="var(--text-secondary)"
                                    interval={tickInterval}
                                    minTickGap={35}
                                    tickFormatter={formatTickDate}
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                                />
                                <YAxis
                                    stroke="var(--text-secondary)"
                                    allowDecimals={false}
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                                />
                                <Tooltip content={<CustomAreaTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="creados"
                                    stroke="#3b82f6"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorCreados)"
                                    name="Tickets Creados"
                                    dot={datosTendenciaGrafico.length > 20 ? false : { r: 3, fill: '#3b82f6' }}
                                    activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                                    isAnimationActive={false}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="resueltos"
                                    stroke="#10b981"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorResueltos)"
                                    name="Tickets Resueltos"
                                    dot={datosTendenciaGrafico.length > 20 ? false : { r: 3, fill: '#10b981' }}
                                    activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6" style={{ color: 'var(--text-secondary)' }}>
                            <i className="bi bi-graph-up text-3xl mb-2 opacity-40"></i>
                            <p className="text-sm font-medium m-0">No se registran movimientos en el rango de fechas seleccionado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 2 & 3. Estado de Tickets y Distribución por Prioridad */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-app p-4 sm:p-6 min-h-[420px] flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base sm:text-lg font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                            Estado de Tickets
                        </h3>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Flujo de atención
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
                        {dataEstados.map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium"
                                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                            >
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                                <span style={{ color: 'var(--text-secondary)' }}>{item.name}:</span>
                                <strong style={{ color: 'var(--text-primary)' }}>{item.valor}</strong>
                                <span className="text-[10px] opacity-75">({item.porcentaje}%)</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 min-h-0">
                        {totalTicketsGeneral > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataEstados} margin={{ top: 25, right: 15, left: -15, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.6} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="var(--text-secondary)"
                                        tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
                                    />
                                    <YAxis
                                        stroke="var(--text-secondary)"
                                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                        allowDecimals={false}
                                        domain={[0, (dataMax) => (dataMax <= 0 ? 4 : Math.ceil(dataMax * 1.3))]}
                                    />
                                    <Tooltip
                                        content={<CustomBarTooltip />}
                                        cursor={{ fill: 'var(--border-color)', opacity: 0.15, radius: 8 }}
                                        animationDuration={200}
                                        isAnimationActive={true}
                                    />
                                    <Bar
                                        dataKey="valor"
                                        radius={[8, 8, 0, 0]}
                                        maxBarSize={52}
                                        isAnimationActive={true}
                                        animationDuration={500}
                                        animationEasing="ease-out"
                                        activeBar={{
                                            stroke: 'var(--text-primary)',
                                            strokeWidth: 1.5,
                                            strokeOpacity: 0.4,
                                            fillOpacity: 0.88,
                                        }}
                                    >
                                        <LabelList dataKey="displayLabel" content={renderCustomBarLabel} />
                                        {dataEstados.map((entry, index) => (
                                            <Cell key={`bar-estado-cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6" style={{ color: 'var(--text-secondary)' }}>
                                <i className="bi bi-bar-chart text-4xl mb-3 opacity-30"></i>
                                <p className="text-sm font-medium">No hay datos disponibles para el rango de fechas seleccionado.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card-app p-4 sm:p-6 min-h-[420px] flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base sm:text-lg font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                            Distribución por Prioridad
                        </h3>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Nivel de urgencia
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
                        {dataPrioridades.map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium"
                                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                            >
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                                <span style={{ color: 'var(--text-secondary)' }}>{item.name}:</span>
                                <strong style={{ color: 'var(--text-primary)' }}>{item.valor}</strong>
                                <span className="text-[10px] opacity-75">({item.porcentaje}%)</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 min-h-0">
                        {totalTicketsGeneral > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataPrioridades} margin={{ top: 25, right: 15, left: -15, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.6} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="var(--text-secondary)"
                                        tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
                                    />
                                    <YAxis
                                        stroke="var(--text-secondary)"
                                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                        allowDecimals={false}
                                        domain={[0, (dataMax) => (dataMax <= 0 ? 4 : Math.ceil(dataMax * 1.3))]}
                                    />
                                    <Tooltip
                                        content={<CustomBarTooltip />}
                                        cursor={{ fill: 'var(--border-color)', opacity: 0.15, radius: 8 }}
                                        animationDuration={200}
                                        isAnimationActive={true}
                                    />
                                    <Bar
                                        dataKey="valor"
                                        radius={[8, 8, 0, 0]}
                                        maxBarSize={52}
                                        isAnimationActive={true}
                                        animationDuration={500}
                                        animationEasing="ease-out"
                                        activeBar={{
                                            stroke: 'var(--text-primary)',
                                            strokeWidth: 1.5,
                                            strokeOpacity: 0.4,
                                            fillOpacity: 0.88,
                                        }}
                                    >
                                        <LabelList dataKey="displayLabel" content={renderCustomBarLabel} />
                                        {dataPrioridades.map((entry, index) => (
                                            <Cell key={`bar-prioridad-cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6" style={{ color: 'var(--text-secondary)' }}>
                                <i className="bi bi-bar-chart-steps text-4xl mb-3 opacity-30"></i>
                                <p className="text-sm font-medium">No hay datos disponibles para el rango de fechas seleccionado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

ReportesCharts.propTypes = {
    datosTendenciaGrafico: PropTypes.array.isRequired,
    totalTicketsGeneral: PropTypes.number.isRequired,
    estadisticasTendencia: PropTypes.shape({
        diasActivos: PropTypes.number.isRequired,
        maxPico: PropTypes.number.isRequired,
        fechaPico: PropTypes.string
    }).isRequired,
    vistaTendencia: PropTypes.string.isRequired,
    setVistaTendencia: PropTypes.func.isRequired,
    tickInterval: PropTypes.number.isRequired,
    formatTickDate: PropTypes.func.isRequired,
    dataEstados: PropTypes.array.isRequired,
    dataPrioridades: PropTypes.array.isRequired
};
