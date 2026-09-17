import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import CustomPagination from '../../../components/Pagination/CustomPagination';
import MovimientoChangeDiff from './MovimientoChangeDiff';
import { getActionMeta } from '../../../lib/themeConstants';
import { formatDateTime, getTimeAgo } from '../../../lib/dateUtils';

export default function MovimientosTable({
    movimientos,
    hasActiveFilters,
    handleClearFilters,
    getActionText,
    onSelectMovimiento,
    onNavigateToTask,
    currentPage,
    setCurrentPage,
    totalPages
}) {
    if (movimientos.length === 0) {
        return (
            <div className="text-center py-12 rounded-xl border flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <i className="bi bi-clock-history text-4xl opacity-40 mb-2 block" style={{ color: 'var(--text-secondary)' }}></i>
                <h6 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                    {hasActiveFilters ? 'No se encontraron movimientos con estos filtros' : 'No hay movimientos registrados'}
                </h6>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {hasActiveFilters
                        ? 'Prueba modificando los términos de búsqueda o limpiando los filtros seleccionados.'
                        : 'Las acciones realizadas por los usuarios se registrarán automáticamente aquí.'}
                </p>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
                    >
                        Restablecer filtros
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <Table hover className="table-movimientos min-w-[760px]">
                    <thead>
                        <tr>
                            <th style={{ width: '22%' }}>Usuario</th>
                            <th style={{ width: '18%' }}>Acción & Módulo</th>
                            <th style={{ width: '38%' }}>Detalle del Movimiento</th>
                            <th style={{ width: '14%' }}>Fecha y Hora</th>
                            <th style={{ width: '8%' }} className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movimientos.map((mov) => {
                            const meta = getActionMeta(mov.tipo_accion, mov.modulo);
                            const nombreCompleto = mov.persona_nombre
                                ? `${mov.persona_nombre} ${mov.persona_apellido || ''}`.trim()
                                : (mov.email || 'Sistema / Automático');
                            const initial = (nombreCompleto || 'S').charAt(0).toUpperCase();
                            const isTarea = mov.modulo === 'tareas' && mov.registro_id;

                            return (
                                <tr key={mov.id}>
                                    <td>
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border ${meta.avatarBg}`}>
                                                {initial}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-xs sm:text-sm truncate" style={{ color: 'var(--text-primary)' }} title={nombreCompleto}>
                                                    {nombreCompleto}
                                                </div>
                                                {mov.email && (
                                                    <a
                                                        href={`mailto:${mov.email}`}
                                                        className="text-[11px] truncate block opacity-70 hover:opacity-100 hover:underline text-blue-600 dark:text-blue-400 no-underline"
                                                        title={`Enviar correo a ${mov.email}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {mov.email}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badgeBg}`}>
                                                <i className={`bi ${meta.icon} text-[11px]`}></i>
                                                <span>{meta.label}</span>
                                            </span>
                                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                                                {mov.modulo === 'tareas' ? `Tarea #${mov.registro_id}` : `Usuario #${mov.registro_id}`}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <div>
                                            <span className="text-xs sm:text-sm font-medium leading-relaxed block" style={{ color: 'var(--text-primary)' }}>
                                                {getActionText(mov)}
                                            </span>
                                            <MovimientoChangeDiff mov={mov} />
                                        </div>
                                    </td>

                                    <td>
                                        <div className="text-xs" style={{ color: 'var(--text-primary)' }}>
                                            <div className="font-semibold">{formatDateTime(mov.created_at)}</div>
                                            <div className="text-[11px] opacity-60 flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                                <i className="bi bi-clock text-[10px]"></i>
                                                <span>{getTimeAgo(mov.created_at)}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="text-end">
                                        <div className="inline-flex gap-1.5 justify-end">
                                            <button
                                                type="button"
                                                onClick={() => onSelectMovimiento(mov)}
                                                className="btn-action-icon btn-action-view"
                                                title="Ver detalles de auditoría"
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>
                                            {isTarea && (
                                                <button
                                                    type="button"
                                                    onClick={() => onNavigateToTask(mov.registro_id)}
                                                    className="btn-action-icon btn-action-edit"
                                                    title="Ver tarea en Gestión de Tareas"
                                                >
                                                    <i className="bi bi-box-arrow-up-right"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>

            {totalPages > 1 && (
                <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </>
    );
}

MovimientosTable.propTypes = {
    movimientos: PropTypes.array.isRequired,
    hasActiveFilters: PropTypes.bool,
    handleClearFilters: PropTypes.func.isRequired,
    getActionText: PropTypes.func.isRequired,
    onSelectMovimiento: PropTypes.func.isRequired,
    onNavigateToTask: PropTypes.func.isRequired,
    currentPage: PropTypes.number.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
    totalPages: PropTypes.number.isRequired
};
