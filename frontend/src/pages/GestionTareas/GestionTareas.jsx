import { Container, Row, Col, Form, Table, Modal, Dropdown } from 'react-bootstrap';
import { useGestionTareas } from './useGestionTareas';
import CustomPagination from '../../components/Pagination/CustomPagination';

function GestionTareas() {
    const {
        user,
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
        filtroEstado,
        setFiltroEstado,
        filtroPrioridad,
        setFiltroPrioridad,
        filtroAlcance,
        setFiltroAlcance,
        filtroUsuarioId,
        setFiltroUsuarioId,
        descRef,
        currentPage,
        setCurrentPage,
        totalPages,
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
        <div className="py-1 sm:py-4 px-0 sm:px-2 max-w-7xl mx-auto">
            <Container fluid className="p-0">
                <Row className="justify-content-center m-0">
                    <Col xs={12} className="p-0">
                        <div className="card-app p-3.5 sm:p-6 mb-5 sm:mb-6">
                            {/* Header Superior */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight m-0" style={{ color: 'var(--text-primary)' }}>
                                        Gestión de Tareas
                                    </h2>
                                    <p className="text-xs sm:text-sm mt-1 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                        {isAdmin 
                                            ? 'Crea, supervisa y administra las tareas operativas de todos los usuarios.'
                                            : 'Crea, consulta y gestiona el estado de tus tareas registradas.'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
                                >
                                    <i className="bi bi-plus-lg"></i>
                                    <span>Agregar tarea</span>
                                </button>
                            </div>

                            {/* Modal de Crear / Editar Tarea */}
                            <Modal show={showModal} onHide={resetForm} centered size="lg" backdrop="static">
                                <Modal.Header closeButton>
                                    <Modal.Title className="font-bold text-base sm:text-lg">
                                        {editId ? (
                                            <><i className="bi bi-pencil-square mr-2 text-blue-600"></i>Editar Tarea</>
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

                                        <div className="flex justify-end gap-2 pt-3 border-t">
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
                                                className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
                                            >
                                                {editId ? 'Guardar Cambios' : 'Registrar Tarea'}
                                            </button>
                                        </div>
                                    </Form>
                                </Modal.Body>
                            </Modal>

                            {/* Filtros de la Lista */}
                            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2">
                                    <h5 className="text-sm sm:text-base font-bold m-0" style={{ color: 'var(--text-primary)' }}>Lista de tareas</h5>
                                    {!isAdmin && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                                            <i className="bi bi-person-fill"></i> Mis tareas
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
                                    {/* Filtro de Alcance / Usuario para Administradores */}
                                    {isAdmin && (
                                        <>
                                            <div
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs"
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
                                                    <option value="usuario_especifico">Buscar por usuario...</option>
                                                </select>
                                            </div>

                                            {/* Selector de Usuario Específico */}
                                            {filtroAlcance === 'usuario_especifico' && (
                                                <div
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs animate-fade-in"
                                                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                                                >
                                                    <i className="bi bi-person-badge text-blue-500 text-xs"></i>
                                                    <select
                                                        value={filtroUsuarioId}
                                                        onChange={e => setFiltroUsuarioId(e.target.value)}
                                                        className="bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer max-w-[200px]"
                                                        style={{ color: 'var(--text-primary)' }}
                                                    >
                                                        <option value="">Selecciona un usuario...</option>
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
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs"
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
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs"
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
                                </div>
                            </div>

                            {/* Tabla de Tareas */}
                            {items.length === 0 ? (
                                <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                                    <i className="bi bi-clipboard-x text-3xl opacity-40 mb-2 block" style={{ color: 'var(--text-secondary)' }}></i>
                                    <p className="text-sm m-0 font-medium" style={{ color: 'var(--text-secondary)' }}>
                                        No hay tareas que coincidan con los filtros aplicados.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table hover className="table-custom min-w-[750px]">
                                        <thead>
                                            <tr>
                                                <th className="w-[28%]">Tarea</th>
                                                <th className="w-[20%]">Creado por</th>
                                                <th className="w-[16%]">Estado</th>
                                                <th className="w-[12%]">Prioridad</th>
                                                <th className="w-[14%]">Fechas</th>
                                                <th className="w-[10%] text-end">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(item => {
                                                const estadoNombre = item.estado || 'Desconocido';
                                                const prioridadNombre = item.prioridad || 'Desconocida';
                                                const initial = (item.usuario_nombre || 'U').charAt(0).toUpperCase();

                                                return (
                                                    <tr key={item.id}>
                                                        {/* Título y Descripción */}
                                                        <td>
                                                            <div className="font-semibold text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>{item.titulo}</div>
                                                            <div className="text-xs truncate max-w-[180px] sm:max-w-[240px]" style={{ color: 'var(--text-secondary)' }} title={item.descripcion}>
                                                                {item.descripcion || 'Sin descripción'}
                                                            </div>
                                                        </td>

                                                        {/* Persona que realizó la tarea */}
                                                        <td>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                                                                    {initial}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-semibold text-xs truncate max-w-[140px]" style={{ color: 'var(--text-primary)' }}>
                                                                        {item.usuario_nombre || 'Usuario'}
                                                                    </div>
                                                                    {item.usuario_email && (
                                                                        <div className="text-[11px] truncate max-w-[140px] opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                                                            {item.usuario_email}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Estado con Dropdown */}
                                                        <td>
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
                                                        </td>

                                                        {/* Prioridad */}
                                                        <td>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeStyle(prioridadNombre)}`}>
                                                                {prioridadNombre}
                                                            </span>
                                                        </td>

                                                        {/* Fechas DD/MM/YYYY */}
                                                        <td>
                                                            <div className="text-xs space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                                                                <div title="Fecha de creación"><i className="bi bi-calendar-plus mr-1 opacity-70"></i>{getFormattedDate(item.created_at)}</div>
                                                                <div title="Última actualización"><i className="bi bi-arrow-repeat mr-1 opacity-70"></i>{getFormattedDate(item.updated_at)}</div>
                                                            </div>
                                                        </td>

                                                        {/* Acciones */}
                                                        <td className="text-end">
                                                            <div className="inline-flex gap-1.5">
                                                                <button
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center border hover:opacity-80 transition-all cursor-pointer"
                                                                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                                                                    title="Ver detalles"
                                                                    onClick={() => handleView(item)}
                                                                >
                                                                    <i className="bi bi-eye"></i>
                                                                </button>
                                                                <button
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center border text-blue-500 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                                                                    style={{ borderColor: 'var(--border-color)' }}
                                                                    title="Editar"
                                                                    onClick={() => handleEdit(item)}
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                {isAdmin && (
                                                                    <button
                                                                        className="w-8 h-8 rounded-lg flex items-center justify-center border text-red-500 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                                                                        style={{ borderColor: 'var(--border-color)' }}
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