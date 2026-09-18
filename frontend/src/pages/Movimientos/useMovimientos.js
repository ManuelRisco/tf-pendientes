import { useEffect, useState, useMemo } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
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
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Modal de detalle de auditoría
    const [selectedMovimiento, setSelectedMovimiento] = useState(null);

    // Paginación y límite configurable
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);

    const [accionesUnicas, setAccionesUnicas] = useState(['CREAR', 'ACTUALIZAR', 'ELIMINAR_LOGICO', 'RESTAURAR']);
    const modulosUnicos = useMemo(() => ['tareas', 'usuarios'], []);

    const [serverMetrics, setServerMetrics] = useState({
        total: 0,
        tareas: 0,
        usuarios: 0,
        hoy: 0
    });

    // Debounce para el buscador de texto / #ID
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Movimientos actuales ya filtrados y paginados desde el servidor
    const movimientosFiltrados = useMemo(() => {
        return Array.isArray(movimientos) ? movimientos : [];
    }, [movimientos]);

    // Métricas KPI reales desde el servidor
    const metrics = useMemo(() => {
        return serverMetrics;
    }, [serverMetrics]);

    const setFiltroAlcanceAndResetPage = (val) => {
        setFiltroAlcance(val);
        setCurrentPage(1);
    };

    const setFiltroUsuarioIdAndResetPage = (val) => {
        setFiltroUsuarioId(val);
        setCurrentPage(1);
    };

    const setFiltroModuloAndResetPage = (val) => {
        setFiltroModulo(val);
        setCurrentPage(1);
    };

    const setFiltroAccionAndResetPage = (val) => {
        setFiltroAccion(val);
        setCurrentPage(1);
    };

    const handleSearchQueryChange = (val) => {
        setSearchQuery(val);
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
                let url = `/movimientos?page=${currentPage}&limit=${limit}&scope=${filtroAlcance}&usuario_id=${filtroUsuarioId}`;
                if (filtroModulo) {
                    url += `&modulo=${encodeURIComponent(filtroModulo)}`;
                }
                if (filtroAccion) {
                    url += `&accion=${encodeURIComponent(filtroAccion)}`;
                }
                if (debouncedSearchQuery.trim()) {
                    url += `&search=${encodeURIComponent(debouncedSearchQuery.trim())}`;
                }

                const promises = [
                    api.get(url)
                ];

                if (user && Number(user.rol_id) === 1 && usuariosList.length === 0) {
                    promises.push(api.get('/usuarios?limit=100'));
                }

                const results = await Promise.all(promises);
                const res = results[0];
                const items = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.items || []);
                const meta = res.data.data?.meta || {};

                setMovimientos(items);
                setTotalRegistros(meta.total ?? items.length);
                setTotalPages(meta.totalPages || 1);

                if (meta.metrics) {
                    setServerMetrics(meta.metrics);
                }
                if (Array.isArray(meta.acciones) && meta.acciones.length > 0) {
                    setAccionesUnicas(meta.acciones);
                }

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
    }, [currentPage, user, filtroAlcance, filtroUsuarioId, limit, filtroModulo, filtroAccion, debouncedSearchQuery, usuariosList.length]);

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
        if (totalRegistros === 0 || isExporting) return;
        setIsExporting(true);
        try {
            let dataToExport = movimientos;

            // Si hay más registros en la base de datos que los cargados en la página actual,
            // obtenemos la lista completa filtrada desde el servidor
            if (totalRegistros > movimientos.length) {
                try {
                    let exportUrl = `/movimientos?page=1&limit=5000&scope=${filtroAlcance}&usuario_id=${filtroUsuarioId}`;
                    if (filtroModulo) exportUrl += `&modulo=${encodeURIComponent(filtroModulo)}`;
                    if (filtroAccion) exportUrl += `&accion=${encodeURIComponent(filtroAccion)}`;
                    if (debouncedSearchQuery.trim()) exportUrl += `&search=${encodeURIComponent(debouncedSearchQuery.trim())}`;

                    const res = await api.get(exportUrl);
                    const allItems = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.items || []);
                    dataToExport = allItems;
                } catch (fetchErr) {
                    console.warn("No se pudo obtener el lote completo para exportación, usando página actual:", fetchErr);
                    dataToExport = movimientos;
                }
            }

            await exportarMovimientosExcel({
                movimientos: dataToExport,
                metrics,
                filtros: {
                    filtroAlcance,
                    filtroModulo,
                    filtroAccion,
                    searchQuery: debouncedSearchQuery
                },
                user
            });
        } catch (error) {
            console.error("Error al exportar bitácora a Excel:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleClearFilters = () => {
        setFiltroAlcance('todos');
        setFiltroAccion('');
        setFiltroModulo('');
        setFiltroUsuarioId('');
        setSearchQuery('');
        setDebouncedSearchQuery('');
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
        setFiltroAccion: setFiltroAccionAndResetPage,
        filtroModulo,
        setFiltroModulo: setFiltroModuloAndResetPage,
        searchQuery,
        setSearchQuery: handleSearchQueryChange,
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


