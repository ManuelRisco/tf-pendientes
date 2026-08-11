import PropTypes from 'prop-types';

const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-xs order-2 sm:order-1" style={{ color: 'var(--text-secondary)' }}>
                Página <strong style={{ color: 'var(--text-primary)' }}>{currentPage}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1 sm:gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                {/* Primera página */}
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-500/10 transition-colors"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    title="Primera página"
                    aria-label="Primera página"
                >
                    <i className="bi bi-chevron-double-left"></i>
                </button>

                {/* Anterior */}
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-500/10 transition-colors"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    title="Página anterior"
                    aria-label="Página anterior"
                >
                    <i className="bi bi-chevron-left"></i>
                </button>

                {startPage > 1 && (
                    <span className="px-1 text-xs opacity-50">...</span>
                )}

                {/* Páginas */}
                {pages.map((p) => {
                    const isActive = p === currentPage;
                    return (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-semibold transition-all ${
                                isActive
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/30 font-bold'
                                    : 'hover:bg-slate-500/10'
                            }`}
                            style={{ 
                                borderColor: isActive ? '#2563eb' : 'var(--border-color)',
                                color: isActive ? '#ffffff' : 'var(--text-primary)'
                            }}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {p}
                        </button>
                    );
                })}

                {endPage < totalPages && (
                    <span className="px-1 text-xs opacity-50">...</span>
                )}

                {/* Siguiente */}
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-500/10 transition-colors"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    title="Página siguiente"
                    aria-label="Página siguiente"
                >
                    <i className="bi bi-chevron-right"></i>
                </button>

                {/* Última página */}
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(totalPages)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-500/10 transition-colors"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    title="Última página"
                    aria-label="Última página"
                >
                    <i className="bi bi-chevron-double-right"></i>
                </button>
            </div>
        </div>
    );
};

CustomPagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default CustomPagination;
