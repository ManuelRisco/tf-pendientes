import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import Swal from 'sweetalert2';
import CustomPagination from '../../components/Pagination/CustomPagination';
import DateInput from '../../components/Common/DateInput';
import { formatDate, getTodayISO, getMonthsAgoISO } from '../../lib/dateUtils';
import { ESTADO_COLORS, PRIORIDAD_COLORS } from '../../lib/themeConstants';
import * as XLSX from 'xlsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, LabelList, AreaChart, Area
} from 'recharts';

// Tooltip para el gráfico de barras
const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const item = payload[0].payload;
        return (
            <div
                className="p-3 rounded-xl border shadow-lg text-xs space-y-1.5 min-w-[170px]"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    boxShadow: 'var(--card-shadow)',
                    color: 'var(--text-primary)'
                }}
            >
                <div className="flex items-center gap-2 font-bold pb-1.5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{label}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span>Total:</span>
                    <strong className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                        {item.valor} {item.valor === 1 ? 'ticket' : 'tickets'}
                    </strong>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span>Porcentaje:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                        {item.porcentaje}% del total
                    </span>
                </div>
            </div>
        );
    }
    return null;
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

function Reportes() {
    const navigate = useNavigate();
    const maxDate = getTodayISO();
    
    const [fechaInicio, setFechaInicio] = useState(() => getMonthsAgoISO(1));
    const [fechaFin, setFechaFin] = useState(() => getTodayISO());
    const [fechasAplicadas, setFechasAplicadas] = useState(() => ({
        inicio: getMonthsAgoISO(1),
        fin: getTodayISO()
    }));
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modo de visualización para tendencia en el tiempo: 'activos' (solo días con actividad) o 'todos'
    const [vistaTendencia, setVistaTendencia] = useState('activos');

    // Filtros y paginación para Incidentes Críticos y de Alta Prioridad
    const [filtroPrioridadCriticos, setFiltroPrioridadCriticos] = useState('todas');
    const [filtroEstadoCriticos, setFiltroEstadoCriticos] = useState('todos');
    const [paginaCriticos, setPaginaCriticos] = useState(1);
    const itemsPorPaginaCriticos = 5;

    // Filtro y paginación para Demanda por Solicitante
    const [searchUsuario, setSearchUsuario] = useState('');
    const [tipoBusquedaUsuario, setTipoBusquedaUsuario] = useState('todos'); // 'todos', 'nombre', 'email'
    const [paginaUsuarios, setPaginaUsuarios] = useState(1);
    const itemsPorPaginaUsuarios = 5;

    useEffect(() => {
        cargarReportes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reiniciar paginación de críticos al cambiar filtros
    useEffect(() => {
        setPaginaCriticos(1);
    }, [filtroPrioridadCriticos, filtroEstadoCriticos]);

    // Reiniciar paginación de usuarios al buscar
    useEffect(() => {
        setPaginaUsuarios(1);
    }, [searchUsuario, tipoBusquedaUsuario]);

    const cargarReportes = async () => {
        if (fechaInicio > fechaFin) {
            Swal.fire({
                icon: 'warning',
                title: 'Rango inválido',
                text: 'La fecha "Desde" no puede ser mayor que la fecha "Hasta".',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }

        setLoading(true);
        try {
            const resResumen = await api.get(`/reportes/resumen?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
            if (resResumen.data.success) {
                setResumen(resResumen.data.data);
            }
            setFechasAplicadas({ inicio: fechaInicio, fin: fechaFin });
        } catch (error) {
            console.error('Error cargando reportes:', error);
            Swal.fire('Error', 'No se pudieron cargar los reportes.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const hayCambiosPendientes = Boolean(
        fechaInicio !== fechasAplicadas.inicio || fechaFin !== fechasAplicadas.fin
    );

    // Listados de datos del backend
    const tendenciaDiaria = useMemo(() => resumen?.tendencia_diaria || [], [resumen]);
    const mapeoUsuarios = useMemo(() => resumen?.mapeo_usuarios || [], [resumen]);
    const criticosPendientes = useMemo(() => resumen?.criticos_pendientes || [], [resumen]);

    // Totales calculados para los 3 grupos de resúmenes
    const totalTicketsGeneral = Number(resumen?.total_tickets || 0);
    const resueltosCount = Number(resumen?.resueltos || 0);
    const totalPendientes = Number(resumen?.pendientes || 0) + Number(resumen?.en_curso || 0) + Number(resumen?.en_revision || 0);
    const tasaResolucion = totalTicketsGeneral > 0 ? Math.round((resueltosCount / totalTicketsGeneral) * 100) : 0;
    const tasaPendientes = totalTicketsGeneral > 0 ? Math.round((totalPendientes / totalTicketsGeneral) * 100) : 0;

    const tiempoPromedioTexto = useMemo(() => {
        if (resumen?.tiempo_promedio_horas === null || resumen?.tiempo_promedio_horas === undefined) {
            return 'Sin datos';
        }
        const h = Number(resumen.tiempo_promedio_horas);
        if (h >= 24) {
            return `${(h / 24).toFixed(1)} días`;
        }
        return `${h} hrs`;
    }, [resumen]);

    const porcentajeFotos = totalTicketsGeneral > 0 
        ? Math.round((Number(resumen?.con_imagenes || 0) / totalTicketsGeneral) * 100) 
        : 0;

    const totalCriticosAbiertos = Number(resumen?.criticos_abiertos || 0);

    // Filtrar datos para la tendencia temporal
    const datosTendenciaGrafico = useMemo(() => {
        if (vistaTendencia === 'activos') {
            const activos = tendenciaDiaria.filter(d => Number(d.creados || 0) > 0 || Number(d.resueltos || 0) > 0);
            return activos.length > 0 ? activos : tendenciaDiaria;
        }
        return tendenciaDiaria;
    }, [tendenciaDiaria, vistaTendencia]);

    // Métricas rápidas de la tendencia para hacerla más intuitiva
    const estadisticasTendencia = useMemo(() => {
        const diasConMovimiento = tendenciaDiaria.filter(d => Number(d.creados || 0) > 0 || Number(d.resueltos || 0) > 0);
        let maxPico = 0;
        let fechaPico = null;
        diasConMovimiento.forEach(d => {
            if (Number(d.creados || 0) > maxPico) {
                maxPico = Number(d.creados);
                fechaPico = d.fecha;
            }
        });
        return {
            diasActivos: diasConMovimiento.length,
            maxPico,
            fechaPico
        };
    }, [tendenciaDiaria]);

    // Filtrar y paginar Incidentes Críticos y de Alta Prioridad
    const filteredCriticos = useMemo(() => {
        let list = [...criticosPendientes];

        if (filtroPrioridadCriticos !== 'todas') {
            list = list.filter(c => String(c.prioridad_id) === String(filtroPrioridadCriticos));
        }

        if (filtroEstadoCriticos !== 'todos') {
            list = list.filter(c => String(c.estado_id) === String(filtroEstadoCriticos));
        }

        return list;
    }, [criticosPendientes, filtroPrioridadCriticos, filtroEstadoCriticos]);

    const totalPagesCriticos = Math.ceil(filteredCriticos.length / itemsPorPaginaCriticos) || 1;
    const paginatedCriticos = useMemo(() => {
        const start = (paginaCriticos - 1) * itemsPorPaginaCriticos;
        return filteredCriticos.slice(start, start + itemsPorPaginaCriticos);
    }, [filteredCriticos, paginaCriticos, itemsPorPaginaCriticos]);

    // Filtrar y paginar Demanda por Solicitante
    const filteredUsuarios = useMemo(() => {
        let list = [...mapeoUsuarios];
        const q = searchUsuario.toLowerCase().trim();
        if (q !== '') {
            list = list.filter(u => {
                const nom = (u.nombre_completo || '').toLowerCase();
                const em = (u.email || '').toLowerCase();
                if (tipoBusquedaUsuario === 'nombre') {
                    return nom.includes(q);
                }
                if (tipoBusquedaUsuario === 'email') {
                    return em.includes(q);
                }
                return nom.includes(q) || em.includes(q);
            });
        }
        return list;
    }, [mapeoUsuarios, searchUsuario, tipoBusquedaUsuario]);

    const totalPagesUsuarios = Math.ceil(filteredUsuarios.length / itemsPorPaginaUsuarios) || 1;
    const paginatedUsuarios = useMemo(() => {
        const start = (paginaUsuarios - 1) * itemsPorPaginaUsuarios;
        return filteredUsuarios.slice(start, start + itemsPorPaginaUsuarios);
    }, [filteredUsuarios, paginaUsuarios, itemsPorPaginaUsuarios]);

    // Gráficos de barras por estado
    const dataEstados = useMemo(() => [
        {
            name: 'Pendientes',
            valor: Number(resumen?.pendientes || 0),
            color: ESTADO_COLORS['Pendientes'] || '#2563eb',
            porcentaje: totalTicketsGeneral > 0 ? Math.round((Number(resumen?.pendientes || 0) / totalTicketsGeneral) * 100) : 0,
            displayLabel: totalTicketsGeneral > 0 && Number(resumen?.pendientes || 0) > 0
                ? `${resumen.pendientes} (${Math.round((Number(resumen.pendientes) / totalTicketsGeneral) * 100)}%)`
                : '0',
        },
        {
            name: 'En curso',
            valor: Number(resumen?.en_curso || 0),
            color: ESTADO_COLORS['En curso'] || '#ea580c',
            porcentaje: totalTicketsGeneral > 0 ? Math.round((Number(resumen?.en_curso || 0) / totalTicketsGeneral) * 100) : 0,
            displayLabel: totalTicketsGeneral > 0 && Number(resumen?.en_curso || 0) > 0
                ? `${resumen.en_curso} (${Math.round((Number(resumen.en_curso) / totalTicketsGeneral) * 100)}%)`
                : '0',
        },
        {
            name: 'En revisión',
            valor: Number(resumen?.en_revision || 0),
            color: ESTADO_COLORS['En revisión'] || '#d97706',
            porcentaje: totalTicketsGeneral > 0 ? Math.round((Number(resumen?.en_revision || 0) / totalTicketsGeneral) * 100) : 0,
            displayLabel: totalTicketsGeneral > 0 && Number(resumen?.en_revision || 0) > 0
                ? `${resumen.en_revision} (${Math.round((Number(resumen.en_revision) / totalTicketsGeneral) * 100)}%)`
                : '0',
        },
        {
            name: 'Resueltos',
            valor: Number(resumen?.resueltos || 0),
            color: ESTADO_COLORS['Resueltos'] || '#16a34a',
            porcentaje: totalTicketsGeneral > 0 ? Math.round((Number(resumen?.resueltos || 0) / totalTicketsGeneral) * 100) : 0,
            displayLabel: totalTicketsGeneral > 0 && Number(resumen?.resueltos || 0) > 0
                ? `${resumen.resueltos} (${Math.round((Number(resumen.resueltos) / totalTicketsGeneral) * 100)}%)`
                : '0',
        },
    ], [resumen, totalTicketsGeneral]);

    // Gráficos de barras por prioridad
    const dataPrioridades = useMemo(() => [
        {
            name: 'Baja',
            valor: Number(resumen?.prioridad_baja || 0),
            color: PRIORIDAD_COLORS['Baja'] || '#16a34a',
            porcentaje: totalTicketsGeneral > 0 ? Math.round((Number(resumen?.prioridad_baja || 0) / totalTicketsGeneral) * 100) : 0,
            displayLabel: totalTicketsGeneral > 0 && Number(resumen?.prioridad_baja || 0) > 0
                ? `${resumen.prioridad_baja} (${Math.round((Number(resumen.prioridad_baja) / totalTicketsGeneral) * 100)}%)`
                : '0',
        },
        {
            name: 'Media',
            valor: Number(resumen?.prioridad_media || 0),
            color: PRIORIDAD_COLORS['Media'] || '#ea580c',
            porcentaje: totalTicketsGeneral > 0 ? Math.round((Number(resumen?.prioridad_media || 0) / totalTicketsGeneral) * 100) : 0,
            displayLabel: totalTicketsGeneral > 0 && Number(resumen?.prioridad_media || 0) > 0
                ? `${resumen.prioridad_media} (${Math.round((Number(resumen.prioridad_media) / totalTicketsGeneral) * 100)}%)`
                : '0',
        },
        {
            name: 'Alta',
            valor: Number(resumen?.prioridad_alta || 0),
            color: PRIORIDAD_COLORS['Alta'] || '#dc2626',
            porcentaje: totalTicketsGeneral > 0 ? Math.round((Number(resumen?.prioridad_alta || 0) / totalTicketsGeneral) * 100) : 0,
            displayLabel: totalTicketsGeneral > 0 && Number(resumen?.prioridad_alta || 0) > 0
                ? `${resumen.prioridad_alta} (${Math.round((Number(resumen.prioridad_alta) / totalTicketsGeneral) * 100)}%)`
                : '0',
        },
        {
            name: 'Crítica',
            valor: Number(resumen?.prioridad_critica || 0),
            color: PRIORIDAD_COLORS['Crítica'] || '#9333ea',
            porcentaje: totalTicketsGeneral > 0 ? Math.round((Number(resumen?.prioridad_critica || 0) / totalTicketsGeneral) * 100) : 0,
            displayLabel: totalTicketsGeneral > 0 && Number(resumen?.prioridad_critica || 0) > 0
                ? `${resumen.prioridad_critica} (${Math.round((Number(resumen.prioridad_critica) / totalTicketsGeneral) * 100)}%)`
                : '0',
        },
    ], [resumen, totalTicketsGeneral]);

    // Exportación a Excel con las secciones activas
    const handleExportarExcel = () => {
        try {
            const wb = XLSX.utils.book_new();

            // 1. Resumen consolidado
            const resumenRows = [
                { 'Indicador / Métrica': 'Período Evaluado', 'Valor': `${formatDate(fechasAplicadas.inicio)} al ${formatDate(fechasAplicadas.fin)}` },
                { 'Indicador / Métrica': 'Total de Tickets', 'Valor': totalTicketsGeneral },
                { 'Indicador / Métrica': 'Tickets Resueltos', 'Valor': resueltosCount },
                { 'Indicador / Métrica': 'Tickets Pendientes / En curso', 'Valor': totalPendientes },
                { 'Indicador / Métrica': 'Tasa de Resolución', 'Valor': `${tasaResolucion}%` },
                { 'Indicador / Métrica': 'Tiempo Promedio de Solución', 'Valor': tiempoPromedioTexto },
                { 'Indicador / Métrica': 'Cobertura de Respuesta Técnica', 'Valor': `${resumen?.cobertura_respuesta || 0}%` },
                { 'Indicador / Métrica': 'Tickets con Evidencia Fotográfica', 'Valor': resumen?.con_imagenes || 0 },
                { 'Indicador / Métrica': 'Incidentes Críticos Abiertos', 'Valor': totalCriticosAbiertos },
            ];
            const wsResumen = XLSX.utils.json_to_sheet(resumenRows);
            XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen General');

            // 2. Mapeo de Demanda por Solicitante
            if (mapeoUsuarios.length > 0) {
                const usuariosRows = mapeoUsuarios.map(u => ({
                    'Solicitante': u.nombre_completo,
                    'Email': u.email,
                    'Total Tickets': u.total_tickets,
                    'Resueltos': u.resueltos,
                    'Pendientes': u.pendientes,
                    'Efectividad (%)': `${u.porcentaje_exito}%`,
                    'Último Registro': formatDate(u.ultimo_ticket),
                }));
                const wsUsuarios = XLSX.utils.json_to_sheet(usuariosRows);
                XLSX.utils.book_append_sheet(wb, wsUsuarios, 'Demanda Solicitantes');
            }

            // 3. Tendencia Temporal
            if (tendenciaDiaria.length > 0) {
                const tendenciaRows = tendenciaDiaria.map(t => ({
                    'Fecha': formatDate(t.fecha),
                    'Tickets Creados': t.creados,
                    'Tickets Resueltos': t.resueltos,
                    'Tickets Pendientes': t.pendientes,
                }));
                const wsTendencia = XLSX.utils.json_to_sheet(tendenciaRows);
                XLSX.utils.book_append_sheet(wb, wsTendencia, 'Tendencia Temporal');
            }

            // 4. Incidentes Críticos y de Alta Prioridad
            if (criticosPendientes.length > 0) {
                const criticosRows = criticosPendientes.map(c => ({
                    'ID': c.id,
                    'Título': c.titulo,
                    'Solicitante': c.solicitante,
                    'Email': c.email,
                    'Prioridad': c.prioridad_nombre,
                    'Estado': c.estado_nombre,
                    'Fecha Registro': formatDate(c.created_at),
                    'Días Abierto': c.dias_abierto,
                }));
                const wsCriticos = XLSX.utils.json_to_sheet(criticosRows);
                XLSX.utils.book_append_sheet(wb, wsCriticos, 'Críticos Abiertos');
            }

            XLSX.writeFile(wb, `Reporte_Tickets_${fechasAplicadas.inicio}_al_${fechasAplicadas.fin}.xlsx`);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Reporte Excel generado correctamente',
                showConfirmButton: false,
                timer: 2500,
            });
        } catch (error) {
            console.error('Error exportando Excel:', error);
            Swal.fire('Error', 'No se pudo generar el archivo Excel.', 'error');
        }
    };

    if (loading && !resumen) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="spinner-border text-blue-600" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Encabezado y barra de filtros */}
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
                            className={`px-4 py-2 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-w-[95px] ${
                                hayCambiosPendientes
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
                        disabled={loading || totalTicketsGeneral === 0}
                        title="Exportar reporte consolidado a Excel"
                        className="px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 hover:bg-slate-500/10"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <i className="bi bi-file-earmark-excel-fill text-emerald-600 dark:text-emerald-400 text-sm"></i>
                        <span>Exportar Excel</span>
                    </button>
                </div>
            </div>

            {/* Resumen simplificado en 3 grupos estructurados con menos palabras */}
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

                {/* Grupo 2: Rendimiento y Atención */}
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

                {/* Grupo 3: Atención Prioritaria / Críticos */}
                <div className="card-app p-4 sm:p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                                totalCriticosAbiertos > 0
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
                        <div className={`text-2xl font-extrabold ${
                            totalCriticosAbiertos > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
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

            {/* 1. Mapeo Temporal: Tendencia en el Tiempo (Mejorada e intuitiva) */}
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
                        {/* Selector de modo para ver solo días activos o toda la línea continua */}
                        <div
                            className="inline-flex p-0.5 rounded-xl border text-xs font-semibold"
                            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                        >
                            <button
                                onClick={() => setVistaTendencia('activos')}
                                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                    vistaTendencia === 'activos'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'opacity-70 hover:opacity-100'
                                }`}
                                style={{ color: vistaTendencia === 'activos' ? '#fff' : 'var(--text-primary)' }}
                            >
                                Días con tickets
                            </button>
                            <button
                                onClick={() => setVistaTendencia('todos')}
                                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                    vistaTendencia === 'todos'
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

                {/* Métricas rápidas del gráfico para lectura inmediata */}
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
                                    interval={vistaTendencia === 'todos' ? Math.max(1, Math.floor(datosTendenciaGrafico.length / 8)) : 0}
                                    tickFormatter={(str) => {
                                        if (!str) return '';
                                        const parts = str.split('-');
                                        return parts.length === 3 ? `${parts[2]}/${parts[1]}` : str;
                                    }}
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
                                    dot={{ r: 3, fill: '#3b82f6' }}
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
                                    dot={{ r: 3, fill: '#10b981' }}
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

            {/* 2 & 3. Estado de Tickets y Distribución por Prioridad (Mantener tal cual) */}
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
                                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'var(--hover-bg)', opacity: 0.4 }} />
                                    <Bar dataKey="valor" radius={[8, 8, 0, 0]} maxBarSize={52} isAnimationActive={false}>
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
                                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'var(--hover-bg)', opacity: 0.4 }} />
                                    <Bar dataKey="valor" radius={[8, 8, 0, 0]} maxBarSize={52} isAnimationActive={false}>
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

            {/* 4. Incidentes Críticos y de Alta Prioridad Abiertos (con filtros, paginación y botón diseñado) */}
            {criticosPendientes.length > 0 && (
                <div className="card-app p-0 overflow-hidden border-rose-500/30">
                    <div className="p-4 sm:p-5 border-b bg-rose-500/5 flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm">
                                <i className="bi bi-exclamation-octagon-fill"></i>
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-bold m-0 text-rose-700 dark:text-rose-400">
                                    Incidentes Críticos y de Alta Prioridad Abiertos
                                </h3>
                                <p className="text-xs m-0 opacity-75" style={{ color: 'var(--text-secondary)' }}>
                                    Tickets prioritarios que requieren atención ({filteredCriticos.length} de {criticosPendientes.length} casos)
                                </p>
                            </div>
                        </div>

                        {/* Filtros de Prioridad y Estado para casos críticos */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <label className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>Prioridad:</label>
                                <select
                                    value={filtroPrioridadCriticos}
                                    onChange={(e) => setFiltroPrioridadCriticos(e.target.value)}
                                    className="px-2.5 py-1.5 text-xs rounded-xl border focus:outline-none cursor-pointer"
                                    style={{
                                        backgroundColor: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        borderColor: 'var(--border-color)'
                                    }}
                                >
                                    <option value="todas">Todas (Crítica y Alta)</option>
                                    <option value="4">Solo Crítica</option>
                                    <option value="3">Solo Alta</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <label className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>Estado:</label>
                                <select
                                    value={filtroEstadoCriticos}
                                    onChange={(e) => setFiltroEstadoCriticos(e.target.value)}
                                    className="px-2.5 py-1.5 text-xs rounded-xl border focus:outline-none cursor-pointer"
                                    style={{
                                        backgroundColor: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        borderColor: 'var(--border-color)'
                                    }}
                                >
                                    <option value="todos">Todos los estados</option>
                                    <option value="1">Pendiente</option>
                                    <option value="2">En curso</option>
                                    <option value="3">En revisión</option>
                                </select>
                            </div>

                            {(filtroPrioridadCriticos !== 'todas' || filtroEstadoCriticos !== 'todos') && (
                                <button
                                    onClick={() => {
                                        setFiltroPrioridadCriticos('todas');
                                        setFiltroEstadoCriticos('todos');
                                    }}
                                    className="px-2.5 py-1.5 text-xs rounded-xl border font-medium hover:bg-slate-500/10 transition-colors"
                                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                                    title="Restablecer filtros de críticos"
                                >
                                    <i className="bi bi-arrow-counterclockwise mr-1"></i>
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm text-left">
                            <thead className="text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                                <tr>
                                    <th className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>ID & Ticket</th>
                                    <th className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>Solicitante</th>
                                    <th className="px-5 py-3 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Prioridad</th>
                                    <th className="px-5 py-3 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Estado</th>
                                    <th className="px-5 py-3 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Antigüedad</th>
                                    <th className="px-5 py-3 border-b text-end" style={{ borderColor: 'var(--border-color)' }}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCriticos.length > 0 ? (
                                    paginatedCriticos.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            className="border-b transition-colors hover:bg-rose-500/5"
                                            style={{ borderColor: 'var(--border-color)' }}
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="font-semibold text-rose-700 dark:text-rose-400">
                                                    #{ticket.id} — {ticket.titulo}
                                                </div>
                                                <div className="text-[11px] opacity-70 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                                    Registrado el {formatDate(ticket.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {ticket.solicitante}
                                                </div>
                                                <div className="text-[11px] opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                                    {ticket.email}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                                                    ticket.prioridad_id === 4
                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300'
                                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                                                }`}>
                                                    {ticket.prioridad_nombre}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                                                    {ticket.estado_nombre}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                                                    ticket.dias_abierto > 3
                                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold'
                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                }`}>
                                                    <i className="bi bi-clock-history"></i>
                                                    {ticket.dias_abierto === 0 ? 'Hoy' : `${ticket.dias_abierto} día${ticket.dias_abierto > 1 ? 's' : ''}`}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-end">
                                                {/* Botón integrado con el diseño de la aplicación */}
                                                <button
                                                    onClick={() => navigate('/gestion-tareas')}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer hover:bg-slate-500/10 active:scale-95 shadow-xs"
                                                    style={{
                                                        backgroundColor: 'var(--bg-secondary)',
                                                        borderColor: 'var(--border-color)',
                                                        color: 'var(--text-primary)'
                                                    }}
                                                >
                                                    <span>Ver en Gestión</span>
                                                    <i className="bi bi-box-arrow-up-right text-[11px] text-blue-500"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                                            <p className="font-semibold text-sm m-0">No se encontraron tickets con los filtros seleccionados</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación de incidentes críticos */}
                    {totalPagesCriticos > 1 && (
                        <div className="p-3 sm:p-4 border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                            <CustomPagination
                                currentPage={paginaCriticos}
                                totalPages={totalPagesCriticos}
                                onPageChange={setPaginaCriticos}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* 5. Mapeo de Demanda por Solicitante (con indicación clara de búsqueda por nombre o correo) */}
            <div className="card-app p-0 overflow-hidden">
                <div className="p-4 sm:p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                                Mapeo de Demanda por Solicitante
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                                {filteredUsuarios.length} {filteredUsuarios.length === 1 ? 'solicitante' : 'solicitantes'}
                            </span>
                        </div>
                        <p className="text-xs mt-1 mb-0 opacity-70" style={{ color: 'var(--text-secondary)' }}>
                            Trazabilidad y desglose de requerimientos generados por cada usuario.
                        </p>
                    </div>

                    {/* Buscador explícito: Nombre o Correo con selector de campo */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-1.5 shrink-0">
                            <label className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>Buscar por:</label>
                            <select
                                value={tipoBusquedaUsuario}
                                onChange={(e) => setTipoBusquedaUsuario(e.target.value)}
                                className="px-2.5 py-2 text-xs rounded-xl border focus:outline-none cursor-pointer"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                <option value="todos">Nombre o Correo</option>
                                <option value="nombre">Solo Nombre</option>
                                <option value="email">Solo Correo</option>
                            </select>
                        </div>

                        <div className="relative flex-1 sm:w-64">
                            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-60" style={{ color: 'var(--text-secondary)' }}></i>
                            <input
                                type="text"
                                value={searchUsuario}
                                onChange={(e) => setSearchUsuario(e.target.value)}
                                placeholder={
                                    tipoBusquedaUsuario === 'nombre'
                                        ? "Buscar por nombre..."
                                        : tipoBusquedaUsuario === 'email'
                                        ? "Buscar por correo..."
                                        : "Buscar por nombre o correo..."
                                }
                                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    borderColor: 'var(--border-color)'
                                }}
                            />
                            {searchUsuario && (
                                <button
                                    onClick={() => setSearchUsuario('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 p-1 border-0 bg-transparent"
                                    style={{ color: 'var(--text-primary)' }}
                                    title="Limpiar búsqueda"
                                >
                                    <i className="bi bi-x-circle-fill"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm text-left">
                        <thead className="text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                            <tr>
                                <th className="px-5 sm:px-6 py-3.5 border-b" style={{ borderColor: 'var(--border-color)' }}>Solicitante</th>
                                <th className="px-5 sm:px-6 py-3.5 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Tickets Generados</th>
                                <th className="px-5 sm:px-6 py-3.5 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Estado</th>
                                <th className="px-5 sm:px-6 py-3.5 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Efectividad</th>
                                <th className="px-5 sm:px-6 py-3.5 border-b text-end" style={{ borderColor: 'var(--border-color)' }}>Último Requerimiento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsuarios.length > 0 ? (
                                paginatedUsuarios.map((u, idx) => {
                                    const inicial = (u.nombre_completo || u.email || 'U').charAt(0).toUpperCase();
                                    return (
                                        <tr
                                            key={u.usuario_id || idx}
                                            className="border-b transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/60"
                                            style={{ borderColor: 'var(--border-color)' }}
                                        >
                                            <td className="px-5 sm:px-6 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-600/15 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-500/20">
                                                        {inicial}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                            {u.nombre_completo}
                                                        </div>
                                                        <div className="text-[11px] opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                                            {u.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 sm:px-6 py-3.5 text-center">
                                                <span className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                                                    {u.total_tickets}
                                                </span>
                                                <span className="text-[11px] block opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                                    {totalTicketsGeneral > 0 ? `${((u.total_tickets / totalTicketsGeneral) * 100).toFixed(1)}% de la demanda` : '0%'}
                                                </span>
                                            </td>
                                            <td className="px-5 sm:px-6 py-3.5 text-center">
                                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                                        <i className="bi bi-check2"></i>
                                                        {u.resueltos} resuelto{u.resueltos !== 1 ? 's' : ''}
                                                    </span>
                                                    {u.pendientes > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                                                            <i className="bi bi-hourglass-split"></i>
                                                            {u.pendientes} pendiente{u.pendientes !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 sm:px-6 py-3.5 text-center min-w-[130px]">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                                                        {u.porcentaje_exito}%
                                                    </span>
                                                    <div className="w-24 h-1.5 rounded-full overflow-hidden mt-1" style={{ backgroundColor: 'var(--border-color)' }}>
                                                        <div
                                                            className="h-full rounded-full bg-emerald-500"
                                                            style={{ width: `${u.porcentaje_exito}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 sm:px-6 py-3.5 text-end font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                <div className="inline-flex items-center gap-1 text-xs">
                                                    <i className="bi bi-calendar3 opacity-70"></i>
                                                    <span>{formatDate(u.ultimo_ticket)}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center" style={{ color: 'var(--text-secondary)' }}>
                                        <i className="bi bi-people text-3xl mb-2 opacity-40"></i>
                                        <p className="font-semibold text-sm m-0">No se encontraron solicitantes</p>
                                        <p className="text-xs mt-1 opacity-75">No hay requerimientos que coincidan con el criterio ingresado.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPagesUsuarios > 1 && (
                    <div className="p-3 sm:p-4 border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                        <CustomPagination
                            currentPage={paginaUsuarios}
                            totalPages={totalPagesUsuarios}
                            onPageChange={setPaginaUsuarios}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reportes;
