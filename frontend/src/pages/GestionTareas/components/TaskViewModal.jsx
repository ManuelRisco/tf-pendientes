import PropTypes from 'prop-types';
import { Modal, Form } from 'react-bootstrap';
import { getEstadoBadge, getPriorityBadge } from '../../../lib/themeConstants';

export default function TaskViewModal({
    showViewModal,
    setShowViewModal,
    setScrollTarget,
    viewItem,
    user,
    isAdmin,
    handleEdit,
    handleOpenQuickResponse,
    handleSaveQuickResponse,
    savingResponse,
    responseText,
    setResponseText,
    responseStatusId,
    setResponseStatusId,
    responseInputRef,
    estados,
    imagesSectionRef,
    highlightImages,
    setLightboxImage,
    getFormattedDate,
    getStatusDotColor
}) {
    if (!viewItem) return null;

    return (
        <Modal
            show={showViewModal}
            onHide={() => {
                setShowViewModal(false);
                setScrollTarget(null);
            }}
            centered
            size="lg"
        >
            <Modal.Header closeButton className="border-b">
                <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            #{viewItem.id}
                        </span>
                        <Modal.Title className="text-base sm:text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                            {viewItem.titulo}
                        </Modal.Title>
                    </div>
                    {(viewItem.usuario_nombre || viewItem.usuario_email) && (
                        <div className="text-xs flex items-center gap-2 text-slate-500 dark:text-slate-400 flex-wrap">
                            <span>Solicitado por: <strong className="text-slate-700 dark:text-slate-200">{viewItem.usuario_nombre || 'Usuario'}</strong></span>
                            {(viewItem.usuario_email || viewItem.email) && (
                                <>
                                    <span>•</span>
                                    <a
                                        href={`mailto:${viewItem.usuario_email || viewItem.email}`}
                                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline no-underline"
                                        title={`Enviar correo a ${viewItem.usuario_email || viewItem.email}`}
                                    >
                                        <i className="bi bi-envelope"></i>
                                        <span>{viewItem.usuario_email || viewItem.email}</span>
                                    </a>
                                </>
                            )}
                        </div>
                    )}
                </div>
                {Number(viewItem.usuario_id) === Number(user?.id) && (
                    <button
                        type="button"
                        onClick={() => {
                            setShowViewModal(false);
                            handleEdit(viewItem);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-200 dark:border-blue-800 ml-auto mr-2 shrink-0 active:scale-95"
                        title="Editar datos de mi ticket"
                    >
                        <i className="bi bi-pencil"></i>
                        <span>Editar mi ticket</span>
                    </button>
                )}
            </Modal.Header>
            <Modal.Body className="p-4 sm:p-6 space-y-4">
                {/* Chips de estado, prioridad, creador y fecha */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Estado</span>
                        <span className={`inline-flex items-center gap-1 font-bold ${getEstadoBadge(viewItem.estado || 'Pendiente').color}`}>
                            <span className={`w-2 h-2 rounded-full ${getStatusDotColor(viewItem.estado || 'Pendiente')}`}></span>
                            {viewItem.estado || 'Pendiente'}
                        </span>
                    </div>
                    <div className="p-2.5 rounded-xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Prioridad</span>
                        <span className={`inline-block font-bold ${getPriorityBadge(viewItem.prioridad || 'Baja').color}`}>
                            {viewItem.prioridad || 'Baja'}
                        </span>
                    </div>
                    <div className="p-2.5 rounded-xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Creador</span>
                            <span className="font-semibold truncate block" style={{ color: 'var(--text-primary)' }} title={viewItem.usuario_nombre || 'Usuario'}>
                                {viewItem.usuario_nombre || 'Usuario'}
                            </span>
                        </div>
                        {(viewItem.usuario_email || viewItem.email) && (
                            <a
                                href={`mailto:${viewItem.usuario_email || viewItem.email}`}
                                className="text-[11px] truncate mt-1 flex items-center gap-1 hover:underline text-blue-600 dark:text-blue-400 no-underline font-normal"
                                title={`Enviar correo a ${viewItem.usuario_email || viewItem.email}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <i className="bi bi-envelope text-[10px] shrink-0"></i>
                                <span className="truncate">{viewItem.usuario_email || viewItem.email}</span>
                            </a>
                        )}
                    </div>
                    <div className="p-2.5 rounded-xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Fecha</span>
                        <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                            {getFormattedDate(viewItem.created_at).split(' ')[0]}
                        </span>
                    </div>
                </div>

                {/* Descripción */}
                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                    <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center gap-1.5">
                        <i className="bi bi-file-text-fill text-blue-600"></i>
                        <span>Descripción</span>
                    </div>
                    <p className="text-xs sm:text-sm m-0 whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {viewItem.descripcion || 'Sin descripción registrada.'}
                    </p>
                </div>

                {/* Historial de respuestas */}
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
                                        <span>Historial de respuestas</span>
                                    </div>
                                    {totalRespuestas > 0 && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                                            {totalRespuestas} {totalRespuestas === 1 ? 'respuesta' : 'respuestas'}
                                        </span>
                                    )}
                                </div>

                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => handleOpenQuickResponse(viewItem)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer shrink-0 active:scale-95"
                                        title="Escribir respuesta"
                                    >
                                        <i className="bi bi-reply-fill"></i>
                                        <span>{totalRespuestas > 0 ? 'Nueva respuesta' : 'Responder'}</span>
                                    </button>
                                )}
                            </div>

                            {totalRespuestas > 0 ? (
                                <div className="space-y-4">
                                    {/* Última respuesta */}
                                    <div className="p-3.5 sm:p-4 rounded-xl border-2 border-emerald-500/80 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-xs space-y-2">
                                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-600 text-white shadow-xs">
                                                <i className="bi bi-chat-text-fill text-[9px]"></i> Última respuesta
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
                                                        : <>Atendido por: <strong>{ultimaRespuesta.admin_nombre}</strong></>}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                                                Respuesta actual
                                            </span>
                                        </div>
                                    </div>

                                    {/* Respuestas anteriores */}
                                    {respuestasAnteriores.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/60">
                                            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-3">
                                                <i className="bi bi-clock-history text-slate-500"></i>
                                                <span>Respuestas anteriores ({respuestasAnteriores.length})</span>
                                            </div>

                                            <div className="relative pl-6 space-y-3.5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                                                {respuestasAnteriores.map((resp, idx) => (
                                                    <div key={resp.id || idx} className="relative group">
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
                                            ? 'No hay respuestas registradas todavía. Puedes agregar una respuesta abajo.'
                                            : 'Tu ticket está en revisión. Aquí verás las respuestas del equipo de soporte.'}
                                    </p>
                                </div>
                            )}

                            {/* Formulario de respuesta rápida para administradores */}
                            {isAdmin && (
                                <div className="mt-4 pt-4 border-t border-emerald-200/80 dark:border-emerald-800/60">
                                    <Form onSubmit={handleSaveQuickResponse} className="space-y-3">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 m-0">
                                                <i className="bi bi-chat-left-dots-fill text-emerald-600"></i>
                                                <span>Nueva respuesta</span>
                                                <span className="text-[11px] font-normal opacity-70">(Opcional)</span>
                                            </label>
                                        </div>

                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            ref={responseInputRef}
                                            placeholder="Escribe una respuesta o solución para este ticket (opcional)..."
                                            value={responseText}
                                            onChange={(e) => setResponseText(e.target.value)}
                                            className="text-xs sm:text-sm border-emerald-300 dark:border-emerald-800 focus:border-emerald-500"
                                        />

                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0 m-0">
                                                    Estado del ticket:
                                                </label>
                                                <Form.Select
                                                    size="sm"
                                                    value={responseStatusId}
                                                    onChange={(e) => setResponseStatusId(e.target.value)}
                                                    className="text-xs max-w-[200px]"
                                                >
                                                    {estados.map((est) => (
                                                        <option key={est.id} value={est.id}>
                                                            {est.nombre}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={savingResponse}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                                            >
                                                {savingResponse && <div className="spinner-border spinner-border-sm" role="status"></div>}
                                                <i className={responseText.trim() ? "bi bi-send-fill" : "bi bi-check2-circle"}></i>
                                                <span>{responseText.trim() ? 'Guardar respuesta' : 'Actualizar ticket'}</span>
                                            </button>
                                        </div>
                                    </Form>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* Imágenes adjuntas */}
                <div
                    ref={imagesSectionRef}
                    id="seccion-imagenes-modal"
                    className={`p-3.5 rounded-xl border scroll-mt-6 transition-all duration-700 ${highlightImages
                        ? 'ring-2 ring-blue-500/60 shadow-lg shadow-blue-500/10'
                        : ''
                        }`}
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                >
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                            <i className="bi bi-camera-fill text-blue-600"></i>
                            <span>Imágenes adjuntas</span>
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
                            <span className="text-xs">No hay imágenes adjuntas en este ticket.</span>
                        </div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer className="border-t">
                <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
                >
                    Cerrar
                </button>
            </Modal.Footer>
        </Modal>
    );
}

TaskViewModal.propTypes = {
    showViewModal: PropTypes.bool.isRequired,
    setShowViewModal: PropTypes.func.isRequired,
    setScrollTarget: PropTypes.func.isRequired,
    viewItem: PropTypes.object,
    user: PropTypes.object,
    isAdmin: PropTypes.bool,
    handleEdit: PropTypes.func.isRequired,
    handleOpenQuickResponse: PropTypes.func.isRequired,
    handleSaveQuickResponse: PropTypes.func.isRequired,
    savingResponse: PropTypes.bool.isRequired,
    responseText: PropTypes.string.isRequired,
    setResponseText: PropTypes.func.isRequired,
    responseStatusId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    setResponseStatusId: PropTypes.func.isRequired,
    responseInputRef: PropTypes.object,
    estados: PropTypes.array.isRequired,
    imagesSectionRef: PropTypes.object,
    highlightImages: PropTypes.bool.isRequired,
    setLightboxImage: PropTypes.func.isRequired,
    getFormattedDate: PropTypes.func.isRequired,
    getStatusDotColor: PropTypes.func.isRequired
};
