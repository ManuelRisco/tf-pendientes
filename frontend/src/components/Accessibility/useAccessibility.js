import { useState, useEffect, useRef } from 'react';

export function useAccessibility() {
    const [isOpen, setIsOpen] = useState(false);
    
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

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (dyslexiaFont) {
            document.body.classList.add('dyslexia-font');
        } else {
            document.body.classList.remove('dyslexia-font');
        }
        localStorage.setItem('dyslexiaFont', dyslexiaFont);
    }, [dyslexiaFont]);

    useEffect(() => {
        document.body.classList.remove('filter-protanopia', 'filter-deuteranopia', 'filter-tritanopia', 'filter-grayscale', 'filter-high-contrast');
        
        if (colorFilter !== 'none') {
            document.body.classList.add(`filter-${colorFilter}`);
        }
        localStorage.setItem('colorFilter', colorFilter);
    }, [colorFilter]);

    useEffect(() => {
        document.documentElement.style.fontSize = fontSize;
        localStorage.setItem('fontSize', fontSize);
    }, [fontSize]);

    const resetAccessibility = () => {
        setDyslexiaFont(false);
        setColorFilter('none');
        setFontSize('100%');
        localStorage.removeItem('dyslexiaFont');
        localStorage.removeItem('colorFilter');
        localStorage.removeItem('fontSize');
    };

    const hasCustomSettings = dyslexiaFont || colorFilter !== 'none' || fontSize !== '100%';

    return {
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
    };
}
