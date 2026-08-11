import { Container, Row, Col, Table, Modal, Form } from 'react-bootstrap';
import { useUsuarios } from './useUsuarios';
import CustomPagination from '../../components/Pagination/CustomPagination';

function Usuarios() {
    const {
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
    } = useUsuarios();

    return (
        <div className="py-2 sm:py-6 px-1 sm:px-4 max-w-7xl mx-auto">
            <Container fluid className="p-0">
                <Row className="justify-content-center m-0">
                    <Col xs={12} className="p-0">
                        <div className="card-app p-4 sm:p-6 mb-6">
                            {/* Encabezado Superior */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-bold tracking-tight m-0" style={{ color: 'var(--text-primary)' }}>
                                        Directorio de Usuarios
                                    </h4>
                                    <p className="text-xs sm:text-sm mt-1 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                        Administra las cuentas de usuario, roles y estados de acceso.
                                    </p>
                                </div>
                                {Number(user?.rol_id) === 1 && (
                                    <button
                                        onClick={handleCreateClick}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md shadow-blue-500/20 transition-all shrink-0"
                                    >
                                        <i className="bi bi-person-plus-fill"></i>
                                        <span>Nuevo Usuario</span>
                                    </button>
                                )}
                            </div>

                            {/* Barra de Filtros */}
                            <div
                                className="rounded-2xl p-3 sm:p-4 mb-6 border"
                                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4 items-end">
                                    {/* Búsqueda */}
                                    <div className="col-span-1 sm:col-span-2 md:col-span-5">
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                            Buscar usuario
                                        </label>
                                        <div className="relative flex items-center">
                                            <i className="bi bi-search absolute left-3 text-sm pointer-events-none opacity-50"></i>
                                            <input
                                                type="text"
                                                placeholder="Nombre, apellido o correo..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-lg border focus:outline-none transition-all"
                                                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                            />
                                            {search && (
                                                <button
                                                    onClick={() => setSearch('')}
                                                    className="absolute right-2.5 hover:text-red-500 text-sm opacity-60 hover:opacity-100"
                                                    title="Limpiar búsqueda"
                                                >
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Filtro por Estado */}
                                    <div className="col-span-1 md:col-span-3">
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                            Estado
                                        </label>
                                        <select
                                            value={filtroEstado}
                                            onChange={(e) => setFiltroEstado(e.target.value)}
                                            className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border focus:outline-none transition-all cursor-pointer"
                                            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                        >
                                            <option value="todos">Todos los estados</option>
                                            <option value="activo">Solo Activos</option>
                                            <option value="inactivo">Solo Inactivos</option>
                                        </select>
                                    </div>

                                    {/* Filtro por Rol */}
                                    <div className="col-span-1 md:col-span-3">
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                            Rol
                                        </label>
                                        <select
                                            value={filtroRol}
                                            onChange={(e) => setFiltroRol(e.target.value)}
                                            className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border focus:outline-none transition-all cursor-pointer"
                                            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                        >
                                            <option value="">Todos los roles</option>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>{r.nombre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Botón Limpiar */}
                                    <div className="col-span-1 sm:col-span-2 md:col-span-1 flex items-center">
                                        {hasActiveFilters && (
                                            <button
                                                onClick={handleClearFilters}
                                                className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border hover:opacity-80 transition-all flex items-center justify-center gap-1"
                                                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                                title="Restablecer filtros"
                                            >
                                                <i className="bi bi-arrow-counterclockwise"></i>
                                                <span className="sm:hidden text-xs">Limpiar</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Resumen */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--border-color)' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        Mostrando <strong style={{ color: 'var(--text-primary)' }}>{usuarios.length}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong> usuarios
                                    </span>
                                </div>
                            </div>

                            {/* Tabla de Usuarios */}
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="spinner-border text-blue-600" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                    <p className="mt-2 mb-0 text-sm" style={{ color: 'var(--text-secondary)' }}>Cargando directorio de usuarios...</p>
                                </div>
                            ) : usuarios.length === 0 ? (
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
                            ) : (
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
                                                        {/* Avatar + Nombre */}
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

                                                        {/* Email */}
                                                        <td className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>

                                                        {/* Estado */}
                                                        <td>
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold border ${isInactive
                                                                ? 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                                                                : 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700'
                                                                }`}>
                                                                <i className={`bi ${isInactive ? 'bi-dash-circle-fill' : 'bi-check-circle-fill'}`}></i>
                                                                {isInactive ? 'Inactivo' : 'Activo'}
                                                            </span>
                                                        </td>

                                                        {/* Rol */}
                                                        <td>
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold border ${u.rol_id === 1
                                                                ? 'bg-blue-100 text-blue-950 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700'
                                                                : 'bg-sky-100 text-sky-950 border-sky-300 dark:bg-sky-950/80 dark:text-sky-200 dark:border-sky-700'
                                                                }`}>
                                                                <i className={`bi ${u.rol_id === 1 ? 'bi-shield-lock-fill' : 'bi-person-fill'}`}></i>
                                                                {u.rol || 'Sin Rol'}
                                                            </span>
                                                        </td>

                                                        {/* Fecha de Registro */}
                                                        <td className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                            <i className="bi bi-calendar3 mr-1 opacity-70"></i>
                                                            {getFormattedDate(u.created_at)}
                                                        </td>

                                                        {/* Acciones */}
                                                        {Number(user?.rol_id) === 1 && (
                                                            <td className="text-end">
                                                                <div className="inline-flex gap-1.5">
                                                                    <button
                                                                        className="w-8 h-8 rounded-lg flex items-center justify-center border text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                                                                        style={{ borderColor: 'var(--border-color)' }}
                                                                        title="Editar Usuario"
                                                                        onClick={() => handleEditClick(u)}
                                                                    >
                                                                        <i className="bi bi-pencil"></i>
                                                                    </button>

                                                                    {!isCurrentUser && isInactive && (
                                                                        <button
                                                                            className="w-8 h-8 rounded-lg flex items-center justify-center border text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                                                                            style={{ borderColor: 'var(--border-color)' }}
                                                                            title="Reactivar Usuario"
                                                                            onClick={() => handleRestoreClick(u.id)}
                                                                        >
                                                                            <i className="bi bi-person-check"></i>
                                                                        </button>
                                                                    )}

                                                                    {!isCurrentUser && !isInactive && (
                                                                        <button
                                                                            className="w-8 h-8 rounded-lg flex items-center justify-center border text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                                                            style={{ borderColor: 'var(--border-color)' }}
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
                            )}

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <CustomPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Modal de Creación / Edición */}
            <Modal show={showModal} onHide={resetForm} centered backdrop="static" size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="font-bold text-base sm:text-lg">
                        {editId ? (
                            <><i className="bi bi-pencil-square mr-2 text-blue-600"></i>Editar Usuario</>
                        ) : (
                            <><i className="bi bi-person-plus mr-2 text-blue-600"></i>Nuevo Usuario</>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSaveUser} autoComplete="off">
                        <Row>
                            <Col xs={12} sm={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-xs sm:text-sm font-medium">Nombre</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Ej. Juan"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-xs sm:text-sm font-medium">Apellido</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleInputChange}
                                        placeholder="Ej. Pérez"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-xs sm:text-sm font-medium">Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="usuario@tecnofilm.com"
                                required
                                autoComplete="off"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-xs sm:text-sm font-medium">
                                Contraseña {editId && <small className="opacity-75 font-normal">(Dejar en blanco para conservar)</small>}
                            </Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder={editId ? "•••••••• (opcional)" : "Mínimo 6 caracteres"}
                                required={!editId}
                                minLength={6}
                                autoComplete="new-password"
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-xs sm:text-sm font-medium">Rol</Form.Label>
                            <Form.Select
                                name="rol_id"
                                value={formData.rol_id}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Seleccione un rol...</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.nombre}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg opacity-80 hover:opacity-100 font-medium transition-all"
                                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-md shadow-blue-500/20"
                            >
                                {editId ? 'Guardar Cambios' : 'Crear Usuario'}
                            </button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Usuarios;
