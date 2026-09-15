import { Container, Row, Col, Form, Table, Modal, Dropdown } from 'react-bootstrap';
import { useGestionTareas } from './useGestionTareas';
import CustomPagination from '../../components/Pagination/CustomPagination';
import { useAuth } from '../../context/AuthContext';
import { getEstadoBadge, getPriorityBadge } from '../../lib/themeConstants';

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
        submitting,
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
        fileInputRef,
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
        getStatusDotColor,
        selectedFiles,
        filePreviews,
        existingImages,
        handleFileSelect,
        handleRemoveSelectedFile,
        handleDeleteExistingImage,
        viewItem,
        showViewModal,
        setShowViewModal,
        lightboxImage,
        setLightboxImage,
        adminResponse,
        setAdminResponse,
        showResponseModal,
        setShowResponseModal,
        responseItem,
        responseText,
        setResponseText,
        responseStatusId,
        setResponseStatusId,
        savingResponse,
        handleOpenQuickResponse,
        handleSaveQuickResponse,
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
                                                Descripción detallada
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

                                        {/* SECCIÓN DICTAMEN Y RESPUESTA AL SOLICITANTE */}
                                        {isAdmin && editId && (
                                            <div className="p-3.5 rounded-xl border bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs sm:text-sm font-bold flex items-center gap-1.5 m-0 text-emerald-800 dark:text-emerald-300">
                                                        <i className="bi bi-chat-left-text-fill text-emerald-600 dark:text-emerald-400"></i>
                                                        <span>Dictamen y Solución Técnica para el Solicitante</span>
                                                    </label>
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                                                        Visible para el usuario
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/90 m-0">
                                                    Escribe la respuesta, indicación o resolución técnica que el usuario verá en su ticket.
                                                </p>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    placeholder="Escribe la solución técnica, motivo de cierre o indicaciones para el solicitante..."
                                                    value={adminResponse}
                                                    onChange={(e) => setAdminResponse(e.target.value)}
                                                    className="text-xs sm:text-sm border-emerald-300 dark:border-emerald-800 focus:border-emerald-500"
                                                />
                                            </div>
                                        )}

                                        {/* SECCIÓN DE IMÁGENES / EVIDENCIAS */}
                                        <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs sm:text-sm font-semibold m-0 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                                                    <i className="bi bi-images text-blue-600"></i>
                                                    <span> Imágenes y evidencias de soporte</span>
                                                </label>
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${(existingImages.length + selectedFiles.length) >= 5
                                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/40'
                                                    : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/40'
                                                    }`}>
                                                    {existingImages.length + selectedFiles.length} / 5 imágenes
                                                </span>
                                            </div>

                                            {/* Si estamos editando y ya existen imágenes guardadas */}
                                            {editId && existingImages.length > 0 && (
                                                <div className="mb-3">
                                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                                                        Imágenes guardadas actualmente:
                                                    </span>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                                        {existingImages.map((img) => (
                                                            <div
                                                                key={img.id}
                                                                className="relative group rounded-xl overflow-hidden border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 aspect-square shadow-xs"
                                                            >
                                                                <img
                                                                    src={img.url}
                                                                    alt={img.nombre_original}
                                                                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 cursor-pointer"
                                                                    onClick={() => setLightboxImage(img)}
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs hover:bg-blue-700 shadow-md cursor-pointer border-0"
                                                                        title="Ver ampliada"
                                                                        onClick={() => setLightboxImage(img)}
                                                                    >
                                                                        <i className="bi bi-zoom-in"></i>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs hover:bg-rose-700 shadow-md cursor-pointer border-0"
                                                                        title="Eliminar imagen"
                                                                        onClick={() => handleDeleteExistingImage(img.id)}
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </button>
                                                                </div>
                                                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                                                    <p className="text-[10px] text-white truncate m-0 text-center font-medium px-1">
                                                                        {img.nombre_original}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Zona de Dropzone para adjuntar imágenes si no supera 5 */}
                                            {(existingImages.length + selectedFiles.length) < 5 ? (
                                                <div>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={(e) => handleFileSelect(e.target.files)}
                                                        multiple
                                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                                        className="hidden"
                                                        id="ticket-images-upload"
                                                    />
                                                    <label
                                                        htmlFor="ticket-images-upload"
                                                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                        onDrop={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (e.dataTransfer.files) handleFileSelect(e.dataTransfer.files);
                                                        }}
                                                        className="w-full border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all text-center"
                                                        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
                                                            <i className="bi bi-cloud-arrow-up-fill"></i>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs sm:text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                                                                Arrastra imágenes aquí o <span className="text-blue-600 hover:underline">haz clic para examinar</span>
                                                            </p>
                                                            <p className="text-[11px] m-0 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                                                Formatos admitidos: JPG, PNG, WEBP, GIF (Máx. 5MB por imagen, hasta {5 - existingImages.length - selectedFiles.length} disponibles)
                                                            </p>
                                                        </div>
                                                    </label>
                                                </div>
                                            ) : (
                                                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                                                    <i className="bi bi-info-circle-fill shrink-0 text-sm"></i>
                                                    <span>Límite alcanzado: Este ticket cuenta con el máximo permitido de 5 imágenes.</span>
                                                </div>
                                            )}

                                            {/* Previsualizaciones de archivos seleccionados */}
                                            {filePreviews.length > 0 && (
                                                <div className="mt-3">
                                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                                                        Nuevas imágenes a subir ({filePreviews.length}):
                                                    </span>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                                        {filePreviews.map((preview, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="relative group rounded-xl overflow-hidden border bg-slate-100 dark:bg-slate-800 border-blue-300 dark:border-blue-800 aspect-square shadow-xs"
                                                            >
                                                                <img
                                                                    src={preview.previewUrl}
                                                                    alt={preview.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSelectedFile(idx)}
                                                                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shadow-md hover:bg-rose-700 transition-transform active:scale-90 cursor-pointer border-0"
                                                                    title="Quitar imagen"
                                                                >
                                                                    <i className="bi bi-x-lg"></i>
                                                                </button>
                                                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                                                    <p className="text-[10px] text-white truncate m-0 text-center font-medium px-1">
                                                                        {preview.name}
                                                                    </p>
                                                                    <p className="text-[9px] text-slate-300 text-center m-0">
                                                                        {(preview.size / 1024).toFixed(0)} KB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                            <button
                                                type="button"
                                                onClick={resetForm}
                                                disabled={submitting}
                                                className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border hover:bg-slate-500/10 transition-colors cursor-pointer"
                                                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
                                            >
                                                {submitting && <div className="spinner-border spinner-border-sm" role="status"></div>}
                                                <span>{editId ? 'Guardar Cambios' : 'Crear Tarea'}</span>
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
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="font-bold text-xs sm:text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                                                                    {item.titulo}
                                                                </span>
                                                                {item.total_imagenes > 0 && (
                                                                    <span
                                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 shrink-0 shadow-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors"
                                                                        title={`Este ticket tiene ${item.total_imagenes} evidencia(s) adjunta(s). Haz clic para consultarlas.`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleView(item);
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
                                                                                title={isAdmin
                                                                                    ? `Este ticket tiene ${totalResp} intervención(es) en su línea de tiempo. Haz clic para consultar o agregar.`
                                                                                    : `El equipo de soporte ha registrado ${totalResp} intervención(es) para tu ticket. Haz clic para leerlas.`}
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
                                                                                title="Tu requerimiento está en espera de diagnóstico por el equipo de soporte."
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
                                                                {/* Botón de Acción Directa para Responder (Solo Administrador) */}
                                                                {isAdmin && (
                                                                    <button
                                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center border-0 transition-all cursor-pointer ${item.respuesta_admin
                                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white'
                                                                            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white'
                                                                            }`}
                                                                        title={item.respuesta_admin ? "Modificar respuesta técnica" : "Responder directamente al ticket"}
                                                                        onClick={() => handleOpenQuickResponse(item)}
                                                                    >
                                                                        <i className={item.respuesta_admin ? "bi bi-chat-dots-fill" : "bi bi-chat-dots"}></i>
                                                                    </button>
                                                                )}
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

            {/* Modal Ver Detalles de Tarea con Galería de Evidencias */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
                {viewItem && (
                    <>
                        <Modal.Header closeButton className="border-b">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    #{viewItem.id}
                                </span>
                                <Modal.Title className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {viewItem.titulo}
                                </Modal.Title>
                            </div>
                        </Modal.Header>
                        <Modal.Body className="p-4 sm:p-6 space-y-4">
                            {/* Chips de estado, prioridad, creador y fecha */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div className="p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Estado</span>
                                    <span className={`inline-flex items-center gap-1 font-bold ${getEstadoBadge(viewItem.estado || 'Pendiente').color}`}>
                                        <span className={`w-2 h-2 rounded-full ${getStatusDotColor(viewItem.estado || 'Pendiente')}`}></span>
                                        {viewItem.estado || 'Pendiente'}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Prioridad</span>
                                    <span className={`inline-block font-bold ${getPriorityBadge(viewItem.prioridad || 'Baja').color}`}>
                                        {viewItem.prioridad || 'Baja'}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Creador</span>
                                    <span className="font-semibold truncate block" style={{ color: 'var(--text-primary)' }}>
                                        {viewItem.usuario_nombre || 'Usuario'}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Fecha</span>
                                    <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                                        {getFormattedDate(viewItem.created_at).split(' ')[0]}
                                    </span>
                                </div>
                            </div>

                            {/* Diagnóstico / Descripción */}
                            <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                                <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <i className="bi bi-file-text-fill text-blue-600"></i>
                                    <span>Diagnóstico / Descripción detallada</span>
                                </div>
                                <p className="text-xs sm:text-sm m-0 whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                    {viewItem.descripcion || 'Sin descripción detallada registrada.'}
                                </p>
                            </div>

                            {/* SECCIÓN TIMELINE DE SEGUIMIENTO Y RESPUESTAS TÉCNICAS (Jira/Zendesk) */}
                            {(() => {
                                const respuestasList = (viewItem.respuestas && viewItem.respuestas.length > 0)
                                    ? viewItem.respuestas
                                    : (viewItem.respuesta_admin ? [{
                                        id: 'legacy',
                                        mensaje: viewItem.respuesta_admin,
                                        admin_nombre: viewItem.admin_nombre || 'Soporte Técnico',
                                        created_at: viewItem.fecha_respuesta || viewItem.updated_at
                                    }] : []);

                                const totalRespuestas = respuestasList.length;
                                const ultimaRespuesta = totalRespuestas > 0 ? respuestasList[totalRespuestas - 1] : null;
                                const respuestasAnteriores = totalRespuestas > 1 ? respuestasList.slice(0, -1).reverse() : [];

                                return (
                                    <div
                                        className={`p-4 rounded-xl border ${totalRespuestas > 0
                                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                                            : 'border-dashed'}`}
                                        style={totalRespuestas === 0 ? { backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' } : {}}
                                    >
                                        {/* Cabecera del Timeline */}
                                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                                                    <i className="bi bi-clock-history text-base"></i>
                                                    <span>
                                                        {isAdmin ? 'Línea de Tiempo' : 'Seguimiento de Soporte'}
                                                    </span>
                                                </div>
                                                {totalRespuestas > 0 && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                                                        {totalRespuestas} {totalRespuestas === 1 ? 'intervención' : 'intervenciones'}
                                                    </span>
                                                )}
                                            </div>

                                            {isAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenQuickResponse(viewItem)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer shrink-0"
                                                    title="Agregar una nueva indicación o solución técnica"
                                                >
                                                    <i className="bi bi-plus-circle"></i>
                                                    <span>{totalRespuestas > 0 ? 'Nueva intervención' : 'Responder ticket'}</span>
                                                </button>
                                            )}
                                        </div>

                                        {totalRespuestas > 0 ? (
                                            <div className="space-y-4">
                                                {/* TARJETA DESTACADA: Intervención Más Reciente / Vigente */}
                                                <div className="p-3.5 sm:p-4 rounded-xl border-2 border-emerald-500/80 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-xs space-y-2">
                                                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-600 text-white shadow-xs">
                                                            <i className="bi bi-star-fill text-[9px]"></i> Dictamen Más Reciente
                                                        </span>
                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                            <i className="bi bi-calendar3"></i>
                                                            {getFormattedDate(ultimaRespuesta.created_at)}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs sm:text-sm m-0 whitespace-pre-wrap leading-relaxed font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                        {ultimaRespuesta.mensaje}
                                                    </p>

                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-between flex-wrap gap-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <i className="bi bi-person-check-fill text-emerald-600"></i>
                                                            <span>
                                                                {isAdmin
                                                                    ? <>Registrado por: <strong>{ultimaRespuesta.admin_nombre}</strong></>
                                                                    : <>Atendido por Soporte: <strong>{ultimaRespuesta.admin_nombre}</strong></>}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                                                            Solución activa
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* HISTORIAL CRONOLÓGICO: Intervenciones Anteriores */}
                                                {respuestasAnteriores.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/60">
                                                        <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-3">
                                                            <i className="bi bi-clock-history text-slate-500"></i>
                                                            <span>Historial de Intervenciones Previas ({respuestasAnteriores.length})</span>
                                                        </div>

                                                        {/* Línea de tiempo vertical */}
                                                        <div className="relative pl-6 space-y-3.5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                                                            {respuestasAnteriores.map((resp, idx) => (
                                                                <div key={resp.id || idx} className="relative group">
                                                                    {/* Nodo / Punto de la Línea de Tiempo */}
                                                                    <span className="absolute -left-6 top-2 w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500 border-2 border-white dark:border-slate-900 shadow-xs"></span>

                                                                    <div className="p-3 rounded-xl border bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5 shadow-xs">
                                                                        <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-200/50 dark:border-slate-700/40">
                                                                            <span className="font-semibold flex items-center gap-1">
                                                                                <i className="bi bi-person-fill text-slate-400"></i>
                                                                                {resp.admin_nombre || 'Soporte Técnico'}
                                                                            </span>
                                                                            <span className="flex items-center gap-1 text-[10px]">
                                                                                <i className="bi bi-calendar-event"></i>
                                                                                {getFormattedDate(resp.created_at)}
                                                                            </span>
                                                                        </div>
                                                                        <p className="m-0 whitespace-pre-wrap opacity-90 leading-relaxed font-normal" style={{ color: 'var(--text-primary)' }}>
                                                                            {resp.mensaje}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="py-2 text-slate-400">
                                                <p className="text-xs m-0 italic">
                                                    {isAdmin
                                                        ? 'Este ticket aún no cuenta con respuestas o intervenciones registradas. Utiliza el botón "Responder ticket" para registrar la primera indicación técnica.'
                                                        : 'Tu requerimiento está siendo evaluado por el equipo de soporte. Todas las actualizaciones y soluciones técnicas se registrarán cronológicamente en esta línea de tiempo.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Galería de Imágenes / Evidencias */}
                            <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                                        <i className="bi bi-camera-fill text-blue-600"></i>
                                        <span>Evidencias</span>
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                                        {viewItem.imagenes?.length || 0} de 5 imágenes
                                    </span>
                                </div>

                                {viewItem.imagenes && viewItem.imagenes.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                        {viewItem.imagenes.map((img) => (
                                            <div
                                                key={img.id}
                                                onClick={() => setLightboxImage(img)}
                                                className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-square cursor-pointer shadow-xs hover:shadow-md transition-all hover:scale-[1.02]"
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={img.nombre_original}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-white text-center">
                                                    <i className="bi bi-zoom-in text-xl mb-1"></i>
                                                    <span className="text-[10px] font-semibold truncate w-full">Ver imagen</span>
                                                </div>
                                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                                                    <p className="text-[10px] text-white truncate m-0 text-center font-medium">
                                                        {img.nombre_original}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                                        <i className="bi bi-image text-3xl opacity-40 block mb-1"></i>
                                        <span className="text-xs">No se adjuntaron evidencias para este ticket.</span>
                                    </div>
                                )}
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="border-t">
                            <button
                                type="button"
                                onClick={() => setShowViewModal(false)}
                                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            {/* Modal Lightbox para visualización en alta resolución */}
            <Modal show={!!lightboxImage} onHide={() => setLightboxImage(null)} centered size="xl">
                {lightboxImage && (
                    <>
                        <Modal.Header closeButton className="border-b py-2.5 px-4">
                            <div className="flex items-center gap-2 truncate">
                                <i className="bi bi-image text-blue-600 text-lg"></i>
                                <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                                    {lightboxImage.nombre_original}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    ({(lightboxImage.peso_bytes / 1024).toFixed(0)} KB)
                                </span>
                            </div>
                        </Modal.Header>
                        <Modal.Body className="p-2 sm:p-4 bg-black/95 flex items-center justify-center min-h-[50vh] max-h-[80vh] overflow-auto">
                            <img
                                src={lightboxImage.url}
                                alt={lightboxImage.nombre_original}
                                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
                            />
                        </Modal.Body>
                        <Modal.Footer className="border-t py-2 px-4 flex justify-between items-center">
                            <a
                                href={lightboxImage.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1.5"
                            >
                                <i className="bi bi-box-arrow-up-right"></i>
                                <span>Abrir en nueva pestaña</span>
                            </a>
                            <button
                                type="button"
                                onClick={() => setLightboxImage(null)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-600 hover:bg-slate-700 text-white transition-all cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
            {/* Modal de Respuesta Rápida Directa (Solo Administrador) */}
            <Modal show={showResponseModal} onHide={() => setShowResponseModal(false)} centered size="lg">
                {responseItem && (
                    <Form onSubmit={handleSaveQuickResponse}>
                        <Modal.Header closeButton className="border-b">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    Ticket #{responseItem.id}
                                </span>
                                <Modal.Title className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {responseItem.respuesta_admin ? 'Modificar Respuesta Técnica' : 'Responder al Ticket'}
                                </Modal.Title>
                            </div>
                        </Modal.Header>
                        <Modal.Body className="p-4 sm:p-6 space-y-4">
                            {/* Información del Ticket */}
                            <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                                        Solicitante: <strong style={{ color: 'var(--text-primary)' }}>{responseItem.usuario_nombre || 'Usuario'}</strong>
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                        {getFormattedDate(responseItem.created_at).split(' ')[0]}
                                    </span>
                                </div>
                                <div className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {responseItem.titulo}
                                </div>
                                {responseItem.descripcion && (
                                    <p className="text-xs opacity-75 mt-1.5 mb-0 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                        {responseItem.descripcion}
                                    </p>
                                )}
                            </div>

                            {/* Selector de Nuevo Estado */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                    Estado del ticket al guardar la respuesta
                                </label>
                                <Form.Select
                                    value={responseStatusId}
                                    onChange={(e) => setResponseStatusId(e.target.value)}
                                    className="text-xs sm:text-sm"
                                >
                                    {estados.map((est) => (
                                        <option key={est.id} value={est.id}>
                                            {est.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>

                            {/* Campo de Respuesta / Dictamen */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                    Solución para el usuario <span className="text-red-500">*</span>
                                </label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Detalla las instrucciones, solución aplicada o motivo de atención para el usuario..."
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    className="text-xs sm:text-sm border-emerald-300 dark:border-emerald-800 focus:border-emerald-500"
                                    required
                                    autoFocus
                                />
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Este dictamen quedará disponible inmediatamente para el usuario solicitante en su panel.
                                </span>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="border-t">
                            <button
                                type="button"
                                onClick={() => setShowResponseModal(false)}
                                disabled={savingResponse}
                                className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border hover:bg-slate-500/10 transition-colors cursor-pointer"
                                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={savingResponse}
                                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2"
                            >
                                {savingResponse && <div className="spinner-border spinner-border-sm" role="status"></div>}
                                <i className="bi bi-send-fill"></i>
                                <span>{responseItem.respuesta_admin ? 'Actualizar Respuesta' : 'Guardar y Enviar Respuesta'}</span>
                            </button>
                        </Modal.Footer>
                    </Form>
                )}
            </Modal>
        </div>
    );
}

export default GestionTareas;