import { useAccessibility } from './useAccessibility';
import './Accessibility.css';

function AccessibilityMenu() {
    const {
        isOpen,
        setIsOpen,
        dyslexiaFont,
        setDyslexiaFont,
        colorFilter,
        setColorFilter,
        fontSize,
        setFontSize,
        resetAccessibility,
        hasCustomSettings,
        menuRef
    } = useAccessibility();

    return (
        <div className="relative" ref={menuRef}>
            <button 
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative ${hasCustomSettings ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-500/10'}`} 
                style={{ color: hasCustomSettings ? '#2563eb' : 'var(--text-secondary)' }}
                onClick={() => setIsOpen(!isOpen)}
                title="Opciones de Accesibilidad"
                aria-label="Opciones de Accesibilidad"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <i className="bi bi-universal-access-circle text-lg" aria-hidden="true"></i>
                {hasCustomSettings && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 shadow-xs" title="Accesibilidad personalizada activa"></span>
                )}
            </button>

            {isOpen && (
                <div 
                    className="absolute top-12 right-0 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden" 
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        borderColor: 'var(--border-color)', 
                        border: '1px solid var(--border-color)', 
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--card-shadow)'
                    }}
                    role="dialog" 
                    aria-label="Menú de Accesibilidad"
                >
                    <div 
                        className="p-4 border-b flex items-center gap-2.5 font-bold text-sm"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                        <i className="bi bi-universal-access-circle text-blue-600 text-base" aria-hidden="true"></i>
                        <span>Accesibilidad</span>
                    </div>
                    
                    <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                        {/* Toggle Dislexia */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                <i className="bi bi-type opacity-70"></i>
                                <span id="dyslexia-label">Fuente para Dislexia</span>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={dyslexiaFont}
                                    onChange={(e) => setDyslexiaFont(e.target.checked)}
                                    aria-labelledby="dyslexia-label"
                                />
                                <span className="slider round" aria-hidden="true"></span>
                            </label>
                        </div>

                        <hr style={{ borderColor: 'var(--border-color)', margin: '12px 0' }} aria-hidden="true" />

                        {/* Tamaño de Texto */}
                        <div className="space-y-1.5" role="radiogroup" aria-labelledby="fontsize-label">
                            <span className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }} id="fontsize-label">
                                Tamaño de Texto
                            </span>
                            
                            {[
                                { val: '75%', label: 'Pequeño (75%)' },
                                { val: '100%', label: 'Normal (100%)' },
                                { val: '125%', label: 'Grande (125%)' },
                                { val: '150%', label: 'Extra Grande (150%)' }
                            ].map(item => (
                                <label 
                                    key={item.val} 
                                    className="flex items-center gap-2.5 text-xs cursor-pointer py-1 hover:text-blue-500 transition-colors w-full"
                                    style={{ color: fontSize === item.val ? '#2563eb' : 'var(--text-primary)' }}
                                >
                                    <input 
                                        type="radio" 
                                        name="fontSize" 
                                        value={item.val} 
                                        checked={fontSize === item.val} 
                                        onChange={(e) => setFontSize(e.target.value)}
                                        style={{ accentColor: '#2563eb' }}
                                    />
                                    <span>{item.label}</span>
                                </label>
                            ))}
                        </div>

                        <hr style={{ borderColor: 'var(--border-color)', margin: '12px 0' }} aria-hidden="true" />

                        {/* Filtros de Color */}
                        <div className="space-y-1.5" role="radiogroup" aria-labelledby="filters-label">
                            <span className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }} id="filters-label">
                                Filtros Visuales
                            </span>
                            
                            {[
                                { val: 'none', label: 'Sin filtro (Normal)' },
                                { val: 'protanopia', label: 'Protanopía (Rojo débil)' },
                                { val: 'deuteranopia', label: 'Deuteranopía (Verde débil)' },
                                { val: 'tritanopia', label: 'Tritanopía (Azul débil)' },
                                { val: 'grayscale', label: 'Escala de Grises' },
                                { val: 'high-contrast', label: 'Alto Contraste' }
                            ].map(item => (
                                <label 
                                    key={item.val} 
                                    className="flex items-center gap-2.5 text-xs cursor-pointer py-1 hover:text-blue-500 transition-colors w-full"
                                    style={{ color: colorFilter === item.val ? '#2563eb' : 'var(--text-primary)' }}
                                >
                                    <input 
                                        type="radio" 
                                        name="colorFilter" 
                                        value={item.val} 
                                        checked={colorFilter === item.val} 
                                        onChange={(e) => setColorFilter(e.target.value)}
                                        style={{ accentColor: '#2563eb' }}
                                    />
                                    <span>{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Footer / Reset Button */}
                    <div className="p-3 border-t flex justify-end" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                        <button
                            type="button"
                            onClick={resetAccessibility}
                            disabled={!hasCustomSettings}
                            className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed border hover:bg-red-500/10 text-red-500"
                            style={{ borderColor: 'var(--border-color)' }}
                        >
                            <i className="bi bi-arrow-counterclockwise"></i>
                            <span>Restablecer predeterminados</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccessibilityMenu;
