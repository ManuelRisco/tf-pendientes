import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

export function useUsuarios() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroRol, setFiltroRol] = useState('');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 10;

    // Estados para el Modal CRUD
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        rol_id: ''
    });

    const handleEditClick = useCallback((u) => {
        if (!u) return;
        setEditId(u.id);
        setFormData({
            nombre: u.nombre || '',
            apellido: u.apellido || '',
            email: u.email || '',
            password: '',
            rol_id: u.rol_id || ''
        });
        setShowModal(true);
    }, []);

    // Debounce para el input de búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    // Resetear a la página 1 cuando cambia algún filtro
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, filtroEstado, filtroRol]);

    // Cargar usuarios con filtros y paginación
    const fetchUsuarios = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: limit,
            };

            if (debouncedSearch.trim()) {
                params.search = debouncedSearch.trim();
            }
            if (filtroEstado && filtroEstado !== 'todos') {
                params.estado = filtroEstado;
            }
            if (filtroRol) {
                params.rol_id = filtroRol;
            }

            const res = await api.get('/usuarios', { params });
            const data = res.data.data;
            setUsuarios(data.items || []);
            setTotalPages(data.meta?.totalPages || 1);
            setTotalCount(data.meta?.total || 0);
        } catch (error) {
            console.error("Error fetching usuarios", error);
            Swal.fire('Error', 'No se pudieron cargar los usuarios o no tienes permisos.', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, filtroEstado, filtroRol, limit]);

    // Cargar catálogos de roles
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const res = await api.get('/catalogos');
                if (res.data?.data?.roles) {
                    setRoles(res.data.data.roles);
                }
            } catch (error) {
                console.error("Error fetching catálogos", error);
            }
        };
        fetchCatalogos();
    }, []);

    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);

    const handleClearFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setFiltroEstado('todos');
        setFiltroRol('');
        setCurrentPage(1);
    };

    const hasActiveFilters = search.trim() !== '' || filtroEstado !== 'todos' || filtroRol !== '';

    const getFormattedDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getInitials = (nombre, apellido) => {
        const n = (nombre || '').trim().charAt(0).toUpperCase();
        const a = (apellido || '').trim().charAt(0).toUpperCase();
        return `${n}${a}` || 'U';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setEditId(null);
        setFormData({ nombre: '', apellido: '', email: '', password: '', rol_id: '' });
        setShowModal(false);
    };

    const handleCreateClick = () => {
        resetForm();
        setShowModal(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        
        const actionTitle = editId ? '¿Guardar cambios?' : '¿Crear usuario?';
        const actionText = editId ? 'Se actualizarán los datos del usuario.' : 'Se añadirá un nuevo usuario al sistema.';

        Swal.fire({
            title: actionTitle,
            text: actionText,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const payload = { ...formData };
                    if (editId && !payload.password) {
                        delete payload.password;
                    }

                    if (editId) {
                        await api.put(`/usuarios/${editId}`, payload);
                        Swal.fire({ icon: 'success', title: 'Usuario actualizado', timer: 1500, showConfirmButton: false });
                        
                        if (user && user.id === editId) {
                            await Swal.fire({
                                title: 'Sesión expirada',
                                text: 'Tus datos han cambiado, por favor vuelve a iniciar sesión.',
                                icon: 'info',
                                confirmButtonText: 'Entendido'
                            });
                            logout();
                            navigate('/login');
                            return;
                        }
                    } else {
                        await api.post('/usuarios', payload);
                        Swal.fire({ icon: 'success', title: 'Usuario creado', timer: 1500, showConfirmButton: false });
                    }
                    
                    resetForm();
                    fetchUsuarios();
                } catch (error) {
                    Swal.fire('Error', error.response?.data?.message || 'Error al guardar usuario', 'error');
                }
            }
        });
    };

    const handleDeleteClick = (id) => {
        if (user && Number(user.id) === Number(id)) {
            Swal.fire('Error', 'No puedes desactivarte a ti mismo.', 'error');
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: "El usuario será desactivado del sistema.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, desactivar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/usuarios/${id}`);
                    fetchUsuarios();
                    Swal.fire({ icon: 'success', title: 'Usuario desactivado', timer: 1500, showConfirmButton: false });
                } catch (error) {
                    Swal.fire('Error', error.response?.data?.message || 'Error al desactivar usuario', 'error');
                }
            }
        });
    };

    const handleRestoreClick = (id) => {
        Swal.fire({
            title: '¿Reactivar usuario?',
            text: "El usuario recuperará su acceso al sistema.",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, reactivar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.patch(`/usuarios/${id}/restaurar`);
                    fetchUsuarios();
                    Swal.fire({ icon: 'success', title: 'Usuario reactivado', timer: 1500, showConfirmButton: false });
                } catch (error) {
                    Swal.fire('Error', error.response?.data?.message || 'Error al reactivar usuario', 'error');
                }
            }
        });
    };

    return {
        user,
        usuarios,
        roles,
        loading,
        search,
        setSearch,
        filtroEstado,
        setFiltroEstado,
        filtroRol,
        setFiltroRol,
        currentPage,
        setCurrentPage,
        totalPages,
        totalCount,
        showModal,
        editId,
        formData,
        handleInputChange,
        handleCreateClick,
        handleEditClick,
        handleSaveUser,
        handleDeleteClick,
        handleRestoreClick,
        handleClearFilters,
        hasActiveFilters,
        getFormattedDate,
        getInitials,
        resetForm
    };
}
