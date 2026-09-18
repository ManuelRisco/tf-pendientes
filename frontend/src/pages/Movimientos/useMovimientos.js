import { useEffect, useState, useMemo } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { getTodayISO } from "../../lib/dateUtils";
import { exportarMovimientosExcel } from "../../lib/excelExportHelper";

export function useMovimientos() {
    const { user } = useAuth();
    const [movimientos, setMovimientos] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    const [filtroAlcance, setFiltroAlcance] = useState('todos'); // 'todos', 'mis_movimientos', 'otros', 'usuario_especifico'
    const [filtroUsuarioId, setFiltroUsuarioId] = useState('');
    const [usuariosList, setUsuariosList] = useState([]);

    const [filtroAccion, setFiltroAccion] = useState('');
    const [filtroModulo, setFiltroModulo] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal de detalle de auditoría
    const [selectedMovimiento, setSelectedMovimiento] = useState(null);

    // Paginación y límite configurable
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);

    const accionesUnicas = useMemo(() => {
        const actions = (Array.isArray(movimientos) ? movimientos : []).map(m => m.tipo_accion).filter(Boolean);
        return [...new Set(actions)];
    }, [movimientos]);

    const modulosUnicos = useMemo(() => {
        const mods = (Array.isArray(movimientos) ? movimientos : []).map(m => m.modulo).filter(Boolean);
        return [...new Set(mods)];
    }, [movimientos]);

    // Filtrado interactivo en tiempo real
    const movimientosFiltrados = useMemo(() => {
        return (Array.isArray(movimientos) ? movimientos : []).filter(mov => {
            const matchAccion = filtroAccion === '' || mov.tipo_accion === filtroAccion;
            const matchModulo = filtroModulo === '' || mov.modulo === filtroModulo;

            if (!matchAccion || !matchModulo) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const cleanId = q.replace(/^[#\s]*(?:id\s*[:\s]*)?/i, '').trim();
                const isIdSearch = cleanId !== '' && !isNaN(cleanId);

                const userName = `${mov.persona_nombre || ''} ${mov.persona_apellido || ''}`.toLowerCase();
                const email = (mov.email || '').toLowerCase();
                const accion = (mov.tipo_accion || '').toLowerCase();
                const modulo = (mov.modulo || '').toLowerCase();
                const idStr = String(mov.id || '');
                const regIdStr = String(mov.registro_id || '');
                const title = (mov.detalles?.nuevo?.titulo || mov.detalles?.anterior?.titulo || '').toLowerCase();
                const emailTarget = (mov.detalles?.nuevo?.email || mov.detalles?.anterior?.email || '').toLowerCase();

                const matchId = isIdSearch && (idStr === cleanId || regIdStr === cleanId);

                return matchId ||
                    userName.includes(q) ||
                    email.includes(q) ||
                    accion.includes(q) ||
                    modulo.includes(q) ||
                    idStr.includes(q) ||
                    regIdStr.includes(q) ||
                    title.includes(q) ||
                    emailTarget.includes(q);
            }

            return true;
        });
    }, [movimientos, filtroAccion, filtroModulo, searchQuery]);

    // Métricas KPI
    const metrics = useMemo(() => {
        const items = Array.isArray(movimientos) ? movimientos : [];
        const total = totalRegistros || items.length;
        const tareas = items.filter(m => m.modulo === 'tareas').length;
        const usuarios = items.filter(m => m.modulo === 'usuarios').length;
        const todayIso = getTodayISO();
        const hoy = items.filter(m => (m.created_at || '').startsWith(todayIso)).length;
        return { total, tareas, usuarios, hoy };
    }, [movimientos, totalRegistros]);

    const setFiltroAlcanceAndResetPage = (val) => {
        setFiltroAlcance(val);
        setCurrentPage(1);
    };

    const setFiltroUsuarioIdAndResetPage = (val) => {
        setFiltroUsuarioId(val);
        setCurrentPage(1);
    };

    const setLimitAndResetPage = (val) => {
        setLimit(val);
        setCurrentPage(1);
    };

    useEffect(() => {
        const fetchMovimientos = async () => {
            setLoading(true);
            try {
                const promises = [
                    api.get(`/movimientos?page=${currentPage}&limit=${limit}&scope=${filtroAlcance}&usuario_id=${filtroUsuarioId}`)
                ];

                if (user && Number(user.rol_id) === 1 && usuariosList.length === 0) {
                    promises.push(api.get('/usuarios?limit=100'));
                }

                const results = await Promise.all(promises);
                const res = results[0];
                const items = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.items || []);
                const meta = res.data.data?.meta || {};

                setMovimientos(items);
                setTotalRegistros(meta.total || items.length);
                setTotalPages(meta.totalPages || 1);

                if (results[1] && results[1].data.success) {
                    const uData = results[1].data.data;
                    const usersArr = Array.isArray(uData) ? uData : (uData?.items || []);
                    setUsuariosList(usersArr);
                }
            } catch (error) {
                console.error("Error fetching movimientos", error);
                setMovimientos([]);
                setTotalRegistros(0);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMovimientos();
        }
    }, [currentPage, user, filtroAlcance, filtroUsuarioId, limit, usuariosList.length]);

    const getActionText = (mov) => {
        const isUser = mov.modulo === 'usuarios';
        const articulo = isUser ? 'un usuario' : 'una tarea';

        let targetInfo = '';
        if (mov.detalles) {
            const data = mov.detalles.nuevo || mov.detalles.anterior || {};
            let name = data.email || data.titulo;
            if (name) {
                if (name.length > 40) name = name.substring(0, 40) + '...';
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

    // Exportación avanzada a Excel (.xlsx) estandarizada idéntica a Reportes
    const handleExportExcel = async () => {
        if (movimientosFiltrados.length === 0 || isExporting) return;
        setIsExporting(true);
        try {
            let dataToExport = movimientosFiltrados;

            // Si hay más registros en la base de datos que los cargados en la página actual,
            // obtenemos la lista completa para que el archivo Excel contenga todos los movimientos
            if (totalRegistros > movimientos.length) {
                try {
                    const res = await api.get(`/movimientos?page=1&limit=5000&scope=${filtroAlcance}&usuario_id=${filtroUsuarioId}`);
                    const allItems = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.items || []);

                    // Aplicamos los filtros activos en cliente sobre el lote completo
                    dataToExport = allItems.filter(mov => {
                        const matchAccion = filtroAccion === '' || mov.tipo_accion === filtroAccion;
                        const matchModulo = filtroModulo === '' || mov.modulo === filtroModulo;
                        if (!matchAccion || !matchModulo) return false;

                        if (searchQuery.trim()) {
                            const q = searchQuery.toLowerCase().trim();
                            const cleanId = q.replace(/^[#\s]*(?:id\s*[:\s]*)?/i, '').trim();
                            const isIdSearch = cleanId !== '' && !isNaN(cleanId);

                            const userName = `${mov.persona_nombre || ''} ${mov.persona_apellido || ''}`.toLowerCase();
                            const email = (mov.email || '').toLowerCase();
                            const accion = (mov.tipo_accion || '').toLowerCase();
                            const modulo = (mov.modulo || '').toLowerCase();
                            const idStr = String(mov.id || '');
                            const regIdStr = String(mov.registro_id || '');
                            const title = (mov.detalles?.nuevo?.titulo || mov.detalles?.anterior?.titulo || '').toLowerCase();
                            const emailTarget = (mov.detalles?.nuevo?.email || mov.detalles?.anterior?.email || '').toLowerCase();

                            const matchId = isIdSearch && (idStr === cleanId || regIdStr === cleanId);
                            return matchId || userName.includes(q) || email.includes(q) || accion.includes(q) || modulo.includes(q) || idStr.includes(q) || regIdStr.includes(q) || title.includes(q) || emailTarget.includes(q);
                        }
                        return true;
                    });
                } catch (fetchErr) {
                    console.warn("No se pudo obtener el lote completo para exportación, usando página actual:", fetchErr);
                    dataToExport = movimientosFiltrados;
                }
            }

            await exportarMovimientosExcel({
                movimientos: dataToExport,
                metrics,
                filtros: {
                    filtroAlcance,
                    filtroModulo,
                    filtroAccion,
                    searchQuery
                },
                user
            });
        } catch (error) {
            console.error("Error al exportar bitácora a Excel:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const setFiltroModuloAndResetPage = (val) => {
        setFiltroModulo(val);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setFiltroAlcance('todos');
        setFiltroAccion('');
        setFiltroModulo('');
        setFiltroUsuarioId('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const hasActiveFilters = filtroAlcance !== 'todos' || filtroAccion !== '' || filtroModulo !== '' || filtroUsuarioId !== '' || searchQuery.trim() !== '';

    return {
        user,
        loading,
        filtroAlcance,
        setFiltroAlcance: setFiltroAlcanceAndResetPage,
        filtroUsuarioId,
        setFiltroUsuarioId: setFiltroUsuarioIdAndResetPage,
        usuariosList,
        filtroAccion,
        setFiltroAccion,
        filtroModulo,
        setFiltroModulo: setFiltroModuloAndResetPage,
        searchQuery,
        setSearchQuery,
        selectedMovimiento,
        setSelectedMovimiento,
        currentPage,
        setCurrentPage,
        totalPages,
        limit,
        setLimit: setLimitAndResetPage,
        totalRegistros,
        accionesUnicas,
        modulosUnicos,
        movimientosFiltrados,
        metrics,
        getActionText,
        handleExportExcel,
        exportToCSV: handleExportExcel,
        isExporting,
        handleClearFilters,
        hasActiveFilters
    };
}

