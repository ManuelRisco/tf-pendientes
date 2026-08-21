import { useEffect, useState, useRef, useCallback } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../lib/dateUtils";
import { ESTADO_COLORS, PRIORIDAD_COLORS } from "../../lib/themeConstants";

export function useDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [filtroAlcance, setFiltroAlcance] = useState('todos'); // 'todos', 'mis_tareas', 'otros', 'usuario_especifico'
    const [filtroUsuarioId, setFiltroUsuarioId] = useState('');
    const [usuariosList, setUsuariosList] = useState([]);
    const statsRef = useRef(null);

    const fetchDashboard = useCallback(async (isPolling = false) => {
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
                        setIsUpdating(false);
                    }, 800);
                }
            } else {
                setStats(newData);
                statsRef.current = newStatsString;
            }
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            if (!isPolling) setLoading(false);
        }
    }, [user, filtroAlcance, filtroUsuarioId, usuariosList.length]);

    const refreshDashboard = useCallback(async () => {
        setIsUpdating(true);
        await fetchDashboard(true);
        setTimeout(() => setIsUpdating(false), 500);
    }, [fetchDashboard]);

    useEffect(() => {
        let isMounted = true;

        if (user) {
            fetchDashboard();
            
            const interval = setInterval(() => {
                if (isMounted) {
                    fetchDashboard(true);
                }
            }, 5000);

            return () => {
                isMounted = false;
                clearInterval(interval);
            };
        }
    }, [user, fetchDashboard]);

    const total = stats?.estadisticas?.total || 0;
    const estados = stats?.estadisticas?.porEstado || [];
    const prioridades = stats?.estadisticas?.porPrioridad || [];

    const estadoColors = ESTADO_COLORS;
    const prioridadColors = PRIORIDAD_COLORS;

    const totalUsuarios = stats?.total_usuarios || 0;
    const actividadReciente = stats?.actividad_reciente || [];

    const getTimeAgo = (dateString) => {
        if (!dateString) return '—';
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 10) return 'Justo ahora';
        if (diffInSeconds < 60) return `Hace ${diffInSeconds} s`;
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
        getActionText,
        refreshDashboard
    };
}

