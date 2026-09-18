import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../../lib/dateUtils';
import { useTheme } from '../../../context/ThemeContext';
import { ESTADO_ID_MAP, PRIORIDAD_ID_MAP, getActionMeta, ROLES_MAP } from '../../../lib/themeConstants';

export default function ActividadReciente({ actividadReciente = [], isUpdating = false, onRefresh, getTimeAgo, isAdmin = false }) {
    const { isDarkMode } = useTheme();
    const [filtroModulo, setFiltroModulo] = useState('todos'); // 'todos' | 'tareas' | 'usuarios'
    const [searchQuery, setSearchQuery] = useState('');

    // Contadores para pestañas
    const countTareas = useMemo(() => actividadReciente.filter(m => m.modulo === 'tareas').length, [actividadReciente]);
    const countUsuarios = useMemo(() => actividadReciente.filter(m => m.modulo === 'usuarios').length, [actividadReciente]);

    // Filtrar actividad según categoría y búsqueda
    const filteredList = useMemo(() => {
        return (Array.isArray(actividadReciente) ? actividadReciente : []).filter(item => {
            if (filtroModulo !== 'todos' && item.modulo !== filtroModulo) return false;

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const userName = `${item.persona_nombre || ''} ${item.persona_apellido || ''}`.toLowerCase();
                const userEmail = (item.email || '').toLowerCase();
                const action = (item.tipo_accion || '').toLowerCase();
                const title = (item.detalles?.nuevo?.titulo || item.detalles?.anterior?.titulo || '').toLowerCase();
                const emailTarget = (item.detalles?.nuevo?.email || item.detalles?.anterior?.email || '').toLowerCase();

                return userName.includes(query) || userEmail.includes(query) || action.includes(query) || title.includes(query) || emailTarget.includes(query);
            }

            return true;
        });
    }, [actividadReciente, filtroModulo, searchQuery]);

    // Clases de pestañas
    const getTabClass = (active) => {
        if (active) {
            return isDarkMode
                ? 'bg-slate-800 text-blue-400 font-semibold shadow-xs border border-slate-700/60'
                : 'bg-white text-blue-600 font-semibold shadow-xs border border-slate-200';
        }
        return isDarkMode
            ? 'text-slate-400 hover:text-slate-200 border-0 bg-transparent'
            : 'text-slate-600 hover:text-slate-900 border-0 bg-transparent';
    };

    // Detalle de cambios
    const renderChangeDetails = (item) => {
        if (!item.detalles) return null;
        const { anterior = {}, nuevo = {} } = item.detalles;
        const isUser = item.modulo === 'usuarios';

        if (item.tipo_accion === 'ACTUALIZAR' && !isUser) {
            const hasEstadoChanged = anterior?.estado_id && nuevo?.estado_id && anterior.estado_id !== nuevo.estado_id;
            const hasPrioridadChanged = anterior?.prioridad_id && nuevo?.prioridad_id && anterior.prioridad_id !== nuevo.prioridad_id;
            const hasTituloChanged = anterior?.titulo && nuevo?.titulo && anterior.titulo !== nuevo.titulo;

            const estadoOld = ESTADO_ID_MAP[anterior.estado_id];
            const estadoNew = ESTADO_ID_MAP[nuevo.estado_id];
            const prioridadOld = PRIORIDAD_ID_MAP[anterior.prioridad_id];
            const prioridadNew = PRIORIDAD_ID_MAP[nuevo.prioridad_id];

            if (hasEstadoChanged || hasPrioridadChanged || hasTituloChanged) {
                return (
                    <div className={`flex flex-wrap items-center gap-1.5 mt-1 pt-1 border-t border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        {hasEstadoChanged && estadoOld && estadoNew && (
                            <div className="inline-flex items-center gap-1 text-[10px]">
                                <span className={`opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Estado:</span>
                                <span className={`px-1.5 py-0.2 rounded border font-semibold ${estadoOld.bgClass}`}>{estadoOld.nombre}</span>
                                <i className="bi bi-arrow-right text-[10px] opacity-40"></i>
                                <span className={`px-1.5 py-0.2 rounded border font-semibold ${estadoNew.bgClass}`}>{estadoNew.nombre}</span>
                            </div>
                        )}
                        {hasPrioridadChanged && prioridadOld && prioridadNew && (
                            <div className="inline-flex items-center gap-1 text-[10px]">
                                <span className={`opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Prioridad:</span>
                                <span className={`px-1.5 py-0.2 rounded border font-semibold ${prioridadOld.bgClass}`}>{prioridadOld.nombre}</span>
                                <i className="bi bi-arrow-right text-[10px] opacity-40"></i>
                                <span className={`px-1.5 py-0.2 rounded border font-semibold ${prioridadNew.bgClass}`}>{prioridadNew.nombre}</span>
                            </div>
                        )}
                        {hasTituloChanged && (
                            <span className={`text-[10px] italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Título modificado
                            </span>
                        )}
                    </div>
                );
            }
        }

        if (item.tipo_accion === 'CREAR' && !isUser) {
            const estado = ESTADO_ID_MAP[nuevo.estado_id];
            const prioridad = PRIORIDAD_ID_MAP[nuevo.prioridad_id];
            return (
                <div className={`flex flex-wrap items-center gap-1.5 mt-1 pt-1 border-t border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    {estado && (
                        <div className="inline-flex items-center gap-1 text-[10px]">
                            <span className={`opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Estado:</span>
                            <span className={`px-1.5 py-0.2 rounded border font-semibold ${estado.bgClass}`}>{estado.nombre}</span>
                        </div>
                    )}
                    {prioridad && (
                        <div className="inline-flex items-center gap-1 text-[10px]">
                            <span className={`opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Prioridad:</span>
                            <span className={`px-1.5 py-0.2 rounded border font-semibold ${prioridad.bgClass}`}>{prioridad.nombre}</span>
                        </div>
                    )}
                </div>
            );
        }

        if (item.tipo_accion === 'ACTUALIZAR' && isUser) {
            const hasRolChanged = anterior?.rol_id && nuevo?.rol_id && anterior.rol_id !== nuevo.rol_id;
            if (hasRolChanged) {
                return (
                    <div className={`flex flex-wrap items-center gap-1 mt-1 pt-1 border-t border-dashed text-[10px] ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <span className={`opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Rol:</span>
                        <span className={`px-1.5 py-0.2 rounded border font-medium ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700/60' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{ROLES_MAP[anterior.rol_id] || 'Rol'}</span>
                        <i className="bi bi-arrow-right text-[10px] opacity-40"></i>
                        <span className={`px-1.5 py-0.2 rounded border font-semibold ${isDarkMode ? 'bg-blue-950/50 text-blue-300 border-blue-800/60' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{ROLES_MAP[nuevo.rol_id] || 'Rol'}</span>
                    </div>
                );
            }
        }

        return null;
    };

    return (
        <div className="card-app p-3.5 sm:p-5 flex flex-col justify-between h-full relative overflow-hidden transition-all duration-200">
            {/* Cabecera */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-blue-600/20 text-blue-400 border border-blue-900/50' : 'bg-blue-600/10 text-blue-600 border border-blue-200'}`}>
                        <i className="bi bi-activity text-base"></i>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className={`text-sm sm:text-base font-bold tracking-tight m-0 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                Actividad Reciente
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={isUpdating}
                            title="Actualizar actividad"
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${isDarkMode
                                ? 'bg-slate-800/90 text-slate-300 border border-slate-700/60 hover:bg-slate-700'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <i className={`bi bi-arrow-clockwise text-blue-500 ${isUpdating ? 'animate-spin' : ''}`}></i>
                            <span className="hidden sm:inline text-[11px]">Actualizar</span>
                        </button>
                    )}

                    <Link
                        to="/movimientos"
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-all no-underline cursor-pointer active:scale-95 ${isDarkMode
                            ? 'bg-blue-950/50 text-blue-300 border border-blue-900/60 hover:bg-blue-900/70'
                            : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                            }`}
                    >
                        <span>Movimientos</span>
                        <i className="bi bi-arrow-right text-[10px]"></i>
                    </Link>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 my-2.5">
                <div className={`flex items-center gap-0.5 p-0.5 rounded-lg border w-fit ${isDarkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-100/90'}`}>
                    <button
                        onClick={() => setFiltroModulo('todos')}
                        className={`px-2 py-0.5 rounded-md text-[11px] transition-all cursor-pointer ${getTabClass(filtroModulo === 'todos')}`}
                    >
                        Todos ({actividadReciente.length})
                    </button>
                    <button
                        onClick={() => setFiltroModulo('tareas')}
                        className={`px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 transition-all cursor-pointer ${getTabClass(filtroModulo === 'tareas')}`}
                    >
                        <i className="bi bi-clipboard-check text-[10px]"></i>
                        <span>Tareas ({countTareas})</span>
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setFiltroModulo('usuarios')}
                            className={`px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 transition-all cursor-pointer ${getTabClass(filtroModulo === 'usuarios')}`}
                        >
                            <i className="bi bi-people text-[10px]"></i>
                            <span>Usuarios ({countUsuarios})</span>
                        </button>
                    )}
                </div>

                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs w-full sm:w-48 transition-all ${isDarkMode
                    ? 'bg-slate-900/70 border-slate-800 text-slate-200 focus-within:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus-within:border-blue-500'
                    }`}>
                    <i className={`bi bi-search text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}></i>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`bg-transparent border-0 outline-none shadow-none text-[11px] w-full ${isDarkMode ? 'text-slate-200 placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'}`}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className={`text-xs cursor-pointer border-0 bg-transparent ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'}`}
                        >
                            <i className="bi bi-x"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Lista de actividad */}
            <div className="flex-1 overflow-y-auto pr-1 max-h-[380px] min-h-[240px] space-y-2">
                {filteredList.length > 0 ? (
                    filteredList.map((mov, index) => {
                        const meta = getActionMeta(mov.tipo_accion, mov.modulo);
                        const isUser = mov.modulo === 'usuarios';
                        const nombreCompleto = mov.persona_nombre
                            ? `${mov.persona_nombre} ${mov.persona_apellido || ''}`.trim()
                            : (mov.email || 'Sistema');
                        const initial = (nombreCompleto || 'S').charAt(0).toUpperCase();

                        const dataTarget = mov.detalles?.nuevo || mov.detalles?.anterior || {};
                        const targetName = isUser
                            ? (dataTarget.email || `Usuario #${mov.registro_id}`)
                            : (dataTarget.titulo || `Tarea #${mov.registro_id}`);

                        return (
                            <div
                                key={mov.id || index}
                                className={`group relative p-2 sm:p-2.5 rounded-lg border transition-all duration-150 ${isDarkMode
                                    ? 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700'
                                    : 'border-slate-200/80 bg-slate-50/50 hover:border-slate-300'
                                    }`}
                            >
                                <div className="flex items-start gap-2.5">
                                    {/* Avatar con Inicial e Indicador de Acción */}
                                    <div className="relative shrink-0 mt-0.5">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] border shadow-2xs ${meta.avatarBg}`}>
                                            {initial}
                                        </div>
                                        <span
                                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[7px] text-white shadow-2xs ${meta.dotColor}`}
                                            title={meta.label}
                                        >
                                            <i className={`bi ${meta.icon} text-[7px]`}></i>
                                        </span>
                                    </div>

                                    {/* Contenido Principal de la Actividad Comprimido */}
                                    <div className="flex-1 min-w-0">
                                        {/* Fila Superior: Usuario, Acción, Módulo y Tiempo */}
                                        <div className="flex items-center justify-between gap-1">
                                            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                                <span className={`font-bold text-xs truncate max-w-[150px] ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    {nombreCompleto}
                                                </span>
                                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold border ${meta.badgeBg}`}>
                                                    <i className={`bi ${meta.icon} text-[8px]`}></i>
                                                    {meta.verb}
                                                </span>
                                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-medium border ${isDarkMode
                                                    ? 'bg-slate-800/80 text-slate-400 border-slate-700/60'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                    {isUser ? 'Usuario' : 'Tarea'}
                                                </span>
                                            </div>

                                            {/* Tiempo Relativo */}
                                            <div className={`flex items-center gap-1 text-[10px] shrink-0 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                <i className="bi bi-clock text-[9px] opacity-60"></i>
                                                <span>{getTimeAgo(mov.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Título o Nombre del Objeto Afectado */}
                                        <div className="mt-0.5">
                                            <p className={`text-[11px] font-medium m-0 truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                                <span className={`opacity-60 mr-1 text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{isUser ? 'Cuenta:' : 'Tarea:'}</span>
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">“{targetName}”</span>
                                            </p>
                                        </div>

                                        {/* Metadatos / Cambios específicos */}
                                        {renderChangeDetails(mov)}

                                        {/* Subtexto con fecha exacta */}
                                        <div className={`mt-0.5 flex items-center justify-between text-[9px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                            <span>#{mov.registro_id || mov.id}</span>
                                            <span>{formatDateTime(mov.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    /* Estado Vacío Elegante */
                    <div className={`flex flex-col items-center justify-center py-8 px-3 text-center rounded-xl border border-dashed my-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                            <i className="bi bi-inbox text-lg"></i>
                        </div>
                        <h4 className={`text-xs font-bold m-0 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            No hay actividad reciente
                        </h4>
                        <p className={`text-[11px] mt-0.5 max-w-xs m-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {searchQuery
                                ? `Sin resultados para "${searchQuery}".`
                                : 'Las acciones realizadas en el sistema se reflejarán automáticamente aquí.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Pie de Actividad */}
            <div className={`pt-2 mt-1.5 border-t flex items-center justify-between text-[10px] ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <span>
                    <strong>{filteredList.length}</strong> de <strong>{actividadReciente.length}</strong> eventos
                </span>
            </div>
        </div>
    );
}
