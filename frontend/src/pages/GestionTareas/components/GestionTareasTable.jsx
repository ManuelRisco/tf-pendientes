import PropTypes from 'prop-types';
import { Table, Dropdown } from 'react-bootstrap';
import CustomPagination from '../../../components/Pagination/CustomPagination';

export default function GestionTareasTable({
    items,
    estados,
    isAdmin,
    user,
    loading,
    hasActiveFilters,
    handleClearFilters,
    highlightedTaskId,
    handleView,
    handleChangeStatus,
    handleOpenQuickResponse,
    handleEdit,
    handleDelete,
    getStatusStyle,
    getStatusDotColor,
    getPriorityBadgeStyle,
    getFormattedDate,
    currentPage,
    totalPages,
    setCurrentPage
}) {
    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="spinner-border text-blue-600" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2 mb-0 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>Cargando tareas...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <i className="bi bi-clipboard-x text-4xl opacity-40 mb-2 block" style={{ color: 'var(--text-secondary)' }}></i>
                <h6 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                    {hasActiveFilters ? 'No se encontraron tareas con estos filtros' : 'No hay tareas registradas'}
                </h6>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {hasActiveFilters
                        ? 'Prueba modificando la búsqueda o quitando algunos filtros.'
                        : 'Puedes registrar una tarea nueva con el botón "Nueva Tarea".'}
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
                <Table hover className="table-custom min-w-[750px]">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>#ID</th>
                            <th>Título y descripción</th>
                            <th style={{ width: '180px' }}>Usuario</th>
                            <th style={{ width: '130px' }}>Estado</th>
                            <th style={{ width: '110px' }}>Prioridad</th>
                            <th style={{ width: '130px' }}>Fecha</th>
                            <th style={{ width: '100px' }} className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const estadoNombre = item.estado || 'Pendiente';
                            const prioridadNombre = item.prioridad || 'Baja';
                            const userName = item.usuario_nombre || 'Usuario';
                            const userInitial = userName.charAt(0).toUpperCase();
                            const isHighlighted = highlightedTaskId === item.id;

                            return (
                                <tr
                                    key={item.id}
                                    id={`tarea-row-${item.id}`}
                                    className={`transition-all duration-500 ${isHighlighted ? 'ring-2 ring-blue-500/80 bg-blue-500/10' : ''}`}
                                >
                                    <td className="font-bold text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        #{item.id}
                                    </td>

                                    <td>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-xs sm:text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                                                {item.titulo}
                                            </span>
                                            {item.total_imagenes > 0 && (
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 shrink-0 shadow-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/80 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                                                    title={`${item.total_imagenes} imagen(es) adjunta(s) - Clic para ver`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleView(item, 'imagenes');
                                                    }}
                                                >
                                                    <i className="bi bi-images"></i>
                                                    <span>{item.total_imagenes}</span>
                                                </span>
                                            )}
                                            {(() => {
                                                const totalResp = item.total_respuestas || (item.respuesta_admin ? 1 : 0);
                                                if (totalResp > 0) {
                                                    return (
                                                        <span
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 shrink-0 shadow-xs cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition-colors"
                                                            title={`${totalResp} respuesta(s)`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleView(item);
                                                            }}
                                                        >
                                                            <i className={isAdmin ? "bi bi-chat-check-fill" : "bi bi-patch-check-fill"}></i>
                                                            <span>
                                                                {isAdmin
                                                                    ? (totalResp > 1 ? `Respondido (${totalResp})` : 'Respondido')
                                                                    : (totalResp > 1 ? `Atendido (${totalResp})` : 'Atendido')}
                                                            </span>
                                                        </span>
                                                    );
                                                } else if (!isAdmin) {
                                                    return (
                                                        <span
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0 select-none"
                                                            title="En espera de atención"
                                                        >
                                                            <i className="bi bi-hourglass-split"></i>
                                                            <span>En revisión</span>
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                        {item.descripcion && (
                                            <div className="text-[11px] line-clamp-1 opacity-70 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                                {item.descripcion}
                                            </div>
                                        )}
                                    </td>

                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-500/20">
                                                {userInitial}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-semibold truncate max-w-[140px]" style={{ color: 'var(--text-primary)' }}>
                                                    {userName}
                                                </div>
                                                {item.usuario_email && (
                                                    <div className="text-[11px] truncate max-w-[140px] opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                                        {item.usuario_email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        {isAdmin ? (
                                            <Dropdown>
                                                <Dropdown.Toggle
                                                    as="button"
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(estadoNombre)} focus:outline-none cursor-pointer`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${getStatusDotColor(estadoNombre)}`}></span>
                                                    <span>{estadoNombre}</span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu
                                                    className="shadow-lg border text-xs py-1 rounded-xl"
                                                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                                                >
                                                    {estados.map(estado => (
                                                        <Dropdown.Item
                                                            key={estado.id}
                                                            onClick={() => handleChangeStatus(item.id, estado.id, item.estado_id)}
                                                            className="flex items-center gap-2 px-3 py-1.5 hover:opacity-80"
                                                            style={{ color: 'var(--text-primary)' }}
                                                        >
                                                            <span className={`w-2 h-2 rounded-full ${getStatusDotColor(estado.nombre)}`}></span>
                                                            <span>{estado.nombre}</span>
                                                        </Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        ) : (
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(estadoNombre)} select-none`}
                                                title="El estado solo puede ser modificado por un Administrador"
                                            >
                                                <span className={`w-2 h-2 rounded-full ${getStatusDotColor(estadoNombre)}`}></span>
                                                <span>{estadoNombre}</span>
                                            </span>
                                        )}
                                    </td>

                                    <td>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeStyle(prioridadNombre)}`}>
                                            {prioridadNombre}
                                        </span>
                                    </td>

                                    <td className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                        <div className="flex items-center gap-1" title={`Creado: ${getFormattedDate(item.created_at)}`}>
                                            <i className="bi bi-calendar3 opacity-70"></i>
                                            <span>{getFormattedDate(item.created_at).split(' ')[0]}</span>
                                        </div>
                                        {item.updated_at && item.updated_at !== item.created_at && (
                                            <div className="text-[10px] opacity-60 flex items-center gap-1 mt-0.5" title={`Actualizado: ${getFormattedDate(item.updated_at)}`}>
                                                <i className="bi bi-arrow-repeat"></i>
                                                <span>{getFormattedDate(item.updated_at).split(' ')[0]}</span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="text-end">
                                        <div className="inline-flex gap-1.5">
                                            <button
                                                className="btn-action-icon btn-action-view"
                                                title="Ver detalles"
                                                onClick={() => handleView(item)}
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    className={`btn-action-icon ${item.respuesta_admin
                                                        ? 'btn-action-success'
                                                        : 'btn-action-edit'
                                                        }`}
                                                    title={item.respuesta_admin ? "Editar respuesta" : "Responder"}
                                                    onClick={() => handleOpenQuickResponse(item)}
                                                >
                                                    <i className={item.respuesta_admin ? "bi bi-chat-dots-fill" : "bi bi-chat-dots"}></i>
                                                </button>
                                            )}
                                            {Number(item.usuario_id) === Number(user?.id) && (
                                                <button
                                                    className="btn-action-icon btn-action-edit"
                                                    title="Editar mi ticket"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                            )}
                                            {isAdmin && (
                                                <button
                                                    className="btn-action-icon btn-action-danger"
                                                    title="Eliminar"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
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

GestionTareasTable.propTypes = {
    items: PropTypes.array.isRequired,
    estados: PropTypes.array.isRequired,
    isAdmin: PropTypes.bool,
    user: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    hasActiveFilters: PropTypes.bool,
    handleClearFilters: PropTypes.func.isRequired,
    highlightedTaskId: PropTypes.number,
    handleView: PropTypes.func.isRequired,
    handleChangeStatus: PropTypes.func.isRequired,
    handleOpenQuickResponse: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    getStatusStyle: PropTypes.func.isRequired,
    getStatusDotColor: PropTypes.func.isRequired,
    getPriorityBadgeStyle: PropTypes.func.isRequired,
    getFormattedDate: PropTypes.func.isRequired,
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    setCurrentPage: PropTypes.func.isRequired
};
