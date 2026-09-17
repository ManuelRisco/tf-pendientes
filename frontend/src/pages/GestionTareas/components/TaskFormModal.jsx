import PropTypes from 'prop-types';
import { Modal, Form } from 'react-bootstrap';

export default function TaskFormModal({
    showModal,
    resetForm,
    editId,
    title,
    setTitle,
    description,
    setDescription,
    priorityId,
    setPriorityId,
    prioridades,
    descRef,
    fileInputRef,
    existingImages,
    selectedFiles,
    filePreviews,
    handleFileSelect,
    handleRemoveSelectedFile,
    handleDeleteExistingImage,
    setLightboxImage,
    handleSubmit,
    submitting
}) {
    return (
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
                            Título de la tarea <span className="text-red-500">*</span>
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
                            Prioridad <span className="text-red-500">*</span>
                        </label>
                        <Form.Select
                            value={priorityId}
                            onChange={e => setPriorityId(e.target.value)}
                            className="text-xs sm:text-sm"
                            required
                        >
                            <option value="">Seleccionar prioridad...</option>
                            {prioridades.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </Form.Select>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            Descripción
                        </label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            ref={descRef}
                            placeholder="Describe el problema o los detalles de la tarea..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="text-xs sm:text-sm"
                        />
                    </div>

                    {/* Imágenes adjuntas */}
                    <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs sm:text-sm font-semibold m-0 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                                <i className="bi bi-images text-blue-600"></i>
                                <span> Imágenes adjuntas</span>
                            </label>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${(existingImages.length + selectedFiles.length) >= 5
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/40'
                                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/40'
                                }`}>
                                {existingImages.length + selectedFiles.length} / 5 imágenes
                            </span>
                        </div>

                        {/* Imágenes guardadas */}
                        {editId && existingImages.length > 0 && (
                            <div className="mb-3">
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                                    Imágenes guardadas:
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

                        {/* Subida de imágenes */}
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
                                    <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center text-lg">
                                        <i className="bi bi-cloud-arrow-up-fill"></i>
                                    </div>
                                    <div>
                                        <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 block">
                                            Haz clic o arrastra fotos aquí
                                        </span>
                                        <span className="text-[11px] opacity-70 block" style={{ color: 'var(--text-secondary)' }}>
                                            PNG, JPG, WEBP hasta 5MB (máx. 5 fotos en total)
                                        </span>
                                    </div>
                                </label>
                            </div>
                        ) : (
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                                <i className="bi bi-info-circle-fill text-sm shrink-0"></i>
                                <span>Has alcanzado el límite máximo de 5 imágenes para este ticket.</span>
                            </div>
                        )}

                        {/* Previsualización de archivos nuevos seleccionados */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-3">
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                                    Nuevas fotos por subir ({selectedFiles.length}):
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                    {selectedFiles.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="relative group rounded-xl overflow-hidden border border-blue-300 dark:border-blue-700 aspect-square shadow-xs bg-slate-100 dark:bg-slate-800"
                                        >
                                            <img
                                                src={filePreviews[idx]}
                                                alt={file.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSelectedFile(idx)}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs hover:bg-rose-700 shadow-md cursor-pointer border-0"
                                                title="Quitar"
                                            >
                                                <i className="bi bi-x"></i>
                                            </button>
                                            <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1">
                                                <p className="text-[10px] text-white truncate m-0 text-center font-medium">
                                                    {(file.size / 1024).toFixed(0)} KB
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
                            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border hover:bg-slate-500/10 transition-all cursor-pointer active:scale-95"
                            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                            {submitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
                            <span>{editId ? 'Guardar Cambios' : 'Crear Tarea'}</span>
                        </button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

TaskFormModal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    resetForm: PropTypes.func.isRequired,
    editId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string.isRequired,
    setTitle: PropTypes.func.isRequired,
    description: PropTypes.string.isRequired,
    setDescription: PropTypes.func.isRequired,
    priorityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    setPriorityId: PropTypes.func.isRequired,
    prioridades: PropTypes.array.isRequired,
    descRef: PropTypes.object,
    fileInputRef: PropTypes.object,
    existingImages: PropTypes.array.isRequired,
    selectedFiles: PropTypes.array.isRequired,
    filePreviews: PropTypes.array.isRequired,
    handleFileSelect: PropTypes.func.isRequired,
    handleRemoveSelectedFile: PropTypes.func.isRequired,
    handleDeleteExistingImage: PropTypes.func.isRequired,
    setLightboxImage: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired
};
