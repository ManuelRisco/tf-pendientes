import { Container, Row, Col, Form, Table, Modal, Dropdown } from 'react-bootstrap';
import { useGestionTareas } from './useGestionTareas';
import CustomPagination from '../../components/Pagination/CustomPagination';
import { useAuth } from '../../context/AuthContext';

function GestionTareas() {
    const { user } = useAuth();
    const {
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
        getStatusDotColor
    } = useGestionTareas();

    const isAdmin = Number(user?.rol_id) === 1;

    return (
        <div className="py-2 sm:py-4 animate-fade-in">
            <Container fluid className="px-2 sm:px-4">
                <Row className="justify-content-center">
                    <Col xs={12}>
                        {/* Cabecera Principal del Módulo */}
                        <div className="card-app p-4 sm:p-6 mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/50 shrink-0">
                                            <i className="bi bi-clipboard-check text-lg"></i>
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-black tracking-tight m-0" style={{ color: 'var(--text-primary)' }}>
                                            Gestión de Tareas
                                        </h2>
                                    </div>
                                    <p className="text-xs sm:text-sm mt-1.5 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                        {isAdmin
                                            ? 'Crea, supervisa y administra las tareas operativas de todos los usuarios.'
                                            : 'Crea, consulta y gestiona el estado de tus tareas registradas.'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
                                >
                                    <i className="bi bi-plus-lg"></i>
                                    <span>Nueva Tarea</span>
                                </button>
                            </div>
                        </div>

                        {/* Contenedor Principal: Filtros y Tabla */}
                        <div className="card-app p-4 sm:p-6">
                            {/* Modal Crear/Editar Tarea */}
                            <Modal show={showModal} onHide={resetForm} centered size="lg">
                                <Modal.Header closeButton className="border-b">
                                    <Modal.Title className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {editId ? (
                                            <><i className="bi bi-pencil-square mr-2 text-blue-600"></i>Editar Tarea #{editId}</>
                                        ) : (
                                            <><i className="bi bi-plus-circle mr-2 text-blue-600"></i>Nueva Tarea</>
                                        )}
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body className="p-4 sm:p-6">
                                    <Form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                                Título del requerimiento o incidencia <span className="text-red-500">*</span>
                                            </label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Ej. Error de calibración en impresora Zebra ZT410"
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                className="text-xs sm:text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                                Prioridad de atención <span className="text-red-500">*</span>
                                            </label>
                                            <Form.Select
                                                value={priorityId}
                                                onChange={e => setPriorityId(e.target.value)}
                                                className="text-xs sm:text-sm"
                                                required
                                            >
                                                <option value="">Selecciona nivel de prioridad...</option>
                                                {prioridades.map(p => (
                                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                                ))}
                                            </Form.Select>
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                                Descripción detallada y diagnóstico
                                            </label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                ref={descRef}
                                                placeholder="Detalla el problema, equipo afectado, mensaje de error o acciones requeridas..."
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                            <button
                                                type="button"
                                                onClick={resetForm}
                                                className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border hover:bg-slate-500/10 transition-colors cursor-pointer"
                                                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                                            >
                                                {editId ? 'Guardar Cambios' : 'Crear Tarea'}
                                            </button>
                                        </div>
                                    </Form>
                                </Modal.Body>
                            </Modal>

                            {/* Filtros de la Lista y Buscador Dinámico */}
                            <div className="mb-4 pb-3 border-b space-y-3" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                                    {/* Título y badge de alcance */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <h5 className="text-sm sm:text-base font-bold m-0" style={{ color: 'var(--text-primary)' }}>Lista de tareas</h5>
                                        {!isAdmin && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                                                <i className="bi bi-person-fill"></i> Mis tareas
                                            </span>
                                        )}
                                    </div>

                                    {/* Barra de Búsqueda y Filtros Responsiva */}
                                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                                        {/* Buscador Dinámico */}
                                        <div 
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs w-full sm:w-64 md:w-72 focus-within:border-blue-500 transition-all"
                                            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                                        >
                                            <i className="bi bi-search text-xs opacity-60" style={{ color: 'var(--text-secondary)' }}></i>
                                            <input
                                                type="text"
                                                placeholder={isAdmin ? "Buscar por título, usuario o #ID..." : "Buscar en mis tareas..."}
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                className="bg-transparent border-0 outline-none shadow-none text-xs w-full font-medium"
                                                style={{ color: 'var(--text-primary)' }}
                                            />
                                            {searchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchQuery('')}
                                                    className="text-xs opacity-60 hover:opacity-100 cursor-pointer border-0 bg-transparent p-0"
                                                    style={{ color: 'var(--text-secondary)' }}
                                                    title="Limpiar búsqueda"
                                                >
                                                    <i className="bi bi-x-circle-fill"></i>
                                                </button>
                                            )}
                                        </div>

                                        {/* Filtro de Alcance / Usuario (Solo Administrador) */}
                                        {isAdmin && (
                                            <>
                                                <div
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-xs"
                                                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                                                >
                                                    <i className="bi bi-people-fill text-indigo-500 text-xs"></i>
                                                    <select
                                                        value={filtroAlcance}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setFiltroAlcance(val);
                                                            if (val !== 'usuario_especifico') {
                                                                setFiltroUsuarioId('');
                                                            }
                                                        }}
                                                        className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer"
                                                        style={{ color: 'var(--text-primary)' }}
                                                    >
                                                        <option value="todos">Todas las tareas</option>
                                                        <option value="mis_tareas">Mis tareas creadas</option>
                                                        <option value="otros">Tareas de otros</option>
                                                        <option value="usuario_especifico">Por usuario...</option>
                                                    </select>
                                                </div>

                                                {/* Selector de Usuario Específico */}
                                                {filtroAlcance === 'usuario_especifico' && (
                                                    <div
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-xs animate-fade-in"
                                                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                                                    >
                                                        <i className="bi bi-person-badge text-blue-500 text-xs"></i>
                                                        <select
                                                            value={filtroUsuarioId}
                                                            onChange={e => setFiltroUsuarioId(e.target.value)}
                                                            className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer max-w-[180px]"
                                                            style={{ color: 'var(--text-primary)' }}
                                                        >
                                                            <option value="">Selecciona usuario...</option>
                                                            {(Array.isArray(usuariosList) ? usuariosList : []).map(u => (
                                                                <option key={u.id} value={u.id}>
                                                                    {u.persona_nombre ? `${u.persona_nombre} ${u.persona_apellido}` : u.email}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Filtro Estado */}
                                        <div
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-xs"
                                            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                                        >
                                            <i className="bi bi-funnel-fill text-blue-500 text-xs"></i>
                                            <select
                                                value={filtroEstado}
                                                onChange={e => setFiltroEstado(e.target.value)}
                                                className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                <option value="">Todos los estados</option>
                                                {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                            </select>
                                        </div>

                                        {/* Filtro Prioridad */}
                                        <div
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-xs"
                                            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                                        >
                                            <i className="bi bi-flag-fill text-red-500 text-xs"></i>
                                            <select
                                                value={filtroPrioridad}
                                                onChange={e => setFiltroPrioridad(e.target.value)}
                                                className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                <option value="">Todas las prioridades</option>
                                                {prioridades.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                            </select>
                                        </div>

                                        {/* Botón Limpiar Filtros */}
                                        {hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={handleClearFilters}
                                                className="px-2.5 py-1.5 text-xs rounded-xl font-medium border text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1 cursor-pointer"
                                                style={{ borderColor: 'var(--border-color)' }}
                                                title="Restablecer todos los filtros"
                                            >
                                                <i className="bi bi-arrow-counterclockwise"></i>
                                                <span className="hidden sm:inline">Limpiar</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Resumen de Resultados */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                                    <span>
                                        Mostrando <strong style={{ color: 'var(--text-primary)' }}>{items.length}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{totalTasksCount}</strong> tareas encontradas
                                    </span>
                                    {hasActiveFilters && (
                                        <span className="italic text-blue-600 dark:text-blue-400">
                                            Filtros activos aplicados
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Tabla de Tareas o Estado Vacío */}
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="spinner-border text-blue-600" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                    <p className="mt-2 mb-0 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>Cargando tareas...</p>
                                </div>
                            ) : items.length === 0 ? (
                                <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                                    <i className="bi bi-clipboard-x text-4xl opacity-40 mb-2 block" style={{ color: 'var(--text-secondary)' }}></i>
                                    <h6 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                                        {hasActiveFilters ? 'No se encontraron tareas con estos criterios' : 'No hay tareas registradas'}
                                    </h6>
                                    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                                        {hasActiveFilters
                                            ? 'Prueba modificando los términos de búsqueda o limpiando los filtros seleccionados.'
                                            : 'Comienza creando un nuevo requerimiento o incidencia con el botón "Nueva Tarea".'}
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={handleClearFilters}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all cursor-pointer"
                                        >
                                            Restablecer filtros
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table hover className="table-custom min-w-[750px]">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '60px' }}>#ID</th>
                                                <th>Título y Diagnóstico</th>
                                                <th style={{ width: '180px' }}>Usuario Creador</th>
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

                                                return (
                                                    <tr key={item.id}>
                                                        {/* ID */}
                                                        <td className="font-bold text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                            #{item.id}
                                                        </td>

                                                        {/* Título y Diagnóstico */}
                                                        <td>
                                                            <div className="font-bold text-xs sm:text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                                                                {item.titulo}
                                                            </div>
                                                            {item.descripcion && (
                                                                <div className="text-[11px] line-clamp-1 opacity-70 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                                                    {item.descripcion}
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Usuario Creador */}
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

                                                        {/* Estado: Dropdown solo para Administrador, Badge estático para Empleado */}
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

                                                        {/* Prioridad */}
                                                        <td>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeStyle(prioridadNombre)}`}>
                                                                {prioridadNombre}
                                                            </span>
                                                        </td>

                                                        {/* Fechas DD/MM/YYYY */}
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

                                                        {/* Acciones */}
                                                        <td className="text-end">
                                                            <div className="inline-flex gap-1.5">
                                                                <button
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center border-0 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                                                    title="Ver detalles"
                                                                    onClick={() => handleView(item)}
                                                                >
                                                                    <i className="bi bi-eye"></i>
                                                                </button>
                                                                <button
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center border-0 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all cursor-pointer"
                                                                    title="Editar"
                                                                    onClick={() => handleEdit(item)}
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                {isAdmin && (
                                                                    <button
                                                                        className="w-8 h-8 rounded-lg flex items-center justify-center border-0 bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all cursor-pointer"
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
        </div>
    );
}

export default GestionTareas;