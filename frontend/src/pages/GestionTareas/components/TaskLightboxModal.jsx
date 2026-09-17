import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

export default function TaskLightboxModal({ lightboxImage, setLightboxImage }) {
    if (!lightboxImage) return null;

    return (
        <Modal show={!!lightboxImage} onHide={() => setLightboxImage(null)} centered size="xl">
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
                    className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-600 hover:bg-slate-700 text-white transition-all cursor-pointer active:scale-95"
                >
                    Cerrar
                </button>
            </Modal.Footer>
        </Modal>
    );
}

TaskLightboxModal.propTypes = {
    lightboxImage: PropTypes.shape({
        url: PropTypes.string,
        nombre_original: PropTypes.string,
        peso_bytes: PropTypes.number
    }),
    setLightboxImage: PropTypes.func.isRequired
};
