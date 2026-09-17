import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import CustomPagination from '../../../components/Pagination/CustomPagination';

export default function UsuariosTable({
    usuarios,
    user,
    loading,
    hasActiveFilters,
    handleClearFilters,
    handleEditClick,
    handleRestoreClick,
    handleDeleteClick,
    getInitials,
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
                <p className="mt-2 mb-0 text-sm" style={{ color: 'var(--text-secondary)' }}>Cargando usuarios...</p>
            </div>
        );
    }

    if (usuarios.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-2 opacity-40" style={{ color: 'var(--text-secondary)' }}>
                    <i className="bi bi-people"></i>
                </div>
                <h6 className="font-bold" style={{ color: 'var(--text-primary)' }}>No se encontraron usuarios</h6>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {hasActiveFilters
                        ? 'Intenta ajustar o limpiar los filtros para encontrar lo que buscas.'
                        : 'No hay usuarios registrados en el sistema.'}
                </p>
                {hasActiveFilters && (
                    <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all"
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <Table hover className="table-usuarios min-w-[700px]">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Correo Electrónico</th>
                            <th>Estado</th>
                            <th>Rol</th>
                            <th>Fecha de Registro</th>
                            {Number(user?.rol_id) === 1 && <th className="text-end">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(u => {
                            const isInactive = Boolean(u.deleted_at);
                            const isCurrentUser = user && Number(user.id) === Number(u.id);

                            return (
                                <tr key={u.id} className={isInactive ? 'opacity-65' : ''}>
                                    <td>
                                        <div className="flex items-center gap-2.5 sm:gap-3">
                                            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${isInactive
                                                ? 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                : 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700'
                                                }`}>
                                                {getInitials(u.nombre, u.apellido)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-xs sm:text-sm" style={{ color: isInactive ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                                    {u.nombre} {u.apellido}
                                                    {isCurrentUser && (
                                                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700">
                                                            Tú
                                                        </span>
                                                    )}
                                                </div>
                                                <small className="sm:hidden block text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                    {u.email}
                                                </small>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>

                                    <td>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold border ${isInactive
                                            ? 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                                            : 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700'
                                            }`}>
                                            <i className={`bi ${isInactive ? 'bi-dash-circle-fill' : 'bi-check-circle-fill'}`}></i>
                                            {isInactive ? 'Inactivo' : 'Activo'}
                                        </span>
                                    </td>

                                    <td>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold border ${u.rol_id === 1
                                            ? 'bg-blue-100 text-blue-950 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700'
                                            : 'bg-sky-100 text-sky-950 border-sky-300 dark:bg-sky-950/80 dark:text-sky-200 dark:border-sky-700'
                                            }`}>
                                            <i className={`bi ${u.rol_id === 1 ? 'bi-shield-lock-fill' : 'bi-person-fill'}`}></i>
                                            {u.rol || 'Sin Rol'}
                                        </span>
                                    </td>

                                    <td className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                        <i className="bi bi-calendar3 mr-1 opacity-70"></i>
                                        {getFormattedDate(u.created_at)}
                                    </td>

                                    {(Number(user?.rol_id) === 1 || isCurrentUser) && (
                                        <td className="text-end">
                                            <div className="inline-flex gap-1.5">
                                                <button
                                                    className="btn-action-icon btn-action-edit"
                                                    title="Editar Usuario"
                                                    onClick={() => handleEditClick(u)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>

                                                {Number(user?.rol_id) === 1 && !isCurrentUser && isInactive && (
                                                    <button
                                                        className="btn-action-icon btn-action-success"
                                                        title="Reactivar Usuario"
                                                        onClick={() => handleRestoreClick(u.id)}
                                                    >
                                                        <i className="bi bi-person-check"></i>
                                                    </button>
                                                )}

                                                {Number(user?.rol_id) === 1 && !isCurrentUser && !isInactive && (
                                                    <button
                                                        className="btn-action-icon btn-action-danger"
                                                        title="Desactivar Usuario"
                                                        onClick={() => handleDeleteClick(u.id)}
                                                    >
                                                        <i className="bi bi-person-x"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
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

UsuariosTable.propTypes = {
    usuarios: PropTypes.array.isRequired,
    user: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    hasActiveFilters: PropTypes.bool,
    handleClearFilters: PropTypes.func.isRequired,
    handleEditClick: PropTypes.func.isRequired,
    handleRestoreClick: PropTypes.func.isRequired,
    handleDeleteClick: PropTypes.func.isRequired,
    getInitials: PropTypes.func.isRequired,
    getFormattedDate: PropTypes.func.isRequired,
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    setCurrentPage: PropTypes.func.isRequired
};
