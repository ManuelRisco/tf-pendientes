import { useState, useEffect, useRef } from 'react';
import './Accessibility.css';

function AccessibilityMenu() {
    const [isOpen, setIsOpen] = useState(false);
    
    // Estados cargados de localStorage o por defecto
    const [dyslexiaFont, setDyslexiaFont] = useState(() => {
        return localStorage.getItem('dyslexiaFont') === 'true';
    });
    
    const [colorFilter, setColorFilter] = useState(() => {
        return localStorage.getItem('colorFilter') || 'none';
    });

    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('fontSize') || '100%';
    });

    const menuRef = useRef(null);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Efecto para aplicar fuente de dislexia
    useEffect(() => {
        if (dyslexiaFont) {
            document.body.classList.add('dyslexia-font');
        } else {
            document.body.classList.remove('dyslexia-font');
        }
        localStorage.setItem('dyslexiaFont', dyslexiaFont);
    }, [dyslexiaFont]);

    // Efecto para aplicar filtros de color
    useEffect(() => {
        // Remover clases anteriores
        document.body.classList.remove('filter-protanopia', 'filter-deuteranopia', 'filter-tritanopia', 'filter-grayscale', 'filter-high-contrast');
        
        if (colorFilter !== 'none') {
            document.body.classList.add(`filter-${colorFilter}`);
        }
        localStorage.setItem('colorFilter', colorFilter);
    }, [colorFilter]);

    // Efecto para aplicar el tamaño de fuente globalmente
    useEffect(() => {
        document.documentElement.style.fontSize = fontSize;
        localStorage.setItem('fontSize', fontSize);
    }, [fontSize]);

    return (
        <div className="accessibility-wrapper" ref={menuRef}>
            <button 
                className="icon-btn" 
                onClick={() => setIsOpen(!isOpen)}
                title="Opciones de Accesibilidad"
                aria-label="Opciones de Accesibilidad"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <i className="bi bi-universal-access-circle" aria-hidden="true"></i>
            </button>

            {isOpen && (
                <div className="accessibility-dropdown" role="dialog" aria-label="Menú de Accesibilidad">
                    <div className="accessibility-header">
                        <i className="bi bi-universal-access-circle" aria-hidden="true"></i>
                        <span>Accesibilidad</span>
                    </div>
                    
                    <div className="accessibility-body">
                        {/* Toggle Dislexia */}
                        <div className="accessibility-option">
                            <div className="option-info">
                                <i className="bi bi-type" aria-hidden="true"></i>
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

                        <hr className="dropdown-divider" aria-hidden="true" />

                        {/* Tamaño de Texto */}
                        <div className="accessibility-section" role="radiogroup" aria-labelledby="fontsize-label">
                            <span className="section-title" id="fontsize-label">Tamaño de Texto</span>
                            
                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="fontSize" 
                                    value="75%" 
                                    checked={fontSize === '75%'}
                                    onChange={(e) => setFontSize(e.target.value)}
                                    aria-label="Tamaño de texto 75%"
                                />
                                <span>Pequeño (75%)</span>
                            </label>

                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="fontSize" 
                                    value="100%" 
                                    checked={fontSize === '100%'}
                                    onChange={(e) => setFontSize(e.target.value)}
                                    aria-label="Tamaño de texto normal"
                                />
                                <span>Normal (100%)</span>
                            </label>

                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="fontSize" 
                                    value="125%" 
                                    checked={fontSize === '125%'}
                                    onChange={(e) => setFontSize(e.target.value)}
                                    aria-label="Tamaño de texto 125%"
                                />
                                <span>Grande (125%)</span>
                            </label>

                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="fontSize" 
                                    value="150%" 
                                    checked={fontSize === '150%'}
                                    onChange={(e) => setFontSize(e.target.value)}
                                    aria-label="Tamaño de texto 150%"
                                />
                                <span>Extra Grande (150%)</span>
                            </label>
                        </div>

                        <hr className="dropdown-divider" aria-hidden="true" />

                        {/* Filtros de Color */}
                        <div className="accessibility-section" role="radiogroup" aria-labelledby="filters-label">
                            <span className="section-title" id="filters-label">Filtros Visuales</span>
                            
                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="colorFilter" 
                                    value="none" 
                                    checked={colorFilter === 'none'}
                                    onChange={(e) => setColorFilter(e.target.value)}
                                    aria-label="Sin filtro normal"
                                />
                                <span>Sin filtro (Normal)</span>
                            </label>

                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="colorFilter" 
                                    value="protanopia" 
                                    checked={colorFilter === 'protanopia'}
                                    onChange={(e) => setColorFilter(e.target.value)}
                                    aria-label="Filtro de Protanopía, rojo débil"
                                />
                                <span>Protanopía (Rojo débil)</span>
                            </label>

                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="colorFilter" 
                                    value="deuteranopia" 
                                    checked={colorFilter === 'deuteranopia'}
                                    onChange={(e) => setColorFilter(e.target.value)}
                                    aria-label="Filtro de Deuteranopía, verde débil"
                                />
                                <span>Deuteranopía (Verde débil)</span>
                            </label>

                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="colorFilter" 
                                    value="tritanopia" 
                                    checked={colorFilter === 'tritanopia'}
                                    onChange={(e) => setColorFilter(e.target.value)}
                                    aria-label="Filtro de Tritanopía, azul débil"
                                />
                                <span>Tritanopía (Azul débil)</span>
                            </label>

                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="colorFilter" 
                                    value="grayscale" 
                                    checked={colorFilter === 'grayscale'}
                                    onChange={(e) => setColorFilter(e.target.value)}
                                    aria-label="Filtro de Escala de Grises"
                                />
                                <span>Escala de Grises</span>
                            </label>
                            
                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="colorFilter" 
                                    value="high-contrast" 
                                    checked={colorFilter === 'high-contrast'}
                                    onChange={(e) => setColorFilter(e.target.value)}
                                    aria-label="Filtro de Alto Contraste"
                                />
                                <span>Alto Contraste</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccessibilityMenu;
