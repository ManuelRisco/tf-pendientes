import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

export function useGestionTareas() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [estados, setEstados] = useState([]);
    const [prioridades, setPrioridades] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priorityId, setPriorityId] = useState('');
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const descRef = useRef(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const fetchTareas = async () => {
        try {
            const [resTareas, resCatalogos] = await Promise.all([
                api.get(`/tareas?page=${currentPage}&limit=${limit}&estado_id=${filtroEstado}&prioridad_id=${filtroPrioridad}`),
                api.get('/catalogos'),
            ]);
            setItems(resTareas.data.data.items || []);
            setTotalPages(resTareas.data.data.meta?.totalPages || 1);

            setEstados(resCatalogos.data.data?.estados || []);
            setPrioridades(resCatalogos.data.data?.prioridades || []);
        } catch (error) {
            console.error("Error fetching tareas", error);
            Swal.fire('Error', 'No se pudieron cargar las tareas', 'error');
        }
    };

    useEffect(() => {
        fetchTareas();
    }, [currentPage, filtroEstado, filtroPrioridad]);

    const getFormattedDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
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
                        const tareaActual = items.find(i => i.id === editId);
                        payload.estado_id = tareaActual.estado_id;

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
        const displayTitle = item.titulo;
        const displayDesc = item.descripcion ? item.descripcion.replace(/\n/g, '<br/>') : '<em>Sin descripción</em>';

        Swal.fire({
            title: `<strong>${displayTitle}</strong>`,
            html: `
                <div style="text-align: left; margin-top: 15px; font-size: 0.95rem; line-height: 1.6;">
                    <p style="margin-bottom: 8px;"><strong>Descripción:</strong><br/> ${displayDesc}</p>
                    <p style="margin-bottom: 8px;"><strong>Estado:</strong> ${item.estado || 'Desconocido'}</p>
                    <p style="margin-bottom: 8px;"><strong>Prioridad:</strong> ${item.prioridad || 'Desconocida'}</p>
                    <p style="margin-bottom: 8px;"><strong>Creada:</strong> ${getFormattedDate(item.created_at)}</p>
                    <p style="margin-bottom: 0;"><strong>Última actualización:</strong> ${getFormattedDate(item.updated_at)}</p>
                </div>
            `,
            icon: 'info',
            width: '650px',
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'Cerrar'
        });
    };

    const handleEdit = (item) => {
        setEditId(item.id);
        setTitle(item.titulo || '');
        setDescription(item.descripcion || '');
        setPriorityId(item.prioridad_id || '');
        setShowModal(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
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

    const getPriorityBadgeStyle = (prioName) => {
        switch (prioName) {
            case 'Baja': return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700';
            case 'Media': return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700';
            case 'Alta': return 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950/80 dark:text-red-200 dark:border-red-700';
            case 'Crítica': case 'Crítico': return 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-700';
            default: return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
        }
    };

    const getStatusStyle = (statusName) => {
        switch (statusName) {
            case 'Pendiente': return 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700';
            case 'En Progreso': case 'En curso': return 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/80 dark:text-orange-200 dark:border-orange-700';
            case 'En revisión': return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700';
            case 'Completada': case 'Finalizado': return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700';
            default: return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
        }
    };

    const getStatusDotColor = (statusName) => {
        switch (statusName) {
            case 'Pendiente': return 'bg-blue-600 dark:bg-blue-400';
            case 'En Progreso': case 'En curso': return 'bg-orange-600 dark:bg-orange-400';
            case 'En revisión': return 'bg-amber-600 dark:bg-amber-400';
            case 'Completada': case 'Finalizado': return 'bg-emerald-600 dark:bg-emerald-400';
            default: return 'bg-slate-600 dark:bg-slate-400';
        }
    };

    return {
        user,
        items,
        estados,
        prioridades,
        title,
        setTitle,
        description,
        setDescription,
        priorityId,
        setPriorityId,
        editId,
        showModal,
        setShowModal,
        filtroEstado,
        setFiltroEstado,
        filtroPrioridad,
        setFiltroPrioridad,
        descRef,
        currentPage,
        setCurrentPage,
        totalPages,
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
