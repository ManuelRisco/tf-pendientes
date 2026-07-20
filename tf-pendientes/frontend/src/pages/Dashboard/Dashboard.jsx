import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import './Dashboard.css';

function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const resStats = await api.get('/dashboard');
                setStats(resStats.data.data);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchDashboard();
        }
    }, [user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Cargando dashboard...</div>;

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

    const conicGradient = total > 0 ? `conic-gradient(${gradientParts})` : 'conic-gradient(#e2e8f0 0% 100%)';

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Navbar />
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <h1 className="text-[2.25rem] font-bold mb-8 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Bienvenido, {user?.nombre || 'Admin'}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Total Tareas */}
                    <div className="rounded-[24px] p-8 flex flex-col" 
                         style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-semibold text-[1.1rem]" style={{ color: 'var(--text-secondary)' }}>Total Tareas</h3>
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-sm">
                                <i className="bi bi-clipboard-check text-2xl"></i>
                            </div>
                        </div>
                        <div className="text-[4rem] font-extrabold leading-none tracking-tighter flex-grow flex items-center justify-center" style={{ color: 'var(--text-primary)' }}>
                            {total}
                        </div>
                    </div>

                    {/* Card 2: Tareas por Estado */}
                    <div className="rounded-[24px] p-8 flex flex-col"
                         style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                        <h3 className="font-bold text-[1.1rem] mb-6" style={{ color: 'var(--text-primary)' }}>Tareas por Estado</h3>
                        <div className="flex flex-col items-center flex-grow justify-center">
                            {/* Donut Chart */}
                            <div className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-sm mb-8" style={{ background: conicGradient }}>
                                <div className="absolute inset-0 m-[22px] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                            </div>
                            
                            {/* Legend */}
                            <div className="w-full space-y-3">
                                {estados.map(estado => {
                                    const p = total > 0 ? Math.round((estado.cantidad / total) * 100) : 0;
                                    const color = estadoColors[estado.nombre] || '#cbd5e1';
                                    return (
                                        <div key={estado.nombre} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                                                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{estado.nombre}</span>
                                            </div>
                                            <span className="font-medium opacity-75" style={{ color: 'var(--text-secondary)' }}>{p}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Tareas por Prioridad */}
                    <div className="rounded-[24px] p-8 flex flex-col"
                         style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                        <h3 className="font-bold text-[1.1rem] mb-8" style={{ color: 'var(--text-primary)' }}>Tareas por Prioridad</h3>
                        <div className="space-y-6 flex-grow flex flex-col justify-center">
                            {prioridades.map(prioridad => {
                                const p = total > 0 ? Math.round((prioridad.cantidad / total) * 100) : 0;
                                const color = prioridadColors[prioridad.nombre] || '#cbd5e1';
                                return (
                                    <div key={prioridad.nombre}>
                                        <div className="flex justify-between text-[0.95rem] mb-2">
                                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{prioridad.nombre}</span>
                                            <span className="font-medium opacity-75" style={{ color: 'var(--text-secondary)' }}>{p}%</span>
                                        </div>
                                        <div className="w-full rounded-full h-2.5 shadow-inner" style={{ backgroundColor: 'var(--bg-primary)' }}>
                                            <div className="h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${p}%`, backgroundColor: color }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
