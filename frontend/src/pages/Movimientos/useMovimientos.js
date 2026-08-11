import { useEffect, useState, useMemo } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";

export function useMovimientos() {
    const { user } = useAuth();
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filtroUsuario, setFiltroUsuario] = useState('');
    const [filtroAccion, setFiltroAccion] = useState('');
    const [filtroModulo, setFiltroModulo] = useState('');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const usuariosUnicos = useMemo(() => {
        const users = movimientos.map(m => m.email).filter(Boolean);
        return [...new Set(users)];
    }, [movimientos]);

    const accionesUnicas = useMemo(() => {
        const actions = movimientos.map(m => m.tipo_accion).filter(Boolean);
        return [...new Set(actions)];
    }, [movimientos]);

    const modulosUnicos = useMemo(() => {
        const mods = movimientos.map(m => m.modulo).filter(Boolean);
        return [...new Set(mods)];
    }, [movimientos]);

    const movimientosFiltrados = useMemo(() => {
        return movimientos.filter(mov => {
            const matchUsuario = filtroUsuario === '' || mov.email === filtroUsuario;
            const matchAccion = filtroAccion === '' || mov.tipo_accion === filtroAccion;
            const matchModulo = filtroModulo === '' || mov.modulo === filtroModulo;
            return matchUsuario && matchAccion && matchModulo;
        });
    }, [movimientos, filtroUsuario, filtroAccion, filtroModulo]);

    useEffect(() => {
        const fetchMovimientos = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/movimientos?page=${currentPage}&limit=${limit}`);
                setMovimientos(res.data.data.items || []);
                setTotalPages(res.data.data.meta?.totalPages || 1);
            } catch (error) {
                console.error("Error fetching movimientos", error);
            } finally {
                setLoading(false);
            }
        };
        
        if (user && Number(user.rol_id) === 1) {
            fetchMovimientos();
        }
    }, [currentPage, user]);

    const getActionText = (mov) => {
        const isUser = mov.modulo === 'usuarios';
        const articulo = isUser ? 'un usuario' : 'una tarea';

        let targetInfo = '';
        if (mov.detalles) {
            const data = mov.detalles.nuevo || mov.detalles.anterior || {};
            let name = data.email || data.titulo;
            if (name) {
                if (name.length > 35) name = name.substring(0, 35) + '...';
                targetInfo = ` (${name})`;
            }
        }

        switch (mov.tipo_accion) {
            case 'CREAR': return `Creó ${isUser ? 'un nuevo usuario' : 'una nueva tarea'}${targetInfo}`;
            case 'ACTUALIZAR': return `Actualizó ${articulo}${targetInfo}`;
            case 'ELIMINAR_LOGICO': return isUser ? `Desactivó ${articulo}${targetInfo}` : `Eliminó ${articulo}${targetInfo}`;
            case 'RESTAURAR': return `Reactivó ${articulo}${targetInfo}`;
            default: return `Acción en ${articulo}${targetInfo}`;
        }
    };

    return {
        user,
        loading,
        filtroUsuario,
        setFiltroUsuario,
        filtroAccion,
        setFiltroAccion,
        filtroModulo,
        setFiltroModulo,
        currentPage,
        setCurrentPage,
        totalPages,
        usuariosUnicos,
        accionesUnicas,
        modulosUnicos,
        movimientosFiltrados,
        getActionText
    };
}
