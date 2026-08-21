import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../lib/dateUtils';
import { getEstadoBadge, getPriorityBadge } from '../../lib/themeConstants';

export function useGestionTareas() {
    const { user } = useAuth();
    const isAdmin = Number(user?.rol_id) === 1;

    const [items, setItems] = useState([]);
    const [estados, setEstados] = useState([]);
    const [prioridades, setPrioridades] = useState([]);
    const [usuariosList, setUsuariosList] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priorityId, setPriorityId] = useState('');
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const [filtroAlcance, setFiltroAlcance] = useState('todos'); // 'todos', 'mis_tareas', 'otros', 'usuario_especifico'
    const [filtroUsuarioId, setFiltroUsuarioId] = useState('');
    const descRef = useRef(null);

    // Paginación y Totales
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTasksCount, setTotalTasksCount] = useState(0);
    const limit = 10;

    // Debounce para la búsqueda en tiempo real (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchTareas = async () => {
        try {
            setLoading(true);
            const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
            const promises = [
                api.get(`/tareas?page=${currentPage}&limit=${limit}&estado_id=${filtroEstado}&prioridad_id=${filtroPrioridad}&scope=${filtroAlcance}&usuario_id=${filtroUsuarioId}${searchParam}`),
                api.get('/catalogos'),
            ];

            // Si es administrador y aún no cargó usuarios, cargarlos para el selector
            if (isAdmin && usuariosList.length === 0) {
                promises.push(api.get('/usuarios?limit=100'));
            }

            const results = await Promise.all(promises);
            const resTareas = results[0];
            const resCatalogos = results[1];

            setItems(resTareas.data.data?.items || []);
            setTotalPages(resTareas.data.data?.meta?.totalPages || 1);
            setTotalTasksCount(resTareas.data.data?.meta?.total || 0);

            setEstados(resCatalogos.data.data?.estados || []);
            setPrioridades(resCatalogos.data.data?.prioridades || []);

            if (results[2] && results[2].data.success) {
                const uData = results[2].data.data;
                const usersArr = Array.isArray(uData) ? uData : (uData?.items || []);
                setUsuariosList(usersArr);
            }
        } catch (error) {
            console.error("Error fetching tareas", error);
            Swal.fire('Error', 'No se pudieron cargar las tareas', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTareas();
    }, [currentPage, filtroEstado, filtroPrioridad, filtroAlcance, filtroUsuarioId, debouncedSearch]);

    // Resetear a página 1 cuando cambian los filtros o la búsqueda
    useEffect(() => {
        setCurrentPage(1);
    }, [filtroEstado, filtroPrioridad, filtroAlcance, filtroUsuarioId, debouncedSearch]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setDebouncedSearch('');
        setFiltroEstado('');
        setFiltroPrioridad('');
        setFiltroAlcance('todos');
        setFiltroUsuarioId('');
        setCurrentPage(1);
    };

    const hasActiveFilters = Boolean(
        searchQuery.trim() ||
        filtroEstado ||
        filtroPrioridad ||
        (isAdmin && (filtroAlcance !== 'todos' || filtroUsuarioId))
    );

    const getFormattedDate = (dateString) => {
        return formatDateTime(dateString);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !priorityId) {
            Swal.fire('Error', 'El título y la prioridad son obligatorios', 'error');
            return;
        }

        const payload = {
            titulo: title,
            descripcion: description,
            estado_id: 1,
            prioridad_id: priorityId
        };

        if (editId) {
            Swal.fire({
                title: '¿Estás seguro?',
                text: "Se actualizará la tarea",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#2563eb',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Sí, actualizar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await api.put(`/tareas/${editId}`, payload);
                        fetchTareas();
                        resetForm();
                        Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1500, showConfirmButton: false });
                    } catch (error) {
                        Swal.fire('Error', 'No se pudo actualizar la tarea', 'error');
                    }
                }
            });
        } else {
            try {
                await api.post('/tareas', payload);
                fetchTareas();
                resetForm();
                Swal.fire({ icon: 'success', title: 'Agregado', timer: 1500, showConfirmButton: false });
            } catch (error) {
                Swal.fire('Error', 'No se pudo crear la tarea', 'error');
            }
        }
    };

    const resetForm = () => {
        setEditId(null);
        setTitle('');
        setDescription('');
        setPriorityId('');
        if (descRef.current) {
            descRef.current.style.height = 'auto';
        }
        setShowModal(false);
    };

    const handleChangeStatus = async (id, newStatusId, currentStatusId) => {
        if (!isAdmin) {
            Swal.fire('Acceso denegado', 'Solo los administradores pueden cambiar el estado de las tareas.', 'warning');
            return;
        }

        if (newStatusId === currentStatusId) return;

        const newStatusName = estados.find(e => e.id === newStatusId)?.nombre || '';

        Swal.fire({
            title: '¿Cambiar estado?',
            text: `El estado de la tarea cambiará a "${newStatusName}"`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const tareaActual = items.find(i => i.id === id);
                    await api.put(`/tareas/${id}`, {
                        titulo: tareaActual.titulo,
                        descripcion: tareaActual.descripcion,
                        prioridad_id: tareaActual.prioridad_id,
                        estado_id: newStatusId
                    });
                    fetchTareas();
                    Swal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
                } catch (error) {
                    Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
                }
            }
        });
    };

    const handleView = (item) => {
        const usuarioTexto = item.usuario_nombre 
            ? `${item.usuario_nombre} (${item.usuario_email || 'Sin email'})` 
            : (item.usuario_email || 'No asignado');

        const estadoBadge = getEstadoBadge(item.estado || 'Pendiente');
        const prioridadBadge = getPriorityBadge(item.prioridad || 'Baja');

        Swal.fire({
            title: `<div class="text-left font-bold text-lg text-slate-900 dark:text-slate-100">${item.titulo}</div>`,
            html: `
                <div class="text-left text-xs sm:text-sm space-y-3 pt-2">
                    <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <div class="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-1">Diagnóstico / Descripción</div>
                        <div class="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">${item.descripcion || 'Sin descripción detallada.'}</div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div class="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Estado Actual</span>
                            <span class="inline-block mt-1 font-bold ${estadoBadge.color}">${estadoBadge.nombre}</span>
                        </div>
                        <div class="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Nivel Prioridad</span>
                            <span class="inline-block mt-1 font-bold ${prioridadBadge.color}">${prioridadBadge.nombre}</span>
                        </div>
                    </div>
                    <div class="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs">
                        <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Creado por</span>
                        <span class="font-medium text-slate-800 dark:text-slate-200">${usuarioTexto}</span>
                    </div>
                    <div class="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                        <span>Creado: ${formatDateTime(item.created_at)}</span>
                        <span>Actualizado: ${formatDateTime(item.updated_at)}</span>
                    </div>
                </div>
            `,
            showCloseButton: true,
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#2563eb',
            customClass: {
                popup: 'rounded-2xl'
            }
        });
    };

    const handleEdit = (item) => {
        setEditId(item.id);
        setTitle(item.titulo);
        setDescription(item.descripcion || '');
        setPriorityId(item.prioridad_id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: '¿Eliminar tarea?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/tareas/${id}`);
                    fetchTareas();
                    Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
                } catch (error) {
                    Swal.fire('Error', 'No se pudo eliminar la tarea', 'error');
                }
            }
        });
    };

    // Estilos unificados desde themeConstants
    const getStatusStyle = (estadoNombre) => {
        const badge = getEstadoBadge(estadoNombre);
        return badge.bgClass;
    };

    const getStatusDotColor = (estadoNombre) => {
        const badge = getEstadoBadge(estadoNombre);
        return badge.dotColor;
    };

    const getPriorityBadgeStyle = (prioridadNombre) => {
        const badge = getPriorityBadge(prioridadNombre);
        return badge.bgClass;
    };

    return {
        items,
        estados,
        prioridades,
        usuariosList,
        title,
        setTitle,
        description,
        setDescription,
        priorityId,
        setPriorityId,
        editId,
        showModal,
        setShowModal,
        loading,
        searchQuery,
        setSearchQuery,
        filtroEstado,
        setFiltroEstado,
        filtroPrioridad,
        setFiltroPrioridad,
        filtroAlcance,
        setFiltroAlcance,
        filtroUsuarioId,
        setFiltroUsuarioId,
        hasActiveFilters,
        handleClearFilters,
        descRef,
        currentPage,
        setCurrentPage,
        totalPages,
        totalTasksCount,
        handleSubmit,
        resetForm,
        handleChangeStatus,
        handleView,
        handleEdit,
        handleDelete,
        getFormattedDate,
        getPriorityBadgeStyle,
        getStatusStyle,
        getStatusDotColor
    };
}
