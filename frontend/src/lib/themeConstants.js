/**
 * Constantes y estilos unificados para Estados, Prioridades y Acciones
 * Garantiza total consistencia visual en Dashboard, Gestión de Tareas, Reportes y Bitácora
 */

// 1. MAPA DE COLORES HEXADECIMALES DE ESTADOS
export const ESTADO_COLORS = {
    'Pendiente': '#2563eb',       // Azul vibrante
    'En curso': '#ea580c',        // Naranja vibrante
    'En Progreso': '#ea580c',     // Naranja vibrante (alias)
    'En revisión': '#d97706',     // Ámbar dorado
    'Finalizado': '#16a34a',      // Verde esmeralda
    'Completada': '#16a34a',      // Verde esmeralda (alias)
    'Resueltos': '#16a34a',       // Verde esmeralda (alias)
    'Resuelto': '#16a34a',
    'Pendientes': '#2563eb',
};

// 2. MAPA DE ESTADOS POR ID (1: Pendiente, 2: En curso, 3: En revisión, 4: Finalizado)
export const ESTADO_ID_MAP = {
    1: { id: 1, nombre: 'Pendiente', color: '#2563eb', bgClass: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60', dotClass: 'bg-blue-500' },
    2: { id: 2, nombre: 'En curso', color: '#ea580c', bgClass: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60', dotClass: 'bg-orange-500' },
    3: { id: 3, nombre: 'En revisión', color: '#d97706', bgClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60', dotClass: 'bg-amber-500' },
    4: { id: 4, nombre: 'Finalizado', color: '#16a34a', bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60', dotClass: 'bg-emerald-500' }
};

export const getEstadoBadge = (nombre) => {
    switch (nombre) {
        case 'Pendiente':
        case 'Pendientes':
            return {
                name: 'Pendiente',
                color: '#2563eb',
                badgeClass: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
                dotClass: 'bg-blue-500',
                borderAccent: 'border-l-blue-500'
            };
        case 'En Progreso':
        case 'En curso':
            return {
                name: 'En curso',
                color: '#ea580c',
                badgeClass: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60',
                dotClass: 'bg-orange-500',
                borderAccent: 'border-l-orange-500'
            };
        case 'En revisión':
            return {
                name: 'En revisión',
                color: '#d97706',
                badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
                dotClass: 'bg-amber-500',
                borderAccent: 'border-l-amber-500'
            };
        case 'Completada':
        case 'Finalizado':
        case 'Resueltos':
        case 'Resuelto':
            return {
                name: 'Finalizado',
                color: '#16a34a',
                badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
                dotClass: 'bg-emerald-500',
                borderAccent: 'border-l-emerald-500'
            };
        default:
            return {
                name: nombre || 'Desconocido',
                color: '#64748b',
                badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60',
                dotClass: 'bg-slate-500',
                borderAccent: 'border-l-slate-500'
            };
    }
};

// 3. MAPA DE COLORES HEXADECIMALES DE PRIORIDADES
export const PRIORIDAD_COLORS = {
    'Baja': '#16a34a',           // Verde esmeralda
    'Media': '#ea580c',          // Naranja
    'Alta': '#dc2626',           // Rojo intenso
    'Crítico': '#9333ea',        // Púrpura
    'Crítica': '#9333ea',        // Púrpura (alias)
};

// 4. MAPA DE PRIORIDADES POR ID (1: Baja, 2: Media, 3: Alta, 4: Crítico)
export const PRIORIDAD_ID_MAP = {
    1: { id: 1, nombre: 'Baja', color: '#16a34a', bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60', dotClass: 'bg-emerald-500' },
    2: { id: 2, nombre: 'Media', color: '#ea580c', bgClass: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60', dotClass: 'bg-orange-500' },
    3: { id: 3, nombre: 'Alta', color: '#dc2626', bgClass: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60', dotClass: 'bg-rose-500' },
    4: { id: 4, nombre: 'Crítico', color: '#9333ea', bgClass: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60', dotClass: 'bg-purple-500' }
};

export const getPriorityBadge = (nombre) => {
    switch (nombre) {
        case 'Baja':
            return {
                name: 'Baja',
                color: '#16a34a',
                badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
                dotClass: 'bg-emerald-500'
            };
        case 'Media':
            return {
                name: 'Media',
                color: '#ea580c',
                badgeClass: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60',
                dotClass: 'bg-orange-500'
            };
        case 'Alta':
            return {
                name: 'Alta',
                color: '#dc2626',
                badgeClass: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
                dotClass: 'bg-rose-500'
            };
        case 'Crítica':
        case 'Crítico':
            return {
                name: 'Crítico',
                color: '#9333ea',
                badgeClass: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60',
                dotClass: 'bg-purple-500'
            };
        default:
            return {
                name: nombre || 'Normal',
                color: '#64748b',
                badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60',
                dotClass: 'bg-slate-500'
            };
    }
};

// 5. MAPA DE ACCIONES DE AUDITORÍA (CREAR, ACTUALIZAR, ELIMINAR_LOGICO, RESTAURAR)
export const getActionMeta = (tipo, modulo) => {
    const isUser = modulo === 'usuarios';
    switch (tipo) {
        case 'CREAR':
            return {
                label: isUser ? 'Nuevo Usuario' : 'Nueva Tarea',
                verb: 'creó',
                icon: 'bi-plus-circle-fill',
                badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
                avatarBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
                dotColor: 'bg-emerald-500',
                accentColor: '#10b981'
            };
        case 'ACTUALIZAR':
            return {
                label: 'Actualización',
                verb: 'actualizó',
                icon: 'bi-pencil-square',
                badgeBg: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
                avatarBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
                dotColor: 'bg-blue-500',
                accentColor: '#3b82f6'
            };
        case 'ELIMINAR_LOGICO':
            return {
                label: isUser ? 'Desactivación' : 'Eliminación',
                verb: isUser ? 'desactivó' : 'eliminó',
                icon: isUser ? 'bi-person-x-fill' : 'bi-trash3-fill',
                badgeBg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
                avatarBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
                dotColor: 'bg-rose-500',
                accentColor: '#f43f5e'
            };
        case 'RESTAURAR':
            return {
                label: isUser ? 'Reactivación' : 'Restauración',
                verb: isUser ? 'reactivó' : 'restauró',
                icon: isUser ? 'bi-person-check-fill' : 'bi-arrow-counterclockwise',
                badgeBg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
                avatarBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
                dotColor: 'bg-amber-500',
                accentColor: '#f59e0b'
            };
        default:
            return {
                label: 'Acción',
                verb: 'modificó',
                icon: 'bi-lightning-charge-fill',
                badgeBg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60',
                avatarBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/40',
                dotColor: 'bg-slate-500',
                accentColor: '#64748b'
            };
    }
};

export const ROLES_MAP = {
    1: 'Administrador',
    2: 'Empleado'
};
