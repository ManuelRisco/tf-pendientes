import PropTypes from 'prop-types';
import { ESTADO_ID_MAP, PRIORIDAD_ID_MAP, ROLES_MAP } from "../../../lib/themeConstants";

export default function MovimientoChangeDiff({ mov }) {
    if (!mov?.detalles) return null;
    const { anterior = {}, nuevo = {} } = mov.detalles;
    const isUser = mov.modulo === 'usuarios';

    if (mov.tipo_accion === 'ACTUALIZAR' && !isUser) {
        const hasEstadoChanged = anterior?.estado_id && nuevo?.estado_id && anterior.estado_id !== nuevo.estado_id;
        const hasPrioridadChanged = anterior?.prioridad_id && nuevo?.prioridad_id && anterior.prioridad_id !== nuevo.prioridad_id;
        const hasTituloChanged = anterior?.titulo && nuevo?.titulo && anterior.titulo !== nuevo.titulo;

        const estadoOld = ESTADO_ID_MAP[anterior.estado_id];
        const estadoNew = ESTADO_ID_MAP[nuevo.estado_id];
        const prioridadOld = PRIORIDAD_ID_MAP[anterior.prioridad_id];
        const prioridadNew = PRIORIDAD_ID_MAP[nuevo.prioridad_id];

        if (hasEstadoChanged || hasPrioridadChanged || hasTituloChanged) {
            return (
                <div className="flex flex-wrap items-center gap-2 mt-1.5 pt-1.5 border-t border-dashed" style={{ borderColor: 'var(--border-color)' }}>
                    {hasEstadoChanged && estadoOld && estadoNew && (
                        <div className="inline-flex items-center gap-1 text-xs">
                            <span className="text-[11px] opacity-60" style={{ color: 'var(--text-secondary)' }}>Estado:</span>
                            <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${estadoOld.bgClass}`}>
                                {estadoOld.nombre}
                            </span>
                            <i className="bi bi-arrow-right text-[10px] opacity-40"></i>
                            <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${estadoNew.bgClass}`}>
                                {estadoNew.nombre}
                            </span>
                        </div>
                    )}
                    {hasPrioridadChanged && prioridadOld && prioridadNew && (
                        <div className="inline-flex items-center gap-1 text-xs">
                            <span className="text-[11px] opacity-60" style={{ color: 'var(--text-secondary)' }}>Prioridad:</span>
                            <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${prioridadOld.bgClass}`}>
                                {prioridadOld.nombre}
                            </span>
                            <i className="bi bi-arrow-right text-[10px] opacity-40"></i>
                            <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${prioridadNew.bgClass}`}>
                                {prioridadNew.nombre}
                            </span>
                        </div>
                    )}
                    {hasTituloChanged && (
                        <span className="text-[11px] italic text-blue-600 dark:text-blue-400">
                            <i className="bi bi-pencil-fill text-[9px] mr-1"></i>
                            Título actualizado
                        </span>
                    )}
                </div>
            );
        }
    }

    if (mov.tipo_accion === 'CREAR' && !isUser) {
        const estado = ESTADO_ID_MAP[nuevo.estado_id];
        const prioridad = PRIORIDAD_ID_MAP[nuevo.prioridad_id];
        if (estado || prioridad) {
            return (
                <div className="flex flex-wrap items-center gap-2 mt-1.5 pt-1.5 border-t border-dashed" style={{ borderColor: 'var(--border-color)' }}>
                    {estado && (
                        <div className="inline-flex items-center gap-1 text-xs">
                            <span className="text-[11px] opacity-60" style={{ color: 'var(--text-secondary)' }}>Estado inicial:</span>
                            <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${estado.bgClass}`}>
                                {estado.nombre}
                            </span>
                        </div>
                    )}
                    {prioridad && (
                        <div className="inline-flex items-center gap-1 text-xs">
                            <span className="text-[11px] opacity-60" style={{ color: 'var(--text-secondary)' }}>Prioridad:</span>
                            <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${prioridad.bgClass}`}>
                                {prioridad.nombre}
                            </span>
                        </div>
                    )}
                </div>
            );
        }
    }

    if (mov.tipo_accion === 'ACTUALIZAR' && isUser) {
        const hasRolChanged = anterior?.rol_id && nuevo?.rol_id && anterior.rol_id !== nuevo.rol_id;
        if (hasRolChanged) {
            return (
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5 pt-1.5 border-t border-dashed text-xs" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[11px] opacity-60" style={{ color: 'var(--text-secondary)' }}>Rol:</span>
                    <span className="px-2 py-0.5 rounded-md font-medium text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {ROLES_MAP[anterior.rol_id] || 'Rol'}
                    </span>
                    <i className="bi bi-arrow-right text-[10px] opacity-40"></i>
                    <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {ROLES_MAP[nuevo.rol_id] || 'Rol'}
                    </span>
                </div>
            );
        }
    }

    return null;
}

MovimientoChangeDiff.propTypes = {
    mov: PropTypes.object
};
