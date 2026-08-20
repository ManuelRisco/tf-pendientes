import { Container, Row, Col, Form, Table, Modal, Dropdown } from 'react-bootstrap';
import { useGestionTareas } from './useGestionTareas';
import CustomPagination from '../../components/Pagination/CustomPagination';

function GestionTareas() {
    const {
        user,
        items,
        estados,
        prioridades,
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
                                        Crea, supervisa y actualiza el estado de las tareas operativas.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium shadow-md shadow-blue-500/20 transition-all shrink-0"
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
                                <Modal.Body>
                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col md={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="text-xs sm:text-sm font-medium">Título <span className="text-red-500">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                        placeholder="Ej. Configurar cámara..."
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="text-xs sm:text-sm font-medium">Descripción <span className="opacity-75 font-normal text-xs">(Opcional)</span></Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        ref={descRef}
                                                        rows={2}
                                                        value={description}
                                                        onChange={(e) => {
                                                            setDescription(e.target.value);
                                                            e.target.style.height = 'auto';
                                                            e.target.style.height = e.target.scrollHeight + 'px';
                                                        }}
                                                        placeholder="Ej. Conexión del cable de red y verificación de energía..."
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label className="text-xs sm:text-sm font-medium">Prioridad <span className="text-red-500">*</span></Form.Label>
                                                    <Form.Select
                                                        value={priorityId}
                                                        onChange={(e) => setPriorityId(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Seleccione prioridad...</option>
                                                        {prioridades.map(p => (
                                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                            <small className="text-xs" style={{ color: 'var(--text-secondary)' }}><span className="text-red-500">*</span> Campos obligatorios</small>
                                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                                                <button
                                                    type="button"
                                                    onClick={resetForm}
                                                    className="w-1/2 sm:w-auto px-4 py-2 text-sm rounded-lg opacity-80 hover:opacity-100 font-medium transition-all"
                                                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="w-1/2 sm:w-auto px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-md shadow-blue-500/20"
                                                >
                                                    {editId ? 'Actualizar' : 'Guardar'}
                                                </button>
                                            </div>
                                        </div>
                                    </Form>
                                </Modal.Body>
                            </Modal>

                            {/* Filtros de la Lista */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                <h5 className="text-sm sm:text-base font-bold m-0" style={{ color: 'var(--text-primary)' }}>Lista de tareas</h5>

                                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2.5">
                                    {/* Filtro Estado */}
                                    <div
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs w-full sm:w-auto"
                                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                                    >
                                        <i className="bi bi-funnel-fill text-blue-500 text-xs"></i>
                                        <select
                                            value={filtroEstado}
                                            onChange={e => setFiltroEstado(e.target.value)}
                                            className="w-full bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            <option value="">Todos los estados</option>
                                            {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                        </select>
                                    </div>

                                    {/* Filtro Prioridad */}
                                    <div
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs w-full sm:w-auto"
                                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                                    >
                                        <i className="bi bi-flag-fill text-red-500 text-xs"></i>
                                        <select
                                            value={filtroPrioridad}
                                            onChange={e => setFiltroPrioridad(e.target.value)}
                                            className="w-full bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer"
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
                                    <p className="text-sm m-0" style={{ color: 'var(--text-secondary)' }}>No hay tareas que coincidan con los filtros.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table hover className="table-custom min-w-[650px]">
                                        <thead>
                                            <tr>
                                                <th className="w-[30%]">Tarea</th>
                                                <th className="w-[20%]">Estado</th>
                                                <th className="w-[15%]">Prioridad</th>
                                                <th className="w-[20%]">Fechas</th>
                                                <th className="w-[15%] text-end">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(item => {
                                                const estadoNombre = item.estado || 'Desconocido';
                                                const prioridadNombre = item.prioridad || 'Desconocida';

                                                return (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <div className="font-semibold text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>{item.titulo}</div>
                                                            <div className="text-xs truncate max-w-[200px] sm:max-w-[280px]" style={{ color: 'var(--text-secondary)' }} title={item.descripcion}>
                                                                {item.descripcion || 'Sin descripción'}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Dropdown>
                                                                <Dropdown.Toggle
                                                                    as="button"
                                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(estadoNombre)} focus:outline-none`}
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
                                                        <td>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeStyle(prioridadNombre)}`}>
                                                                {prioridadNombre}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="text-xs space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                                                                <div><i className="bi bi-calendar-plus mr-1 opacity-70"></i>{getFormattedDate(item.created_at)}</div>
                                                                <div><i className="bi bi-arrow-repeat mr-1 opacity-70"></i>{getFormattedDate(item.updated_at)}</div>
                                                            </div>
                                                        </td>
                                                        <td className="text-end">
                                                            <div className="inline-flex gap-1.5">
                                                                <button
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center border hover:opacity-80 transition-all"
                                                                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                                                                    title="Ver detalles"
                                                                    onClick={() => handleView(item)}
                                                                >
                                                                    <i className="bi bi-eye"></i>
                                                                </button>
                                                                <button
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center border text-blue-500 hover:bg-blue-600 hover:text-white transition-all"
                                                                    style={{ borderColor: 'var(--border-color)' }}
                                                                    title="Editar"
                                                                    onClick={() => handleEdit(item)}
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                {Number(user?.rol_id) === 1 && (
                                                                    <button
                                                                        className="w-8 h-8 rounded-lg flex items-center justify-center border text-red-500 hover:bg-red-600 hover:text-white transition-all"
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