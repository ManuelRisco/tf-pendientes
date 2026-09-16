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
    const [submitting, setSubmitting] = useState(false);
    // Respuesta técnica (Admin)
    const [responseText, setResponseText] = useState('');
    const [responseStatusId, setResponseStatusId] = useState('');
    const [savingResponse, setSavingResponse] = useState(false);
    const responseInputRef = useRef(null);

    // Imágenes adjuntas
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [viewItem, setViewItem] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [scrollTarget, setScrollTarget] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);

    // Filtros
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const [filtroAlcance, setFiltroAlcance] = useState('todos'); // 'todos', 'mis_tareas', 'por_otros_usuarios'
    const [filtroUsuarioId, setFiltroUsuarioId] = useState('');
    const descRef = useRef(null);
    const fileInputRef = useRef(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTasksCount, setTotalTasksCount] = useState(0);
    const limit = 10;

    // Búsqueda con debounce
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

    // Subida y validación de imágenes (máx. 5)
    const handleFileSelect = (rawFiles) => {
        const fileList = Array.from(rawFiles || []);
        if (fileList.length === 0) return;

        const maxTotal = 5;
        const totalActual = existingImages.length + selectedFiles.length;
        const disponibles = maxTotal - totalActual;

        if (disponibles <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Límite alcanzado',
                text: `Este ticket ya alcanzó el límite máximo de ${maxTotal} imágenes.`,
                confirmButtonColor: '#2563eb'
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        if (fileList.length > disponibles) {
            Swal.fire({
                icon: 'warning',
                title: 'Demasiadas imágenes',
                text: `Solo puedes adjuntar ${disponibles} imagen(es) más. Seleccionaste ${fileList.length}.`,
                confirmButtonColor: '#2563eb'
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        const maxSizeBytes = 5 * 1024 * 1024; // 5MB
        const validNewFiles = [];
        const newPreviews = [];

        for (const file of fileList) {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            const isImage = file.type.startsWith('image/') || validExtensions.includes(ext);

            if (!isImage || !validExtensions.includes(ext)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Formato no permitido',
                    text: `El archivo "${file.name}" no es una imagen válida. Formatos permitidos: JPG, PNG, WEBP, GIF.`,
                    confirmButtonColor: '#2563eb'
                });
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            if (file.size > maxSizeBytes) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                Swal.fire({
                    icon: 'error',
                    title: 'Imagen muy pesada',
                    text: `La imagen "${file.name}" pesa ${sizeMB}MB. El peso máximo por imagen es de 5MB.`,
                    confirmButtonColor: '#2563eb'
                });
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            validNewFiles.push(file);
            newPreviews.push({
                file,
                previewUrl: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
            });
        }

        setSelectedFiles(prev => [...prev, ...validNewFiles]);
        setFilePreviews(prev => [...prev, ...newPreviews]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveSelectedFile = (index) => {
        if (filePreviews[index]?.previewUrl) {
            URL.revokeObjectURL(filePreviews[index].previewUrl);
        }
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setFilePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteExistingImage = (imagenId) => {
        Swal.fire({
            title: '¿Eliminar imagen?',
            text: 'Esta evidencia se eliminará permanentemente del ticket.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/tareas/${editId}/imagenes/${imagenId}`);
                    setExistingImages(prev => prev.filter(img => img.id !== imagenId));
                    fetchTareas();
                    Swal.fire({
                        icon: 'success',
                        title: 'Imagen eliminada',
                        timer: 1200,
                        showConfirmButton: false
                    });
                } catch (error) {
                    const errorMsg = error.response?.data?.message || 'No se pudo eliminar la imagen';
                    Swal.fire('Error', errorMsg, 'error');
                }
            }
        });
    };

    // Guardar tarea (crear o actualizar)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !priorityId) {
            Swal.fire('Error', 'El título y la prioridad son obligatorios', 'error');
            return;
        }

        const totalImagenes = existingImages.length + selectedFiles.length;
        if (totalImagenes > 5) {
            Swal.fire('Límite excedido', 'Un ticket no puede superar un total de 5 imágenes.', 'error');
            return;
        }

        if (editId) {
            // Actualizar tarea existente
            Swal.fire({
                title: '¿Actualizar tarea?',
                text: selectedFiles.length > 0
                    ? `Se guardarán los datos y se subirán ${selectedFiles.length} imagen(es) adicional(es).`
                    : "Se guardarán los cambios de la tarea.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#2563eb',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Sí, guardar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        setSubmitting(true);
                        // 1. Guardar cambios del ticket
                        const updatePayload = {
                            titulo: title.trim(),
                            descripcion: description.trim(),
                            prioridad_id: priorityId
                        };
                        await api.put(`/tareas/${editId}`, updatePayload);

                        // 2. Subir imágenes nuevas si se adjuntaron
                        if (selectedFiles.length > 0) {
                            const formData = new FormData();
                            selectedFiles.forEach(file => {
                                formData.append('imagenes[]', file);
                            });
                            await api.post(`/tareas/${editId}/imagenes`, formData);
                        }

                        fetchTareas();
                        resetForm();
                        Swal.fire({ icon: 'success', title: 'Tarea actualizada', timer: 1500, showConfirmButton: false });
                    } catch (error) {
                        const errorMsg = error.response?.data?.message || 'No se pudo actualizar la tarea';
                        Swal.fire('Error', errorMsg, 'error');
                    } finally {
                        setSubmitting(false);
                    }
                }
            });
        } else {
            // Creación de nueva tarea con imágenes
            try {
                setSubmitting(true);
                const formData = new FormData();
                formData.append('titulo', title.trim());
                formData.append('descripcion', description.trim());
                formData.append('prioridad_id', priorityId);
                formData.append('estado_id', 1);

                selectedFiles.forEach(file => {
                    formData.append('imagenes[]', file);
                });

                await api.post('/tareas', formData);
                fetchTareas();
                resetForm();
                Swal.fire({ icon: 'success', title: 'Tarea creada con éxito', timer: 1500, showConfirmButton: false });
            } catch (error) {
                const errorMsg = error.response?.data?.message || 'No se pudo crear la tarea';
                Swal.fire('Error', errorMsg, 'error');
            } finally {
                setSubmitting(false);
            }
        }
    };

    const resetForm = () => {
        filePreviews.forEach(p => {
            if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
        });
        setSelectedFiles([]);
        setFilePreviews([]);
        setExistingImages([]);
        setEditId(null);
        setTitle('');
        setDescription('');
        setPriorityId('');
        if (fileInputRef.current) fileInputRef.current.value = '';
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
                    await api.put(`/tareas/${id}`, {
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

    const handleView = (item, target = null) => {
        setViewItem(item);
        setResponseText('');
        setResponseStatusId(item.estado_id || 1);
        setScrollTarget(target);
        setShowViewModal(true);
    };

    const handleEdit = (item) => {
        if (Number(item.usuario_id) !== Number(user?.id)) {
            Swal.fire('Acceso denegado', 'Solo el creador del ticket puede editar su contenido.', 'warning');
            return;
        }
        filePreviews.forEach(p => {
            if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
        });
        setSelectedFiles([]);
        setFilePreviews([]);
        setEditId(item.id);
        setTitle(item.titulo);
        setDescription(item.descripcion || '');
        setPriorityId(item.prioridad_id);
        setExistingImages(item.imagenes || []);
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

    // Responder ticket desde el modal de detalle
    const handleOpenQuickResponse = (item) => {
        setViewItem(item);
        setResponseText('');
        setResponseStatusId(item.estado_id || 1);
        setShowViewModal(true);
        setTimeout(() => {
            if (responseInputRef.current) {
                responseInputRef.current.focus();
                responseInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 250);
    };

    const handleSaveQuickResponse = async (e) => {
        if (e) e.preventDefault();
        if (!viewItem) return;

        if (!responseText.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Respuesta vacía',
                text: 'Por favor escribe una respuesta para el ticket.',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }

        try {
            setSavingResponse(true);
            const payload = {
                respuesta_admin: responseText.trim(),
            };
            if (responseStatusId) {
                payload.estado_id = Number(responseStatusId);
            }
            await api.put(`/tareas/${viewItem.id}`, payload);

            // Recargar datos actualizados del ticket
            try {
                const resDetail = await api.get(`/tareas/${viewItem.id}`);
                if (resDetail.data?.data) {
                    setViewItem(resDetail.data.data);
                    setResponseStatusId(resDetail.data.data.estado_id || 1);
                }
            } catch (errDetail) {
                console.error("Error recargando detalle de tarea", errDetail);
            }

            setResponseText('');
            fetchTareas();
            Swal.fire({
                icon: 'success',
                title: 'Respuesta guardada',
                text: 'La respuesta se agregó correctamente.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'No se pudo guardar la respuesta';
            Swal.fire('Error', errorMsg, 'error');
        } finally {
            setSavingResponse(false);
        }
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
        submitting,
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
        fileInputRef,
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
        getStatusDotColor,
        // Imágenes
        selectedFiles,
        filePreviews,
        existingImages,
        handleFileSelect,
        handleRemoveSelectedFile,
        handleDeleteExistingImage,
        viewItem,
        setViewItem,
        showViewModal,
        setShowViewModal,
        scrollTarget,
        setScrollTarget,
        lightboxImage,
        setLightboxImage,
        // Respuesta Integrada y Seguimiento en Detalle (Solo Admin)
        responseText,
        setResponseText,
        responseStatusId,
        setResponseStatusId,
        savingResponse,
        responseInputRef,
        handleOpenQuickResponse,
        handleSaveQuickResponse,
    };
}
