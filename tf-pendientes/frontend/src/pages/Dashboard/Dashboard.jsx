import { useEffect, useState, useRef } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import './Dashboard.css';

function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const statsRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const fetchDashboard = async (isPolling = false) => {
            try {
                if (!isPolling) setLoading(true);

                const resStats = await api.get('/dashboard');
                const newData = resStats.data.data;
                const newStatsString = JSON.stringify(newData);

                if (isMounted) {
                    if (isPolling) {
                        if (statsRef.current !== newStatsString) {
                            setStats(newData);
                            statsRef.current = newStatsString;
                            setIsUpdating(true);
                            setTimeout(() => {
                                if (isMounted) setIsUpdating(false);
                            }, 800); // Duración de la animación
                        }
                    } else {
                        setStats(newData);
                        statsRef.current = newStatsString;
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                if (isMounted && !isPolling) setLoading(false);
            }
        };

        if (user) {
            fetchDashboard();
            
            const interval = setInterval(() => {
                fetchDashboard(true);
            }, 5000); // Actualizar cada 5 segundos

            return () => {
                isMounted = false;
                clearInterval(interval);
            };
        }
    }, [user]);

    if (loading) return <div className="loading-screen text-slate-500">Cargando dashboard...</div>;

    const total = stats?.estadisticas?.total || 0;
    const estados = stats?.estadisticas?.porEstado || [];
    const prioridades = stats?.estadisticas?.porPrioridad || [];

    // Colores basados en el diseño de la imagen
    const estadoColors = {
        'Pendiente': '#3b82f6', // azul
        'En curso': '#f97316',   // naranja
        'En revisión': '#eab308', // amarillo
        'Finalizado': '#22c55e'   // verde
    };

    const prioridadColors = {
        'Alta': '#ef4444',      // rojo
        'Media': '#f59e0b',     // naranja oscuro
        'Baja': '#22c55e',      // verde
        'Crítico': '#991b1b'    // rojo muy oscuro
    };

    // Generar gradiente para la dona
    let currentPercent = 0;
    const gradientParts = estados.map(estado => {
        const p = total > 0 ? (estado.cantidad / total) * 100 : 0;
        const color = estadoColors[estado.nombre] || '#cbd5e1';
        const part = `${color} ${currentPercent}% ${currentPercent + p}%`;
        currentPercent += p;
        return part;
    }).join(', ');

    const conicGradient = total > 0 ? `conic-gradient(${gradientParts})` : 'conic-gradient(#2b2b40 0% 100%)';

    const totalUsuarios = stats?.total_usuarios || 0;
    const actividadReciente = stats?.actividad_reciente || [];

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `Hace ${diffInSeconds} seg`;
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
        return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    };

    const getActionColor = (accion) => {
        switch (accion) {
            case 'CREAR': return 'bg-green-500';
            case 'ACTUALIZAR': return 'bg-blue-500';
            case 'ELIMINAR_LOGICO': return 'bg-red-500';
            case 'RESTAURAR': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    const getActionText = (mov) => {
        const nombre = mov.persona_nombre || mov.email || 'Alguien';
        const isUser = mov.modulo === 'usuarios';
        const articulo = isUser ? 'un usuario' : 'una tarea';

        let targetInfo = '';
        if (mov.detalles) {
            const data = mov.detalles.nuevo || mov.detalles.anterior || {};
            let name = data.email || data.titulo;
            if (name) {
                // Truncar si el nombre/título es muy largo
                if (name.length > 25) {
                    name = name.substring(0, 25) + '...';
                }
                targetInfo = ` (${name})`;
            }
        }

        switch (mov.tipo_accion) {
            case 'CREAR':
                return `${nombre} creó ${isUser ? 'un nuevo usuario' : 'una nueva tarea'}${targetInfo}`;
            case 'ACTUALIZAR':
                return `${nombre} actualizó ${articulo}${targetInfo}`;
            case 'ELIMINAR_LOGICO':
                return isUser ? `${nombre} desactivó ${articulo}${targetInfo}` : `${nombre} eliminó ${articulo}${targetInfo}`;
            case 'RESTAURAR':
                return `${nombre} reactivó ${articulo}${targetInfo}`;
            default:
                return `${nombre} realizó una acción en ${articulo}${targetInfo}`;
        }
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Bienvenido, {user?.nombre || 'Admin'}</h1>
            <p className="dashboard-subtitle">Aquí tienes un resumen de tus métricas.</p>

            <div className="top-cards-grid">
                {/* Card 1: Total Tareas */}
                <div className="stat-card blue-gradient stacked-card">
                    <div className="stat-card-header">
                        <h3>Total Tareas</h3>
                        <i className="bi bi-clipboard2-check"></i>
                    </div>
                    <div className="stat-card-body">
                        <h2 className={isUpdating ? 'updating-anim' : ''}>{total}</h2>
                    </div>
                </div>

                {/* Card 2: Active Users (Solo Admins) */}
                {user?.rol_id === 1 && (
                    <div className="stat-card orange-gradient stacked-card">
                        <div className="stat-card-header">
                            <h3>Usuarios Activos</h3>
                            <i className="bi bi-people"></i>
                        </div>
                        <div className="stat-card-body">
                            <h2 className={isUpdating ? 'updating-anim' : ''}>{totalUsuarios}</h2>
                        </div>
                    </div>
                )}

                {/* Card 3: Recent Activity (Solo Admins) */}
                {user?.rol_id === 1 && (
                    <div className="stat-card dark-card">
                        <div className="stat-card-header">
                            <h3>Actividad reciente</h3>
                            <i className="bi bi-activity"></i>
                        </div>
                        <div className="recent-activity-list">
                            {actividadReciente.length > 0 ? (
                                actividadReciente.map((mov, index) => (
                                    <div className="activity-item" key={mov.id || index}>
                                        <span className={`activity-dot ${getActionColor(mov.tipo_accion)}`}></span>
                                        <div className="activity-content">
                                            <p>{getActionText(mov)}</p>
                                            <span>{getTimeAgo(mov.created_at)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400">No hay actividad reciente.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="charts-grid mt-6">
                {/* Tareas por Estado */}
                <div className="chart-card dark-card">
                    <h3 className="chart-title">Tareas por Estado</h3>
                    <div className="donut-chart-container">
                        <div className={`donut-chart ${isUpdating ? 'updating-anim' : ''}`} style={{ background: conicGradient }}>
                            <div className="donut-inner"></div>
                        </div>

                        <div className="chart-legend">
                            {estados.map(estado => {
                                const p = total > 0 ? parseFloat(((estado.cantidad / total) * 100).toFixed(1)) : 0;
                                const color = estadoColors[estado.nombre] || '#cbd5e1';
                                return (
                                    <div key={estado.nombre} className="legend-item">
                                        <div className="legend-label">
                                            <span className="legend-dot" style={{ backgroundColor: color }}></span>
                                            <span>{estado.nombre}</span>
                                        </div>
                                        <span className="legend-value">{p}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tareas por Prioridad */}
                <div className="chart-card dark-card">
                    <h3 className="chart-title">Tareas por Prioridad</h3>
                    <div className="progress-bars-container">
                        {prioridades.map(prioridad => {
                            const p = total > 0 ? parseFloat(((prioridad.cantidad / total) * 100).toFixed(1)) : 0;
                            const color = prioridadColors[prioridad.nombre] || '#cbd5e1';
                            return (
                                <div key={prioridad.nombre} className="progress-bar-wrapper">
                                    <div className="progress-bar-header">
                                        <span>{prioridad.nombre}</span>
                                        <span>{p}%</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill" style={{ width: `${p}%`, backgroundColor: color }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
