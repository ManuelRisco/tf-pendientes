/**
 * Utilidades centralizadas para formateo de fechas en formato día/mes/año (DD/MM/YYYY)
 */

/**
 * Formatea una fecha en formato día/mes/año (DD/MM/YYYY)
 * Evita desfases de zona horaria con strings tipo YYYY-MM-DD
 * @param {string|Date} dateStr 
 * @returns {string} Ej: '20/08/2026'
 */
export function formatDate(dateStr) {
    if (!dateStr) return '—';
    const str = String(dateStr).trim();
    
    // Si viene como YYYY-MM-DD o YYYY-MM-DD HH:mm:ss o ISO
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        const [, year, month, day] = match;
        return `${day}/${month}/${year}`;
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Formatea una fecha y hora en formato día/mes/año hora:minutos (DD/MM/YYYY HH:mm)
 * @param {string|Date} dateStr 
 * @returns {string} Ej: '20/08/2026 15:30'
 */
export function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const str = String(dateStr).trim();

    // Si viene como YYYY-MM-DD HH:mm:ss
    const matchWithTime = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
    if (matchWithTime) {
        const [, year, month, day, hours, minutes] = matchWithTime;
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    // Si viene solo YYYY-MM-DD
    const matchDateOnly = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (matchDateOnly) {
        const [, year, month, day] = matchDateOnly;
        return `${day}/${month}/${year}`;
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Convierte un string ISO 'YYYY-MM-DD' a string de visualización 'DD/MM/YYYY'
 * @param {string} isoStr 
 * @returns {string} Ej: '20/08/2026'
 */
export function isoToDisplayDate(isoStr) {
    if (!isoStr) return '';
    const match = String(isoStr).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return '';
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
}

/**
 * Convierte un string 'DD/MM/YYYY' a string ISO 'YYYY-MM-DD' válido o null si es inválido
 * @param {string} displayStr 
 * @returns {string|null} Ej: '2026-08-20'
 */
export function displayDateToISO(displayStr) {
    if (!displayStr) return '';
    const match = String(displayStr).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const [, d, m, y] = match;
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) return null;
    
    const testDate = new Date(year, month - 1, day);
    if (testDate.getFullYear() !== year || testDate.getMonth() !== month - 1 || testDate.getDate() !== day) {
        return null;
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Retorna la fecha de hoy en formato ISO local 'YYYY-MM-DD' (evitando desfases UTC)
 * @returns {string}
 */
export function getTodayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Retorna una fecha pasada en formato ISO local 'YYYY-MM-DD'
 * @param {number} months 
 * @returns {string}
 */
export function getMonthsAgoISO(months = 1) {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Retorna una representación en tiempo relativo amigable ('Justo ahora', 'Hace 5 min', 'Ayer', etc.)
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function getTimeAgo(dateStr) {
    if (!dateStr) return '—';
    const now = new Date();
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 10) return 'Justo ahora';
    if (diffInSeconds < 60) return `Hace ${diffInSeconds} s`;
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return formatDate(dateStr);
}

