import { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { getActionMeta } from '../../../lib/themeConstants';
import { formatDateTime, getTimeAgo } from '../../../lib/dateUtils';

export default function MovimientoDetailModal({
    movimiento,
    show,
    onClose,
    onNavigateToTask,
    getActionText
}) {
    const [showRawJson, setShowRawJson] = useState(false);

    if (!movimiento) return null;

    const mov = movimiento;
    const meta = getActionMeta(mov.tipo_accion, mov.modulo);
    const isTarea = mov.modulo === 'tareas' && mov.registro_id;
    const nombreCompleto = mov.persona_nombre
        ? `${mov.persona_nombre} ${mov.persona_apellido || ''}`.trim()
        : (mov.email || 'Sistema / Automático');
    const initial = (nombreCompleto || 'S').charAt(0).toUpperCase();

    const detalles = mov.detalles || {};
    const anterior = detalles.anterior || {};
    const nuevo = detalles.nuevo || {};
    const allKeys = [...new Set([...Object.keys(anterior), ...Object.keys(nuevo)])];

    return (
        <Modal
            show={show}
            onHide={() => {
                setShowRawJson(false);
                onClose();
            }}
            centered
            size="lg"
        >
            <Modal.Header closeButton className="border-b">
                <div className="flex items-center gap-2.5 min-w-0 pr-4">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        #{mov.id}
                    </span>
                    <Modal.Title className="text-base sm:text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                        Detalle de Auditoría
                    </Modal.Title>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badgeBg}`}>
                        <i className={`bi ${meta.icon}`}></i>
                        <span>{meta.label}</span>
                    </span>
                </div>
            </Modal.Header>

            <Modal.Body className="p-4 sm:p-6 space-y-4">
                {/* Datos del autor y fecha */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl border flex items-center gap-2.5" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                        <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border ${meta.avatarBg}`}>
                            {initial}
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Autor</span>
                            <span className="font-semibold truncate block" style={{ color: 'var(--text-primary)' }}>
                                {nombreCompleto}
                            </span>
                            {mov.email && (
                                <a href={`mailto:${mov.email}`} className="text-[11px] truncate block text-blue-600 dark:text-blue-400 hover:underline">
                                    {mov.email}
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="p-3 rounded-xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Módulo & Objeto</span>
                        <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
                            <span className="capitalize">{mov.modulo}</span>
                            <span>#{mov.registro_id}</span>
                        </div>
                        {isTarea && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onNavigateToTask(mov.registro_id);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-1 bg-transparent border-0 p-0 cursor-pointer"
                            >
                                <span>Ver en Gestión de Tareas</span>
                                <i className="bi bi-box-arrow-up-right text-[10px]"></i>
                            </button>
                        )}
                    </div>

                    <div className="p-3 rounded-xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Fecha y Hora</span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {formatDateTime(mov.created_at)}
                        </span>
                        <span className="text-[11px] opacity-60 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                            <i className="bi bi-clock"></i>
                            <span>{getTimeAgo(mov.created_at)}</span>
                        </span>
                    </div>
                </div>

                {/* Descripción legible */}
                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                    <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                        <i className="bi bi-card-text text-blue-600"></i>
                        <span>Descripción del Evento</span>
                    </div>
                    <p className="text-xs sm:text-sm m-0 font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {getActionText(mov)}
                    </p>
                </div>

                {/* Tabla comparativa de cambios */}
                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                    <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <i className="bi bi-arrow-left-right text-indigo-500"></i>
                            <span>Comparativa de Datos (Antes vs Después)</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                            {allKeys.length} campo{allKeys.length === 1 ? '' : 's'} afectado{allKeys.length === 1 ? '' : 's'}
                        </span>
                    </div>

                    {allKeys.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b text-slate-400 font-semibold uppercase text-[10px]" style={{ borderColor: 'var(--border-color)' }}>
                                        <th className="py-2 px-3 text-left">Campo</th>
                                        <th className="py-2 px-3 text-left">Valor Anterior</th>
                                        <th className="py-2 px-3 text-left">Valor Nuevo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allKeys.map((key) => {
                                        const valOld = anterior[key];
                                        const valNew = nuevo[key];
                                        const isDifferent = JSON.stringify(valOld) !== JSON.stringify(valNew);

                                        return (
                                            <tr
                                                key={key}
                                                className={`border-b transition-colors ${isDifferent ? 'bg-blue-500/5' : ''}`}
                                                style={{ borderColor: 'var(--border-color)' }}
                                            >
                                                <td className="py-2 px-3 font-semibold text-slate-600 dark:text-slate-300">
                                                    {key}
                                                </td>
                                                <td className="py-2 px-3 opacity-80" style={{ color: 'var(--text-secondary)' }}>
                                                    {valOld !== undefined && valOld !== null ? String(valOld) : '—'}
                                                </td>
                                                <td className={`py-2 px-3 font-semibold ${isDifferent ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                                    {valNew !== undefined && valNew !== null ? String(valNew) : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-xs opacity-60" style={{ color: 'var(--text-secondary)' }}>
                            No se registraron diferencias de atributos en este evento.
                        </div>
                    )}
                </div>

                {/* Raw JSON colapsable */}
                <div className="pt-1">
                    <button
                        type="button"
                        onClick={() => setShowRawJson(!showRawJson)}
                        className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors bg-transparent border-0 p-0 flex items-center gap-1 cursor-pointer"
                    >
                        <i className={`bi ${showRawJson ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        <span>{showRawJson ? 'Ocultar JSON técnico' : 'Ver JSON técnico estructurado'}</span>
                    </button>
                    {showRawJson && (
                        <pre className="mt-2 p-3 rounded-xl text-[11px] font-mono overflow-auto max-h-48 border bg-slate-950 text-slate-200" style={{ borderColor: 'var(--border-color)' }}>
                            {JSON.stringify(mov, null, 2)}
                        </pre>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer className="border-t flex justify-between items-center">
                {isTarea ? (
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            onNavigateToTask(mov.registro_id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-200 dark:border-blue-800 active:scale-95"
                    >
                        <i className="bi bi-box-arrow-up-right"></i>
                        <span>Ir a la Tarea en Gestión</span>
                    </button>
                ) : <div></div>}

                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer active:scale-95 shadow-md shadow-blue-500/20"
                >
                    Cerrar
                </button>
            </Modal.Footer>
        </Modal>
    );
}

MovimientoDetailModal.propTypes = {
    movimiento: PropTypes.object,
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onNavigateToTask: PropTypes.func.isRequired,
    getActionText: PropTypes.func.isRequired
};
