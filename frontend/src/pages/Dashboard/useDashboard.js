import { useEffect, useState, useRef } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../lib/dateUtils";

export function useDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [filtroAlcance, setFiltroAlcance] = useState('todos'); // 'todos', 'mis_tareas', 'otros', 'usuario_especifico'
    const [filtroUsuarioId, setFiltroUsuarioId] = useState('');
    const [usuariosList, setUsuariosList] = useState([]);
    const statsRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const fetchDashboard = async (isPolling = false) => {
            try {
                if (!isPolling) setLoading(true);

                const promises = [
                    api.get(`/dashboard?scope=${filtroAlcance}&usuario_id=${filtroUsuarioId}`)
                ];

                // Si es administrador y aún no cargó usuarios, cargarlos para el selector
                if (user && Number(user.rol_id) === 1 && usuariosList.length === 0) {
                    promises.push(api.get('/usuarios?limit=100'));
                }

                const results = await Promise.all(promises);
                const resStats = results[0];
                const newData = resStats.data.data;
                const newStatsString = JSON.stringify(newData);

                if (isMounted) {
                    if (results[1] && results[1].data.success) {
                        const uData = results[1].data.data;
                        const usersArr = Array.isArray(uData) ? uData : (uData?.items || []);
                        setUsuariosList(usersArr);
                    }

                    if (isPolling) {
                        if (statsRef.current !== newStatsString) {
                            setStats(newData);
                            statsRef.current = newStatsString;
                            setIsUpdating(true);
                            setTimeout(() => {
                                if (isMounted) setIsUpdating(false);
                            }, 800);
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
            }, 5000);

            return () => {
                isMounted = false;
                clearInterval(interval);
            };
        }
    }, [user, filtroAlcance, filtroUsuarioId]);

    const total = stats?.estadisticas?.total || 0;
    const estados = stats?.estadisticas?.porEstado || [];
    const prioridades = stats?.estadisticas?.porPrioridad || [];

    const estadoColors = {
        'Pendiente': '#2563eb', // Rich Blue
        'En curso': '#ea580c', // Rich Orange
        'En revisión': '#ca8a04', // Rich Amber
        'Finalizado': '#16a34a'  // Rich Emerald Green
    };

    const prioridadColors = {
        'Baja': '#16a34a',     // Green
        'Media': '#ea580c',    // Amber/Orange
        'Alta': '#dc2626',     // Bright Red
        'Crítico': '#9333ea',  // Purple / Crimson
        'Crítica': '#9333ea'
    };

    const totalUsuarios = stats?.total_usuarios || 0;
    const actividadReciente = stats?.actividad_reciente || [];

    const getTimeAgo = (dateString) => {
        if (!dateString) return '—';
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `Hace ${diffInSeconds} seg`;
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
        return formatDate(dateString);
    };

    const getActionColor = (accion) => {
        switch (accion) {
            case 'CREAR': return 'bg-emerald-500';
            case 'ACTUALIZAR': return 'bg-blue-500';
            case 'ELIMINAR_LOGICO': return 'bg-red-500';
            case 'RESTAURAR': return 'bg-amber-500';
            default: return 'bg-slate-500';
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
                if (name.length > 25) {
                    name = name.substring(0, 25) + '...';
                }
                targetInfo = ` (${name})`;
            }
        }

        switch (mov.tipo_accion) {
            case 'CREAR': return `${nombre} creó ${isUser ? 'un nuevo usuario' : 'una nueva tarea'}${targetInfo}`;
            case 'ACTUALIZAR': return `${nombre} actualizó ${articulo}${targetInfo}`;
            case 'ELIMINAR_LOGICO': return isUser ? `${nombre} desactivó ${articulo}${targetInfo}` : `${nombre} eliminó ${articulo}${targetInfo}`;
            case 'RESTAURAR': return `${nombre} reactivó ${articulo}${targetInfo}`;
            default: return `${nombre} realizó una acción en ${articulo}${targetInfo}`;
        }
    };

    return {
        user,
        loading,
        isUpdating,
        total,
        estados,
        prioridades,
        estadoColors,
        prioridadColors,
        totalUsuarios,
        actividadReciente,
        filtroAlcance,
        setFiltroAlcance,
        filtroUsuarioId,
        setFiltroUsuarioId,
        usuariosList,
        getTimeAgo,
        getActionColor,
        getActionText
    };
}
