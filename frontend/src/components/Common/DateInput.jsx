import { useState, useEffect, useRef, useMemo } from 'react';
import { isoToDisplayDate, displayDateToISO, getTodayISO } from '../../lib/dateUtils';

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

/**
 * Componente DateInput con formato forzado Día/Mes/Año (DD/MM/YYYY) y selector interactivo
 * 
 * @param {string} value - Fecha en formato ISO 'YYYY-MM-DD'
 * @param {function} onChange - Callback (e) donde e.target.value es 'YYYY-MM-DD'
 * @param {string} max - Fecha máxima ISO 'YYYY-MM-DD'
 * @param {string} min - Fecha mínima ISO 'YYYY-MM-DD'
 * @param {string} placeholder - Texto guía (por defecto 'dd/mm/aaaa')
 * @param {string} name - Nombre del campo
 * @param {string} id - Id del campo
 * @param {boolean} disabled - Estado deshabilitado
 * @param {string} className - Clases CSS adicionales
 */
export default function DateInput({
    value = '',
    onChange,
    max,
    min,
    placeholder = 'dd/mm/aaaa',
    name,
    id,
    disabled = false,
    className = '',
    style = {}
}) {
    const [displayVal, setDisplayVal] = useState(() => isoToDisplayDate(value));
    const [prevValue, setPrevValue] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    
    // Vista del calendario (año y mes seleccionados para navegar)
    const [viewDate, setViewDate] = useState(() => {
        if (value) {
            const parts = value.split('-');
            if (parts.length === 3) {
                return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
            }
        }
        return new Date();
    });

    const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'
    const containerRef = useRef(null);

    // Sincronizar texto cuando cambia el value exterior sin efecto en cascada
    if (value !== prevValue) {
        setPrevValue(value);
        setDisplayVal(isoToDisplayDate(value));
        if (value) {
            const parts = value.split('-');
            if (parts.length === 3) {
                setViewDate(new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1));
            }
        }
    }

    // Cerrar al hacer clic afuera o presionar Escape
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setViewMode('days');
            }
        }
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setViewMode('days');
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const emitChange = (newIso) => {
        if (onChange) {
            onChange({
                target: {
                    name,
                    id,
                    value: newIso
                }
            });
        }
    };

    // Manejo de escritura manual con máscara DD/MM/YYYY
    const handleInputChange = (e) => {
        let text = e.target.value;
        
        // Mantener solo dígitos y barras
        const digits = text.replace(/\D/g, '').slice(0, 8);
        let formatted;
        if (digits.length <= 2) {
            formatted = digits;
        } else if (digits.length <= 4) {
            formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        } else {
            formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
        }

        setDisplayVal(formatted);

        // Si se completaron 8 dígitos (DD/MM/YYYY completo)
        if (digits.length === 8) {
            const iso = displayDateToISO(formatted);
            if (iso) {
                if (max && iso > max) {
                    emitChange(max);
                    setDisplayVal(isoToDisplayDate(max));
                } else if (min && iso < min) {
                    emitChange(min);
                    setDisplayVal(isoToDisplayDate(min));
                } else {
                    emitChange(iso);
                }
            }
        } else if (digits.length === 0) {
            emitChange('');
        }
    };

    // Al perder foco, si es inválido se restaura el valor válido previo
    const handleBlur = () => {
        if (!displayVal) {
            emitChange('');
            return;
        }
        const iso = displayDateToISO(displayVal);
        if (iso) {
            let finalIso = iso;
            if (max && iso > max) finalIso = max;
            if (min && iso < min) finalIso = min;
            emitChange(finalIso);
            setDisplayVal(isoToDisplayDate(finalIso));
        } else {
            setDisplayVal(isoToDisplayDate(value));
        }
    };

    // Navegación de mes anterior / siguiente
    const handlePrevMonth = (e) => {
        e.stopPropagation();
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Selección de fecha en el calendario
    const handleSelectDay = (day) => {
        const y = viewDate.getFullYear();
        const m = viewDate.getMonth() + 1;
        const iso = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (max && iso > max) return;
        if (min && iso < min) return;

        emitChange(iso);
        setDisplayVal(isoToDisplayDate(iso));
        setIsOpen(false);
        setViewMode('days');
    };

    const handleSelectToday = () => {
        const todayIso = getTodayISO();
        if (max && todayIso > max) {
            emitChange(max);
            setDisplayVal(isoToDisplayDate(max));
        } else if (min && todayIso < min) {
            emitChange(min);
            setDisplayVal(isoToDisplayDate(min));
        } else {
            emitChange(todayIso);
            setDisplayVal(isoToDisplayDate(todayIso));
        }
        const d = new Date();
        setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
        setIsOpen(false);
        setViewMode('days');
    };

    // Generar días del mes para el calendario
    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const totalDays = lastDayOfMonth.getDate();
        // En JavaScript getDay() es 0=Domingo, 1=Lunes. Queremos 0=Lunes ... 6=Domingo
        let startDayIndex = firstDayOfMonth.getDay() - 1;
        if (startDayIndex === -1) startDayIndex = 6;

        const prevMonthLastDay = new Date(year, month, 0).getDate();

        const days = [];

        // Días previos de relleno
        for (let i = startDayIndex - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                isCurrentMonth: false,
                isPrev: true
            });
        }

        // Días del mes actual
        for (let d = 1; d <= totalDays; d++) {
            const dayIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = dayIso === value;
            const isToday = dayIso === getTodayISO();
            const isDisabled = Boolean((max && dayIso > max) || (min && dayIso < min));

            days.push({
                day: d,
                iso: dayIso,
                isCurrentMonth: true,
                isSelected,
                isToday,
                isDisabled
            });
        }

        // Días siguientes de relleno para completar filas de 7
        const remaining = (7 - (days.length % 7)) % 7;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                isNext: true
            });
        }

        return days;
    }, [viewDate, value, max, min]);

    const yearsRange = useMemo(() => {
        const currentY = new Date().getFullYear();
        const start = currentY - 10;
        const list = [];
        for (let y = start; y <= currentY + 5; y++) {
            list.push(y);
        }
        return list;
    }, []);

    return (
        <div ref={containerRef} className={`relative inline-block ${className}`} style={style}>
            {/* Input contenedor */}
            <div 
                className="flex items-center rounded-xl border transition-all overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500"
                style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                }}
            >
                <input
                    type="text"
                    id={id}
                    name={name}
                    disabled={disabled}
                    value={displayVal}
                    placeholder={placeholder}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onClick={() => !disabled && setIsOpen(true)}
                    className="w-28 sm:w-32 px-3 py-1.5 text-xs sm:text-sm bg-transparent border-0 focus:outline-none font-medium tracking-wide cursor-pointer"
                    style={{ color: 'var(--text-primary)' }}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen(prev => !prev)}
                    title="Seleccionar fecha"
                    className="px-2.5 py-1.5 text-slate-500 hover:text-blue-500 transition-colors flex items-center justify-center cursor-pointer border-0 bg-transparent"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    <i className="bi bi-calendar3 text-xs sm:text-sm"></i>
                </button>
            </div>

            {/* Calendario Popover Flotante */}
            {isOpen && !disabled && (
                <div
                    className="absolute z-50 mt-1.5 left-0 sm:left-auto sm:right-0 w-72 rounded-2xl p-3.5 border shadow-2xl animate-fade-in backdrop-blur-md"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        boxShadow: 'var(--card-shadow)',
                        color: 'var(--text-primary)'
                    }}
                >
                    {/* Encabezado del selector */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-500/10 text-slate-500 hover:text-blue-600 transition-all cursor-pointer active:scale-95"
                            title="Mes anterior"
                        >
                            <i className="bi bi-chevron-left text-xs font-bold"></i>
                        </button>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setViewMode(prev => prev === 'months' ? 'days' : 'months')}
                                className="px-2 py-1 text-xs font-bold rounded-md hover:bg-blue-500/10 hover:text-blue-600 transition-all active:scale-95"
                            >
                                {MONTH_NAMES[viewDate.getMonth()]}
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode(prev => prev === 'years' ? 'days' : 'years')}
                                className="px-2 py-1 text-xs font-bold rounded-md hover:bg-blue-500/10 hover:text-blue-600 transition-all active:scale-95"
                            >
                                {viewDate.getFullYear()}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-500/10 text-slate-500 hover:text-blue-600 transition-all cursor-pointer active:scale-95"
                            title="Mes siguiente"
                        >
                            <i className="bi bi-chevron-right text-xs font-bold"></i>
                        </button>
                    </div>

                    {/* Vistas alternativas: Meses o Años */}
                    {viewMode === 'months' ? (
                        <div className="grid grid-cols-3 gap-1.5 py-2">
                            {MONTH_NAMES.map((mName, idx) => (
                                <button
                                    key={mName}
                                    type="button"
                                    onClick={() => {
                                        setViewDate(new Date(viewDate.getFullYear(), idx, 1));
                                        setViewMode('days');
                                    }}
                                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                                        viewDate.getMonth() === idx 
                                            ? 'bg-blue-600 text-white shadow-sm' 
                                            : 'hover:bg-blue-500/10 hover:text-blue-600'
                                    }`}
                                >
                                    {mName.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    ) : viewMode === 'years' ? (
                        <div className="grid grid-cols-4 gap-1.5 py-2 max-h-48 overflow-y-auto custom-scroll">
                            {yearsRange.map((yr) => (
                                <button
                                    key={yr}
                                    type="button"
                                    onClick={() => {
                                        setViewDate(new Date(yr, viewDate.getMonth(), 1));
                                        setViewMode('days');
                                    }}
                                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                                        viewDate.getFullYear() === yr 
                                            ? 'bg-blue-600 text-white shadow-sm' 
                                            : 'hover:bg-blue-500/10 hover:text-blue-600'
                                    }`}
                                >
                                    {yr}
                                </button>
                            ))}
                        </div>
                    ) : (
                        /* Vista estándar de Días */
                        <>
                            {/* Días de la semana */}
                            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                                {DAY_NAMES.map(d => (
                                    <span key={d} className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                        {d}
                                    </span>
                                ))}
                            </div>

                            {/* Celdas de días */}
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {calendarDays.map((item, i) => {
                                    if (!item.isCurrentMonth) {
                                        return (
                                            <span 
                                                key={i} 
                                                className="h-8 flex items-center justify-center text-xs text-slate-400/40 select-none"
                                            >
                                                {item.day}
                                            </span>
                                        );
                                    }

                                    let btnClasses = "h-8 text-xs font-medium rounded-lg flex items-center justify-center transition-all cursor-pointer ";
                                    
                                    if (item.isSelected) {
                                        btnClasses += "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30 ";
                                    } else if (item.isDisabled) {
                                        btnClasses += "opacity-25 cursor-not-allowed text-slate-400 ";
                                    } else if (item.isToday) {
                                        btnClasses += "border border-blue-500 font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-500/20 ";
                                    } else {
                                        btnClasses += "hover:bg-blue-500/10 hover:text-blue-600 ";
                                    }

                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            disabled={item.isDisabled}
                                            onClick={() => handleSelectDay(item.day)}
                                            className={btnClasses}
                                        >
                                            {item.day}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Footer de acciones rápidas */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t text-xs" style={{ borderColor: 'var(--border-color)' }}>
                        <button
                            type="button"
                            onClick={handleSelectToday}
                            className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                            Hoy ({isoToDisplayDate(getTodayISO())})
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium cursor-pointer"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
