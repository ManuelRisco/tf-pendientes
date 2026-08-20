import { useState, useEffect, useMemo } from 'react';
import api from '../../lib/axios';
import Swal from 'sweetalert2';
import CustomPagination from '../../components/Pagination/CustomPagination';
import DateInput from '../../components/Common/DateInput';
import { formatDate, formatDateTime, getTodayISO, getMonthsAgoISO } from '../../lib/dateUtils';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

function Reportes() {
    // Por defecto, el último mes con fechas locales exactas
    const maxDate = getTodayISO();
    
    const [fechaInicio, setFechaInicio] = useState(() => getMonthsAgoISO(1));
    const [fechaFin, setFechaFin] = useState(() => getTodayISO());
    const [resumen, setResumen] = useState(null);
    const [frecuentes, setFrecuentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animationKey, setAnimationKey] = useState(0);

    // Estados para la lista y filtrado de Inconvenientes
    const [searchFrecuentes, setSearchFrecuentes] = useState('');
    const [filtroResolucion, setFiltroResolucion] = useState('todos');
    const [ordenFrecuentes, setOrdenFrecuentes] = useState('frecuencia_desc');
    const [paginaFrecuentes, setPaginaFrecuentes] = useState(1);
    const itemsPorPagina = 8;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7'];

    useEffect(() => {
        cargarReportes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Resetear a página 1 cuando cambian los filtros locales
    useEffect(() => {
        setPaginaFrecuentes(1);
    }, [searchFrecuentes, filtroResolucion, ordenFrecuentes]);

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
            const [resResumen, resFrecuentes] = await Promise.all([
                api.get(`/reportes/resumen?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`),
                api.get(`/reportes/frecuentes?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&limite=500`),
                new Promise(resolve => setTimeout(resolve, 250)) // Pausa breve para garantizar feedback visual y animación táctil
            ]);

            if (resResumen.data.success) {
                setResumen(resResumen.data.data);
            }
            if (resFrecuentes.data.success) {
                setFrecuentes(resFrecuentes.data.data || []);
            }
            // Disparar re-animación visual suave
            setAnimationKey(prev => prev + 1);
        } catch (error) {
            console.error('Error cargando reportes:', error);
            Swal.fire('Error', 'No se pudieron cargar los reportes.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Procesamiento y filtrado de la lista de inconvenientes
    const filteredFrecuentes = useMemo(() => {
        let list = [...frecuentes];

        // 1. Filtro por texto de búsqueda
        if (searchFrecuentes.trim() !== '') {
            const q = searchFrecuentes.toLowerCase().trim();
            list = list.filter(item => (item.titulo || '').toLowerCase().includes(q));
        }

        // 2. Filtro por estado de resolución
        if (filtroResolucion === 'pendientes') {
            list = list.filter(item => Number(item.pendientes || 0) > 0);
        } else if (filtroResolucion === 'resueltos') {
            list = list.filter(item => Number(item.pendientes || 0) === 0 && Number(item.resueltos || 0) > 0);
        }

        // 3. Ordenación
        list.sort((a, b) => {
            if (ordenFrecuentes === 'frecuencia_desc') {
                return Number(b.frecuencia) - Number(a.frecuencia);
            } else if (ordenFrecuentes === 'frecuencia_asc') {
                return Number(a.frecuencia) - Number(b.frecuencia);
            } else if (ordenFrecuentes === 'titulo_asc') {
                return (a.titulo || '').localeCompare(b.titulo || '');
            } else if (ordenFrecuentes === 'titulo_desc') {
                return (b.titulo || '').localeCompare(a.titulo || '');
            } else if (ordenFrecuentes === 'reciente_desc') {
                const dateA = new Date(a.ultima_ocurrencia || a.created_at || 0).getTime();
                const dateB = new Date(b.ultima_ocurrencia || b.created_at || 0).getTime();
                return dateB - dateA;
            }
            return 0;
        });

        return list;
    }, [frecuentes, searchFrecuentes, filtroResolucion, ordenFrecuentes]);

    const totalPagesFrecuentes = Math.ceil(filteredFrecuentes.length / itemsPorPagina) || 1;
    const paginatedFrecuentes = useMemo(() => {
        const start = (paginaFrecuentes - 1) * itemsPorPagina;
        return filteredFrecuentes.slice(start, start + itemsPorPagina);
    }, [filteredFrecuentes, paginaFrecuentes, itemsPorPagina]);

    if (loading && !resumen) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="spinner-border text-blue-600" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    // Preparar datos para gráficos
    const dataEstados = [
        { name: 'Pendientes', valor: resumen?.pendientes || 0 },
        { name: 'En curso', valor: resumen?.en_curso || 0 },
        { name: 'En revisión', valor: resumen?.en_revision || 0 },
        { name: 'Resueltos', valor: resumen?.resueltos || 0 },
    ];

    const dataPrioridades = [
        { name: 'Baja', valor: resumen?.prioridad_baja || 0 },
        { name: 'Media', valor: resumen?.prioridad_media || 0 },
        { name: 'Alta', valor: resumen?.prioridad_alta || 0 },
        { name: 'Crítica', valor: resumen?.prioridad_critica || 0 },
    ];

    const totalTicketsGeneral = resumen?.total_tickets || 1;

    return (
        <div className="space-y-6 pb-10">
            {/* Encabezado y Filtros de Fecha */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight m-0" style={{ color: 'var(--text-primary)' }}>
                            Reportes de Sistema
                        </h1>
                    </div>
                </div>

                <div
                    className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-2.5 sm:p-3 rounded-2xl border"
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
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-75 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-w-[95px]"
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
            </div>

            {/* Contenedor de Reportes con Re-animación reactiva */}
            <div key={animationKey} className="space-y-6 animate-fade-in">
                {/* Tarjetas de Resumen (KPIs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card-app p-4 sm:p-5 flex flex-col justify-between min-h-[115px]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Total Tickets</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
                                <i className="bi bi-ticket-detailed-fill"></i>
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold mt-2 text-blue-600 dark:text-blue-400">
                            {resumen?.total_tickets || 0}
                        </div>
                    </div>

                    <div className="card-app p-4 sm:p-5 flex flex-col justify-between min-h-[115px]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Resueltos</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                                <i className="bi bi-check-circle-fill"></i>
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold mt-2 text-emerald-600 dark:text-emerald-400">
                            {resumen?.resueltos || 0}
                        </div>
                    </div>

                    <div className="card-app p-4 sm:p-5 flex flex-col justify-between min-h-[115px]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Pendientes / En Curso</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center text-sm">
                                <i className="bi bi-clock-history"></i>
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold mt-2 text-amber-500 dark:text-amber-400">
                            {(resumen?.pendientes || 0) + (resumen?.en_curso || 0) + (resumen?.en_revision || 0)}
                        </div>
                    </div>

                    <div className="card-app p-4 sm:p-5 flex flex-col justify-between min-h-[115px]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Tasa de Resolución</span>
                            <div className="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm">
                                <i className="bi bi-pie-chart-fill"></i>
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold mt-2 text-purple-600 dark:text-purple-400">
                            {resumen?.total_tickets > 0
                                ? Math.round((resumen.resueltos / resumen.total_tickets) * 100)
                                : 0}%
                        </div>
                    </div>
                </div>

                {/* Gráficos Estadísticos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card-app p-4 sm:p-6 h-[400px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base sm:text-lg font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                                Estado de Tickets
                            </h3>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Distribución cuantitativa
                            </span>
                        </div>
                        <div className="flex-1 min-h-0">
                            {resumen?.total_tickets > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dataEstados} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.6} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="var(--text-secondary)"
                                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                        />
                                        <YAxis
                                            stroke="var(--text-secondary)"
                                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--bg-secondary)',
                                                borderColor: 'var(--border-color)',
                                                borderRadius: '12px',
                                                color: 'var(--text-primary)',
                                                boxShadow: 'var(--card-shadow)'
                                            }}
                                            itemStyle={{ color: 'var(--text-primary)' }}
                                            cursor={{ fill: 'var(--hover-bg)' }}
                                        />
                                        <Bar dataKey="valor" fill="#3b82f6" radius={[6, 6, 0, 0]} />
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

                    <div className="card-app p-4 sm:p-6 h-[400px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base sm:text-lg font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                                Distribución por Prioridad
                            </h3>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Nivel de criticidad
                            </span>
                        </div>
                        <div className="flex-1 min-h-0">
                            {resumen?.total_tickets > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dataPrioridades}
                                            cx="50%"
                                            cy="45%"
                                            labelLine={false}
                                            outerRadius={95}
                                            dataKey="valor"
                                            label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                                        >
                                            {dataPrioridades.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--bg-secondary)',
                                                borderColor: 'var(--border-color)',
                                                borderRadius: '12px',
                                                color: 'var(--text-primary)',
                                                boxShadow: 'var(--card-shadow)'
                                            }}
                                            itemStyle={{ color: 'var(--text-primary)' }}
                                        />
                                        <Legend wrapperStyle={{ color: 'var(--text-primary)', paddingTop: '8px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6" style={{ color: 'var(--text-secondary)' }}>
                                    <i className="bi bi-pie-chart text-4xl mb-3 opacity-30"></i>
                                    <p className="text-sm font-medium">No hay datos disponibles para el rango de fechas seleccionado.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lista Completa y Filtrable de Inconvenientes */}
                <div className="card-app p-0 overflow-hidden">
                    {/* Cabecera de la Sección */}
                    <div className="p-4 sm:p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                                    Inconvenientes y Problemas Frecuentes
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                                    {filteredFrecuentes.length} {filteredFrecuentes.length === 1 ? 'resultado' : 'resultados'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Barra de Búsqueda y Filtros de Inconvenientes */}
                    <div className="p-3 sm:p-4 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                        {/* Buscador en tiempo real */}
                        <div className="relative flex-1">
                            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm opacity-60" style={{ color: 'var(--text-secondary)' }}></i>
                            <input
                                type="text"
                                value={searchFrecuentes}
                                onChange={(e) => setSearchFrecuentes(e.target.value)}
                                placeholder="Buscar inconveniente por título o palabra clave..."
                                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    borderColor: 'var(--border-color)'
                                }}
                            />
                            {searchFrecuentes && (
                                <button
                                    onClick={() => setSearchFrecuentes('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 p-1 border-0 bg-transparent"
                                    style={{ color: 'var(--text-primary)' }}
                                    title="Limpiar búsqueda"
                                >
                                    <i className="bi bi-x-circle-fill"></i>
                                </button>
                            )}
                        </div>

                        {/* Filtros y Orden */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Filtro por Estado */}
                            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                                <label className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>Estado:</label>
                                <select
                                    value={filtroResolucion}
                                    onChange={(e) => setFiltroResolucion(e.target.value)}
                                    className="px-2.5 py-2 text-xs rounded-xl border focus:outline-none cursor-pointer"
                                    style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        borderColor: 'var(--border-color)'
                                    }}
                                >
                                    <option value="todos">Todos los estados</option>
                                    <option value="pendientes">Con pendientes activos</option>
                                    <option value="resueltos">100% Resueltos</option>
                                </select>
                            </div>

                            {/* Orden */}
                            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                                <label className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>Orden:</label>
                                <select
                                    value={ordenFrecuentes}
                                    onChange={(e) => setOrdenFrecuentes(e.target.value)}
                                    className="px-2.5 py-2 text-xs rounded-xl border focus:outline-none cursor-pointer"
                                    style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        borderColor: 'var(--border-color)'
                                    }}
                                >
                                    <option value="frecuencia_desc">Mayor frecuencia</option>
                                    <option value="frecuencia_asc">Menor frecuencia</option>
                                    <option value="reciente_desc">Más recientes primero</option>
                                    <option value="titulo_asc">Nombre (A - Z)</option>
                                    <option value="titulo_desc">Nombre (Z - A)</option>
                                </select>
                            </div>

                            {(searchFrecuentes || filtroResolucion !== 'todos' || ordenFrecuentes !== 'frecuencia_desc') && (
                                <button
                                    onClick={() => {
                                        setSearchFrecuentes('');
                                        setFiltroResolucion('todos');
                                        setOrdenFrecuentes('frecuencia_desc');
                                    }}
                                    className="px-3 py-2 text-xs rounded-xl border font-medium hover:bg-slate-500/10 transition-colors"
                                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                                    title="Restablecer filtros"
                                >
                                    <i className="bi bi-arrow-counterclockwise mr-1"></i>
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabla de Inconvenientes */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm text-left">
                            <thead className="text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                                <tr>
                                    <th className="px-5 sm:px-6 py-3.5 border-b" style={{ borderColor: 'var(--border-color)' }}>Inconveniente / Título</th>
                                    <th className="px-5 sm:px-6 py-3.5 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Frecuencia y %</th>
                                    <th className="px-5 sm:px-6 py-3.5 border-b text-center" style={{ borderColor: 'var(--border-color)' }}>Resolución</th>
                                    <th className="px-5 sm:px-6 py-3.5 border-b text-end" style={{ borderColor: 'var(--border-color)' }}>Último Registro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedFrecuentes.length > 0 ? (
                                    paginatedFrecuentes.map((item, idx) => {
                                        const count = Number(item.frecuencia) || 0;
                                        const percent = totalTicketsGeneral > 0 ? ((count / totalTicketsGeneral) * 100).toFixed(1) : 0;
                                        const resueltosCount = Number(item.resueltos || 0);
                                        const pendientesCount = Number(item.pendientes || 0);

                                        return (
                                            <tr
                                                key={idx}
                                                className="border-b transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/60"
                                                style={{ borderColor: 'var(--border-color)' }}
                                            >
                                                {/* Título */}
                                                <td className="px-5 sm:px-6 py-3.5">
                                                    <div className="flex items-start gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs shrink-0 mt-0.5 border border-blue-500/20">
                                                            <i className="bi bi-exclamation-triangle-fill"></i>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                                {item.titulo}
                                                            </div>
                                                            <div className="text-[11px] mt-0.5 opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                                                Primera vez: {formatDate(item.primera_ocurrencia)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Frecuencia + Barra de Porcentaje */}
                                                <td className="px-5 sm:px-6 py-3.5 text-center min-w-[140px]">
                                                    <div className="inline-flex flex-col items-center">
                                                        <span className="font-bold text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>
                                                            {count} {count === 1 ? 'ticket' : 'tickets'} ({percent}%)
                                                        </span>
                                                        <div className="w-24 h-1.5 rounded-full overflow-hidden mt-1.5" style={{ backgroundColor: 'var(--border-color)' }}>
                                                            <div
                                                                className="h-full rounded-full bg-blue-600"
                                                                style={{ width: `${Math.min(100, Math.max(8, percent))}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Resolución */}
                                                <td className="px-5 sm:px-6 py-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                        {resueltosCount > 0 && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                                                <i className="bi bi-check2"></i>
                                                                {resueltosCount} resuelto{resueltosCount > 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                        {pendientesCount > 0 && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700 border border-amber-300">
                                                                <i className="bi bi-hourglass-split"></i>
                                                                {pendientesCount} pendiente{pendientesCount > 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                        {resueltosCount === 0 && pendientesCount === 0 && (
                                                            <span className="text-xs opacity-60" style={{ color: 'var(--text-secondary)' }}>—</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Último Registro */}
                                                <td className="px-5 sm:px-6 py-3.5 text-end font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                    <div className="inline-flex items-center gap-1 text-xs">
                                                        <i className="bi bi-calendar3 opacity-70"></i>
                                                        <span>{formatDate(item.ultima_ocurrencia)}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
                                            <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                                                <i className="bi bi-search text-3xl mb-2 opacity-40"></i>
                                                <p className="font-semibold text-sm m-0" style={{ color: 'var(--text-primary)' }}>
                                                    No se encontraron inconvenientes
                                                </p>
                                                <p className="text-xs mt-1 opacity-75">
                                                    {searchFrecuentes || filtroResolucion !== 'todos'
                                                        ? 'No hay resultados que coincidan con los filtros de búsqueda aplicados.'
                                                        : 'No hay tickets registrados en el rango de fechas seleccionado.'}
                                                </p>
                                                {(searchFrecuentes || filtroResolucion !== 'todos') && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchFrecuentes('');
                                                            setFiltroResolucion('todos');
                                                        }}
                                                        className="mt-3 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                                    >
                                                        Limpiar filtros de búsqueda
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación de la Tabla */}
                    {totalPagesFrecuentes > 1 && (
                        <div className="p-3 sm:p-4 border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                            <CustomPagination
                                currentPage={paginaFrecuentes}
                                totalPages={totalPagesFrecuentes}
                                onPageChange={setPaginaFrecuentes}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Reportes;
