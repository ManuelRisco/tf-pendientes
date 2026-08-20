import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import Swal from 'sweetalert2';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

function Reportes() {
    // Por defecto, el último mes
    const hoy = new Date();
    const maxDate = hoy.toISOString().split('T')[0];
    const haceUnMes = new Date();
    haceUnMes.setMonth(hoy.getMonth() - 1);
    
    const [fechaInicio, setFechaInicio] = useState(haceUnMes.toISOString().split('T')[0]);
    const [fechaFin, setFechaFin] = useState(hoy.toISOString().split('T')[0]);
    const [resumen, setResumen] = useState(null);
    const [frecuentes, setFrecuentes] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7'];

    useEffect(() => {
        cargarReportes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                api.get(`/reportes/frecuentes?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`)
            ]);

            if (resResumen.data.success) {
                setResumen(resResumen.data.data);
            }
            if (resFrecuentes.data.success) {
                setFrecuentes(resFrecuentes.data.data);
            }
        } catch (error) {
            console.error('Error cargando reportes:', error);
            Swal.fire('Error', 'No se pudieron cargar los reportes.', 'error');
        } finally {
            setLoading(false);
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

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Reportes de Sistema
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Métricas y análisis de tickets de ayuda
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Desde:</label>
                        <input 
                            type="date" 
                            className="form-control text-sm py-1.5 dark:bg-slate-700 dark:text-white dark:border-slate-600" 
                            max={maxDate}
                            value={fechaInicio} 
                            onChange={(e) => setFechaInicio(e.target.value)} 
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Hasta:</label>
                        <input 
                            type="date" 
                            className="form-control text-sm py-1.5 dark:bg-slate-700 dark:text-white dark:border-slate-600" 
                            max={maxDate}
                            value={fechaFin} 
                            onChange={(e) => setFechaFin(e.target.value)} 
                        />
                    </div>
                    <button
                        onClick={cargarReportes}
                        className="ml-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-md transition-colors flex items-center gap-2"
                    >
                        <i className="bi bi-search"></i>
                        Buscar
                    </button>
                </div>
            </div>

            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-4 flex flex-col justify-center">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Tickets</div>
                    <div className="text-3xl font-bold mt-1 text-blue-600">{resumen?.total_tickets || 0}</div>
                </div>
                <div className="card p-4 flex flex-col justify-center">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Resueltos</div>
                    <div className="text-3xl font-bold mt-1 text-green-600">{resumen?.resueltos || 0}</div>
                </div>
                <div className="card p-4 flex flex-col justify-center">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Pendientes/En Curso</div>
                    <div className="text-3xl font-bold mt-1 text-amber-500">
                        {(resumen?.pendientes || 0) + (resumen?.en_curso || 0) + (resumen?.en_revision || 0)}
                    </div>
                </div>
                <div className="card p-4 flex flex-col justify-center">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Tasa de Resolución</div>
                    <div className="text-3xl font-bold mt-1 text-purple-600">
                        {resumen?.total_tickets > 0 
                            ? Math.round((resumen.resueltos / resumen.total_tickets) * 100) 
                            : 0}%
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-4 h-96 flex flex-col">
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Estado de Tickets</h3>
                    <div className="flex-1 min-h-0">
                        {resumen?.total_tickets > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataEstados} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                    <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                    <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} cursor={{ fill: 'var(--bg-secondary)' }} />
                                    <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6" style={{ color: 'var(--text-secondary)' }}>
                                <i className="bi bi-bar-chart text-4xl mb-3 opacity-30"></i>
                                <p>No hay datos disponibles para el rango de fechas seleccionado.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card p-4 h-96 flex flex-col">
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Distribución por Prioridad</h3>
                    <div className="flex-1 min-h-0">
                        {resumen?.total_tickets > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dataPrioridades}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="valor"
                                        label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                                    >
                                        {dataPrioridades.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                                    <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6" style={{ color: 'var(--text-secondary)' }}>
                                <i className="bi bi-pie-chart text-4xl mb-3 opacity-30"></i>
                                <p>No hay datos disponibles para el rango de fechas seleccionado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabla de Problemas Comunes */}
            <div className="card p-0 overflow-hidden">
                <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Inconvenientes Más Comunes</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tickets agrupados por similitud de título (Top 10)</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                            <tr>
                                <th className="px-6 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>Título / Problema</th>
                                <th className="px-6 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>Frecuencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {frecuentes.length > 0 ? (
                                frecuentes.map((item, idx) => (
                                    <tr key={idx} className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50" style={{ borderColor: 'var(--border-color)' }}>
                                        <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{item.titulo}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                {item.frecuencia} veces
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                                        No hay datos de inconvenientes para este periodo.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Reportes;
