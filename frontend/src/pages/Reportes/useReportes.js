import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../lib/axios';
import Swal from 'sweetalert2';
import { getTodayISO, getMonthsAgoISO } from '../../lib/dateUtils';
import { ESTADO_COLORS, PRIORIDAD_COLORS } from '../../lib/themeConstants';
import { exportarReporteExcelAvanzado } from '../../lib/excelExportHelper';

export function useReportes() {
    const maxDate = getTodayISO();

    const [fechaInicio, setFechaInicio] = useState(() => getMonthsAgoISO(1));
    const [fechaFin, setFechaFin] = useState(() => getTodayISO());
    const [fechasAplicadas, setFechasAplicadas] = useState(() => ({
        inicio: getMonthsAgoISO(1),
        fin: getTodayISO()
    }));
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exportandoExcel, setExportandoExcel] = useState(false);

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

    const cargarReportes = useCallback(async () => {
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
    }, [fechaInicio, fechaFin]);

    useEffect(() => {
        cargarReportes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    // Métricas rápidas de la tendencia
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

    // Cálculo dinámico del intervalo de ticks
    const tickInterval = useMemo(() => {
        const len = datosTendenciaGrafico.length;
        if (len <= 7) return 0;
        return Math.max(1, Math.floor(len / 7));
    }, [datosTendenciaGrafico.length]);

    // Formateador de fechas para el eje X
    const formatTickDate = useMemo(() => {
        const inicioAnio = fechasAplicadas.inicio?.slice(0, 4);
        const finAnio = fechasAplicadas.fin?.slice(0, 4);
        const cruzaAnios = inicioAnio && finAnio && inicioAnio !== finAnio;

        return (str) => {
            if (!str) return '';
            const parts = str.split('-');
            if (parts.length !== 3) return str;
            if (cruzaAnios) {
                return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
            }
            return `${parts[2]}/${parts[1]}`;
        };
    }, [fechasAplicadas.inicio, fechasAplicadas.fin]);

    // Filtrar y paginar Incidentes Críticos
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

    // Exportación avanzada a Excel
    const handleExportarExcel = async () => {
        if (totalTicketsGeneral === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin datos',
                text: 'No hay tickets registrados en el rango de fechas seleccionado para exportar.',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }

        setExportandoExcel(true);
        try {
            await exportarReporteExcelAvanzado({
                resumen,
                fechasAplicadas,
                totalTicketsGeneral,
                resueltosCount,
                totalPendientes,
                tasaResolucion,
                tiempoPromedioTexto,
                totalCriticosAbiertos,
                mapeoUsuarios,
                tendenciaDiaria,
                criticosPendientes,
                distribucionPrioridad: dataPrioridades,
                distribucionEstado: dataEstados,
            });

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Reporte Excel generado y descargado',
                showConfirmButton: false,
                timer: 2500,
            });
        } catch (error) {
            console.error('Error exportando Excel:', error);
            Swal.fire('Error', 'No se pudo generar el archivo Excel.', 'error');
        } finally {
            setExportandoExcel(false);
        }
    };

    return {
        maxDate,
        fechaInicio,
        setFechaInicio,
        fechaFin,
        setFechaFin,
        fechasAplicadas,
        resumen,
        loading,
        exportandoExcel,
        vistaTendencia,
        setVistaTendencia,
        filtroPrioridadCriticos,
        setFiltroPrioridadCriticos,
        filtroEstadoCriticos,
        setFiltroEstadoCriticos,
        paginaCriticos,
        setPaginaCriticos,
        searchUsuario,
        setSearchUsuario,
        tipoBusquedaUsuario,
        setTipoBusquedaUsuario,
        paginaUsuarios,
        setPaginaUsuarios,
        cargarReportes,
        hayCambiosPendientes,
        totalTicketsGeneral,
        resueltosCount,
        totalPendientes,
        tasaResolucion,
        tasaPendientes,
        tiempoPromedioTexto,
        porcentajeFotos,
        totalCriticosAbiertos,
        datosTendenciaGrafico,
        estadisticasTendencia,
        tickInterval,
        formatTickDate,
        filteredCriticos,
        totalPagesCriticos,
        paginatedCriticos,
        filteredUsuarios,
        totalPagesUsuarios,
        paginatedUsuarios,
        dataEstados,
        dataPrioridades,
        criticosPendientes,
        handleExportarExcel
    };
}
