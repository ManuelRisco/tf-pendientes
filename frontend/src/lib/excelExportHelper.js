import ExcelJS from 'exceljs';
import { formatDate } from './dateUtils';

/**
 * Dibuja un rectángulo con esquinas redondeadas y borde suave (estilo Card moderna)
 */
function drawCard(ctx, x, y, width, height, radius = 10) {
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

/**
 * Dibuja una barra vertical con solo las esquinas superiores redondeadas (radius=[8,8,0,0])
 * Idéntico a los BarCharts de Recharts en Reportes.jsx
 */
function drawBarTopRounded(ctx, x, y, width, height, radius = 6) {
    if (height <= 0) return;
    const r = Math.min(radius, width / 2, height);
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fill();
}

/**
 * Genera el Gráfico 1: "Mapeo Temporal: Tendencia en el Tiempo"
 * Exactamente igual al AreaChart con degradados de Reportes.jsx
 */
function generarGraficoTendenciaCanvas(tendenciaDiaria) {
    const canvas = document.createElement('canvas');
    canvas.width = 1100;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fondo blanco general
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tarjeta contenedora
    drawCard(ctx, 12, 12, 1076, 396, 12);

    // Título y Subtítulo idénticos a la página web
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 18px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Mapeo Temporal: Tendencia en el Tiempo', 36, 44);

    ctx.fillStyle = '#64748B';
    ctx.font = '12px Inter, Arial, sans-serif';
    ctx.fillText('Seguimiento intuitivo de tickets creados frente a resueltos por fecha.', 36, 66);

    // Leyenda idéntica a la página web (Creados en azul, Resueltos en verde)
    // Creados
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(810, 48, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2563EB';
    ctx.font = 'bold 12px Inter, Arial, sans-serif';
    ctx.fillText('Creados', 824, 52);

    // Resueltos
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(920, 48, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16A34A';
    ctx.font = 'bold 12px Inter, Arial, sans-serif';
    ctx.fillText('Resueltos', 934, 52);

    const data = tendenciaDiaria && tendenciaDiaria.length > 0 ? tendenciaDiaria : [];
    if (data.length === 0) {
        ctx.fillStyle = '#94A3B8';
        ctx.font = 'italic 15px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No se registran movimientos en el rango de fechas seleccionado.', canvas.width / 2, 230);
        return canvas.toDataURL('image/png');
    }

    const margin = { top: 96, right: 35, bottom: 50, left: 60 };
    const chartW = 1076 - margin.left - margin.right;
    const chartH = 396 - margin.top - margin.bottom;

    // Calcular escala máxima Y
    let maxVal = 1;
    data.forEach(d => {
        const c = Number(d.creados || 0);
        const r = Number(d.resueltos || 0);
        if (c > maxVal) maxVal = c;
        if (r > maxVal) maxVal = r;
    });
    maxVal = Math.ceil(maxVal * 1.2) || 4;

    // Cuadrícula horizontal con líneas punteadas (strokeDasharray="3 3")
    const gridSteps = 4;
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSteps; i++) {
        const val = Math.round((maxVal / gridSteps) * i);
        const y = margin.top + chartH - (i / gridSteps) * chartH;

        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + chartW, y);
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.font = '11px Inter, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(String(val), margin.left - 12, y + 4);
    }
    ctx.restore();

    const stepX = data.length > 1 ? chartW / (data.length - 1) : chartW / 2;

    // Dibujado de series (AreaChart con degradado y trazo de 2.5px)
    const dibujarAreaYCurva = (key, strokeColor, fillColor) => {
        // Relleno degradado
        const grad = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartH);
        grad.addColorStop(0, fillColor);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        data.forEach((d, idx) => {
            const val = Number(d[key] || 0);
            const x = margin.left + (data.length > 1 ? idx * stepX : chartW / 2);
            const y = margin.top + chartH - (val / maxVal) * chartH;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        const lastX = margin.left + (data.length > 1 ? (data.length - 1) * stepX : chartW / 2);
        const firstX = margin.left + (data.length > 1 ? 0 : chartW / 2);
        ctx.lineTo(lastX, margin.top + chartH);
        ctx.lineTo(firstX, margin.top + chartH);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Línea principal
        ctx.beginPath();
        data.forEach((d, idx) => {
            const val = Number(d[key] || 0);
            const x = margin.left + (data.length > 1 ? idx * stepX : chartW / 2);
            const y = margin.top + chartH - (val / maxVal) * chartH;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Puntos si la cantidad de días es moderada (<= 25 días)
        if (data.length <= 25) {
            data.forEach((d, idx) => {
                const val = Number(d[key] || 0);
                const x = margin.left + (data.length > 1 ? idx * stepX : chartW / 2);
                const y = margin.top + chartH - (val / maxVal) * chartH;
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(x, y, 3.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        }
    };

    dibujarAreaYCurva('creados', '#3B82F6', 'rgba(59, 130, 246, 0.35)');
    dibujarAreaYCurva('resueltos', '#10B981', 'rgba(16, 185, 129, 0.35)');

    // Eje X con línea base
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartH);
    ctx.lineTo(margin.left + chartW, margin.top + chartH);
    ctx.stroke();

    // Etiquetas de fechas espaciadas limpiamente
    ctx.fillStyle = '#64748B';
    ctx.font = '11px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';

    const tickSkip = data.length <= 8 ? 1 : Math.ceil(data.length / 8);
    data.forEach((d, idx) => {
        if (idx % tickSkip === 0 || idx === data.length - 1) {
            const x = margin.left + (data.length > 1 ? idx * stepX : chartW / 2);
            const raw = d.fecha || '';
            const parts = raw.split('-');
            const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : raw;
            ctx.fillText(label, x, margin.top + chartH + 20);

            // Marca de eje
            ctx.strokeStyle = '#CBD5E1';
            ctx.beginPath();
            ctx.moveTo(x, margin.top + chartH);
            ctx.lineTo(x, margin.top + chartH + 4);
            ctx.stroke();
        }
    });

    return canvas.toDataURL('image/png');
}

/**
 * Genera los Gráficos 2 y 3: "Estado de Tickets" y "Distribución por Prioridad"
 * Presentados en dos tarjetas lado a lado, con BARRAS VERTICALES idénticas a la aplicación web.
 */
function generarGraficoDistribucionCanvas(distribucionPrioridad, distribucionEstado) {
    const canvas = document.createElement('canvas');
    canvas.width = 1100;
    canvas.height = 430;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fondo blanco general
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dimensiones de las 2 tarjetas lado a lado (estilo grid-cols-2)
    const cardW = 526;
    const cardH = 406;
    const cardY = 12;

    // =========================================================================
    // TARJETA 1 (IZQUIERDA): ESTADO DE TICKETS
    // =========================================================================
    const x1 = 12;
    drawCard(ctx, x1, cardY, cardW, cardH, 12);

    // Título y Subtítulo
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 16px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Estado de Tickets', x1 + 24, 42);

    ctx.fillStyle = '#64748B';
    ctx.font = '12px Inter, Arial, sans-serif';
    ctx.fillText('Flujo de atención', x1 + 24, 62);

    const estados = distribucionEstado || [];
    const maxEst = Math.max(...estados.map(d => Number(d.valor || 0)), 1);
    const domainEst = Math.ceil(maxEst * 1.35) || 4;

    // Pastillas / Badges superiores (idénticos a la página web)
    const badgeY1 = 78;
    const badgeW1 = 114;
    estados.forEach((item, idx) => {
        const bx = x1 + 24 + idx * (badgeW1 + 8);
        // Caja de badge
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, badgeY1, badgeW1, 24, 6) : ctx.rect(bx, badgeY1, badgeW1, 24);
        ctx.fill();
        ctx.stroke();

        // Círculo de color
        ctx.fillStyle = item.color || '#2563EB';
        ctx.beginPath();
        ctx.arc(bx + 10, badgeY1 + 12, 4, 0, Math.PI * 2);
        ctx.fill();

        // Texto
        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 10px Inter, Arial, sans-serif';
        ctx.textAlign = 'left';
        const labelName = item.name || item.nombre || '';
        ctx.fillText(`${labelName}: ${item.valor || 0}`, bx + 18, badgeY1 + 16);
    });

    // Área de gráfico de barras verticales
    const plotX1 = x1 + 50;
    const plotY1 = 135;
    const plotW1 = cardW - 75;
    const plotH1 = 205;

    // Cuadrícula horizontal punteada
    const gridSteps = 4;
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSteps; i++) {
        const val = Math.round((domainEst / gridSteps) * i);
        const y = plotY1 + plotH1 - (i / gridSteps) * plotH1;

        ctx.beginPath();
        ctx.moveTo(plotX1, y);
        ctx.lineTo(plotX1 + plotW1, y);
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.font = '11px Inter, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(String(val), plotX1 - 10, y + 4);
    }
    ctx.restore();

    // Línea base del eje X
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotX1, plotY1 + plotH1);
    ctx.lineTo(plotX1 + plotW1, plotY1 + plotH1);
    ctx.stroke();

    // Dibujado de las 4 columnas verticales
    const slotW1 = plotW1 / Math.max(estados.length, 1);
    const barW1 = 50;

    estados.forEach((item, idx) => {
        const count = Number(item.valor || 0);
        const barH = (count / domainEst) * plotH1;
        const bx = plotX1 + idx * slotW1 + (slotW1 - barW1) / 2;
        const by = plotY1 + plotH1 - barH;

        // Barra con tope redondeado
        ctx.fillStyle = item.color || '#2563EB';
        drawBarTopRounded(ctx, bx, by, barW1, barH, 6);

        // Etiqueta superior de valor y porcentaje
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 11px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        const topLabel = count > 0 ? `${count} (${item.porcentaje || 0}%)` : '0';
        ctx.fillText(topLabel, bx + barW1 / 2, Math.min(by - 8, plotY1 + plotH1 - 8));

        // Etiqueta inferior del eje X (nombre del estado)
        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 11px Inter, Arial, sans-serif';
        const name = item.name || item.nombre || '';
        ctx.fillText(name, bx + barW1 / 2, plotY1 + plotH1 + 22);
    });

    // =========================================================================
    // TARJETA 2 (DERECHA): DISTRIBUCIÓN POR PRIORIDAD
    // =========================================================================
    const x2 = 562;
    drawCard(ctx, x2, cardY, cardW, cardH, 12);

    // Título y Subtítulo
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 16px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Distribución por Prioridad', x2 + 24, 42);

    ctx.fillStyle = '#64748B';
    ctx.font = '12px Inter, Arial, sans-serif';
    ctx.fillText('Nivel de urgencia', x2 + 24, 62);

    const prioridades = distribucionPrioridad || [];
    const maxPrio = Math.max(...prioridades.map(d => Number(d.valor || 0)), 1);
    const domainPrio = Math.ceil(maxPrio * 1.35) || 4;

    // Pastillas / Badges superiores
    prioridades.forEach((item, idx) => {
        const bx = x2 + 24 + idx * (badgeW1 + 8);
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, badgeY1, badgeW1, 24, 6) : ctx.rect(bx, badgeY1, badgeW1, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = item.color || '#16A34A';
        ctx.beginPath();
        ctx.arc(bx + 10, badgeY1 + 12, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 10px Inter, Arial, sans-serif';
        ctx.textAlign = 'left';
        const labelName = item.name || item.nombre || '';
        ctx.fillText(`${labelName}: ${item.valor || 0}`, bx + 18, badgeY1 + 16);
    });

    // Área de gráfico de barras verticales
    const plotX2 = x2 + 50;
    const plotY2 = 135;
    const plotW2 = cardW - 75;
    const plotH2 = 205;

    // Cuadrícula horizontal punteada
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSteps; i++) {
        const val = Math.round((domainPrio / gridSteps) * i);
        const y = plotY2 + plotH2 - (i / gridSteps) * plotH2;

        ctx.beginPath();
        ctx.moveTo(plotX2, y);
        ctx.lineTo(plotX2 + plotW2, y);
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.font = '11px Inter, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(String(val), plotX2 - 10, y + 4);
    }
    ctx.restore();

    // Línea base del eje X
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotX2, plotY2 + plotH2);
    ctx.lineTo(plotX2 + plotW2, plotY2 + plotH2);
    ctx.stroke();

    // Dibujado de las 4 columnas verticales
    const slotW2 = plotW2 / Math.max(prioridades.length, 1);
    const barW2 = 50;

    prioridades.forEach((item, idx) => {
        const count = Number(item.valor || 0);
        const barH = (count / domainPrio) * plotH2;
        const bx = plotX2 + idx * slotW2 + (slotW2 - barW2) / 2;
        const by = plotY2 + plotH2 - barH;

        // Barra con tope redondeado
        ctx.fillStyle = item.color || '#16A34A';
        drawBarTopRounded(ctx, bx, by, barW2, barH, 6);

        // Etiqueta superior
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 11px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        const topLabel = count > 0 ? `${count} (${item.porcentaje || 0}%)` : '0';
        ctx.fillText(topLabel, bx + barW2 / 2, Math.min(by - 8, plotY2 + plotH2 - 8));

        // Etiqueta inferior
        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 11px Inter, Arial, sans-serif';
        const name = item.name || item.nombre || '';
        ctx.fillText(name, bx + barW2 / 2, plotY2 + plotH2 + 22);
    });

    return canvas.toDataURL('image/png');
}

/**
 * Función principal para exportar a Excel con formato corporativo sobrio,
 * un solo color de cabecera en todas las hojas, bordes normales en celdas
 * y gráficos exactamente iguales a los de la página web.
 */
export async function exportarReporteExcelAvanzado(params) {
    const {
        fechasAplicadas,
        totalTicketsGeneral,
        resueltosCount,
        totalPendientes,
        tasaResolucion,
        tiempoPromedioTexto,
        totalCriticosAbiertos,
        mapeoUsuarios = [],
        tendenciaDiaria = [],
        criticosPendientes = [],
        distribucionPrioridad = [],
        distribucionEstado = [],
    } = params;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Tickets';
    workbook.created = new Date();

    // =========================================================================
    // ESTILO CORPORATIVO SOBRIO Y ELEGANTE (UN SOLO TEMA, CERO COLORES EXTRAÑOS)
    // =========================================================================
    const COLOR_HEADER_PRIMARY = 'FF1E293B';  // Dark Slate / Azul Corporativo estándar
    const COLOR_HEADER_TEXT    = 'FFFFFFFF';  // Texto blanco
    const COLOR_BORDER         = 'FFCBD5E1';  // Gris suave estándar de Excel
    const COLOR_CARD_HEADER    = 'FFF1F5F9';  // Fondo gris suave para títulos de tarjetas
    const COLOR_ZEBRA_ROW      = 'FFF8FAFC';  // Alternancia de fila muy limpia y sutil
    const COLOR_WHITE          = 'FFFFFFFF';

    const borderStyleThin = {
        top:    { style: 'thin', color: { argb: COLOR_BORDER } },
        left:   { style: 'thin', color: { argb: COLOR_BORDER } },
        bottom: { style: 'thin', color: { argb: COLOR_BORDER } },
        right:  { style: 'thin', color: { argb: COLOR_BORDER } }
    };

    // =========================================================================
    // HOJA 1: PANEL EJECUTIVO
    // =========================================================================
    const wsDashboard = workbook.addWorksheet('Panel Ejecutivo', {
        views: [{ showGridLines: true }]
    });

    wsDashboard.columns = [
        { width: 4 },  // A (Margen)
        { width: 28 }, // B
        { width: 22 }, // C
        { width: 22 }, // D
        { width: 24 }, // E
        { width: 22 }, // F
        { width: 22 }, // G
    ];

    // Banner Superior
    wsDashboard.mergeCells('B2:G2');
    const titleCell = wsDashboard.getCell('B2');
    titleCell.value = 'SISTEMA DE GESTIÓN DE INCIDENCIAS — REPORTE CONSOLIDADO';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: COLOR_HEADER_TEXT } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_PRIMARY } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    wsDashboard.getRow(2).height = 34;

    // Subtítulo con rango de fechas y hora de generación
    wsDashboard.mergeCells('B3:G3');
    const subCell = wsDashboard.getCell('B3');
    subCell.value = `Período Evaluado: ${formatDate(fechasAplicadas.inicio)} al ${formatDate(fechasAplicadas.fin)}   |   Generado el: ${new Date().toLocaleString()}`;
    subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_CARD_HEADER } };
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };
    subCell.border = { bottom: { style: 'thin', color: { argb: COLOR_BORDER } } };
    wsDashboard.getRow(3).height = 22;

    wsDashboard.getRow(4).height = 12;

    // Tarjetas KPI con diseño limpio y bordes normales
    const kpis = [
        { col: 'B', title: 'TOTAL DE TICKETS', value: totalTicketsGeneral, color: 'FF2563EB' },
        { col: 'C', title: 'TICKETS RESUELTOS', value: resueltosCount, color: 'FF16A34A' },
        { col: 'D', title: 'PENDIENTES / EN CURSO', value: totalPendientes, color: 'FFD97706' },
        { col: 'E', title: 'TIEMPO PROMEDIO', value: tiempoPromedioTexto, color: 'FF0284C7' },
        { col: 'F', title: 'CASOS CRÍTICOS', value: totalCriticosAbiertos, color: 'FFDC2626' },
    ];

    wsDashboard.getRow(5).height = 20;
    wsDashboard.getRow(6).height = 28;

    kpis.forEach(k => {
        const hCell = wsDashboard.getCell(`${k.col}5`);
        hCell.value = k.title;
        hCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF475569' } };
        hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_CARD_HEADER } };
        hCell.alignment = { vertical: 'middle', horizontal: 'center' };
        hCell.border = borderStyleThin;

        const vCell = wsDashboard.getCell(`${k.col}6`);
        vCell.value = k.value;
        vCell.font = { name: 'Calibri', size: 15, bold: true, color: { argb: k.color } };
        vCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_WHITE } };
        vCell.alignment = { vertical: 'middle', horizontal: 'center' };
        vCell.border = borderStyleThin;
    });

    wsDashboard.getRow(7).height = 14;

    // Tabla de Resumen de Métricas Operativas
    wsDashboard.mergeCells('B8:E8');
    const tableHeader = wsDashboard.getCell('B8');
    tableHeader.value = 'RESUMEN DE RENDIMIENTO Y COBERTURA OPERATIVA';
    tableHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLOR_HEADER_TEXT } };
    tableHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_PRIMARY } };
    tableHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    tableHeader.border = borderStyleThin;
    wsDashboard.getRow(8).height = 24;

    const metricRows = [
        ['Rango de Fechas Analizado', `${formatDate(fechasAplicadas.inicio)} al ${formatDate(fechasAplicadas.fin)}`],
        ['Volumen Total Registrado', `${totalTicketsGeneral} tickets`],
        ['Tickets Solucionados Exitosamente', `${resueltosCount} tickets (${tasaResolucion}%)`],
        ['Carga Pendiente Activa', `${totalPendientes} tickets`],
        ['Tiempo Promedio de Cierre', tiempoPromedioTexto],
        ['Cobertura de Respuesta Técnica Oficial', `${params.resumen?.cobertura_respuesta || 0}%`],
        ['Tickets con Evidencia Fotográfica Adjunta', `${params.resumen?.con_imagenes || 0} tickets`],
        ['Incidentes Críticos en Espera de Cierre', `${totalCriticosAbiertos} tickets urgentes`],
    ];

    metricRows.forEach((row, idx) => {
        const rowNum = 9 + idx;
        const r = wsDashboard.getRow(rowNum);
        r.height = 20;

        wsDashboard.mergeCells(`B${rowNum}:C${rowNum}`);
        const cTitle = wsDashboard.getCell(`B${rowNum}`);
        cTitle.value = row[0];
        cTitle.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
        cTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? COLOR_ZEBRA_ROW : COLOR_WHITE } };
        cTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cTitle.border = borderStyleThin;

        wsDashboard.mergeCells(`D${rowNum}:E${rowNum}`);
        const cVal = wsDashboard.getCell(`D${rowNum}`);
        cVal.value = row[1];
        cVal.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
        cVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? COLOR_ZEBRA_ROW : COLOR_WHITE } };
        cVal.alignment = { vertical: 'middle', horizontal: 'center' };
        cVal.border = borderStyleThin;
    });

    // Embeber Gráficos exactamente iguales a la página web
    try {
        const imgTendenciaBase64 = generarGraficoTendenciaCanvas(tendenciaDiaria);
        if (imgTendenciaBase64) {
            const tendenciaImgId = workbook.addImage({
                base64: imgTendenciaBase64,
                extension: 'png',
            });
            wsDashboard.addImage(tendenciaImgId, {
                tl: { col: 1, row: 18 },
                ext: { width: 880, height: 330 },
            });
        }

        const imgDistBase64 = generarGraficoDistribucionCanvas(distribucionPrioridad, distribucionEstado);
        if (imgDistBase64) {
            const distImgId = workbook.addImage({
                base64: imgDistBase64,
                extension: 'png',
            });
            wsDashboard.addImage(distImgId, {
                tl: { col: 1, row: 36 },
                ext: { width: 880, height: 340 },
            });
        }
    } catch (e) {
        console.warn('Error renderizando gráficos canvas para Excel:', e);
    }

    // =========================================================================
    // HOJA 2: DEMANDA POR SOLICITANTE
    // =========================================================================
    if (mapeoUsuarios.length > 0) {
        const wsUsuarios = workbook.addWorksheet('Demanda Solicitantes', {
            views: [{ showGridLines: true }]
        });

        wsUsuarios.columns = [
            { header: '#', key: 'idx', width: 6 },
            { header: 'Solicitante', key: 'nombre', width: 28 },
            { header: 'Correo Electrónico', key: 'email', width: 30 },
            { header: 'Total Tickets', key: 'total', width: 14 },
            { header: 'Resueltos', key: 'resueltos', width: 14 },
            { header: 'Pendientes', key: 'pendientes', width: 14 },
            { header: 'Efectividad (%)', key: 'efectividad', width: 16 },
            { header: 'Último Registro', key: 'ultimo', width: 18 },
        ];

        // Cabecera uniforme con el color de tema primario
        const headerRow = wsUsuarios.getRow(1);
        headerRow.height = 26;
        headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLOR_HEADER_TEXT } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_PRIMARY } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = borderStyleThin;
        });

        mapeoUsuarios.forEach((u, i) => {
            const row = wsUsuarios.addRow({
                idx: i + 1,
                nombre: u.nombre_completo,
                email: u.email,
                total: u.total_tickets,
                resueltos: u.resueltos,
                pendientes: u.pendientes,
                efectividad: `${u.porcentaje_exito}%`,
                ultimo: formatDate(u.ultimo_ticket),
            });
            row.height = 20;
            row.font = { name: 'Calibri', size: 10 };
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? COLOR_ZEBRA_ROW : COLOR_WHITE } };

            row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
            row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
            row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };

            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = borderStyleThin;
            });
        });
    }

    // =========================================================================
    // HOJA 3: TENDENCIA TEMPORAL DÍA POR DÍA
    // =========================================================================
    if (tendenciaDiaria.length > 0) {
        const wsTendencia = workbook.addWorksheet('Tendencia Temporal', {
            views: [{ showGridLines: true }]
        });

        wsTendencia.columns = [
            { header: 'Fecha', key: 'fecha', width: 16 },
            { header: 'Tickets Creados', key: 'creados', width: 18 },
            { header: 'Tickets Resueltos', key: 'resueltos', width: 18 },
            { header: 'Tickets Pendientes', key: 'pendientes', width: 18 },
            { header: 'Balance Neto', key: 'balance', width: 16 },
        ];

        const headerRow = wsTendencia.getRow(1);
        headerRow.height = 26;
        headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLOR_HEADER_TEXT } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_PRIMARY } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = borderStyleThin;
        });

        tendenciaDiaria.forEach((t, i) => {
            const balance = Number(t.creados || 0) - Number(t.resueltos || 0);
            const row = wsTendencia.addRow({
                fecha: formatDate(t.fecha),
                creados: Number(t.creados || 0),
                resueltos: Number(t.resueltos || 0),
                pendientes: Number(t.pendientes || 0),
                balance: balance > 0 ? `+${balance}` : String(balance),
            });
            row.height = 20;
            row.font = { name: 'Calibri', size: 10 };
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? COLOR_ZEBRA_ROW : COLOR_WHITE } };

            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = borderStyleThin;
            });
        });
    }

    // =========================================================================
    // HOJA 4: INCIDENTES CRÍTICOS Y ALTA PRIORIDAD
    // =========================================================================
    if (criticosPendientes.length > 0) {
        const wsCriticos = workbook.addWorksheet('Críticos Abiertos', {
            views: [{ showGridLines: true }]
        });

        wsCriticos.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Título del Incidente', key: 'titulo', width: 36 },
            { header: 'Solicitante', key: 'solicitante', width: 26 },
            { header: 'Correo Electrónico', key: 'email', width: 30 },
            { header: 'Prioridad', key: 'prioridad', width: 16 },
            { header: 'Estado', key: 'estado', width: 16 },
            { header: 'Fecha de Registro', key: 'fecha', width: 18 },
            { header: 'Antigüedad', key: 'dias', width: 16 },
        ];

        const headerRow = wsCriticos.getRow(1);
        headerRow.height = 26;
        headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLOR_HEADER_TEXT } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_PRIMARY } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = borderStyleThin;
        });

        criticosPendientes.forEach((c, i) => {
            const row = wsCriticos.addRow({
                id: `#${c.id}`,
                titulo: c.titulo,
                solicitante: c.solicitante,
                email: c.email,
                prioridad: c.prioridad_nombre,
                estado: c.estado_nombre,
                fecha: formatDate(c.created_at),
                dias: c.dias_abierto === 0 ? 'Hoy' : `${c.dias_abierto} día(s)`,
            });
            row.height = 22;
            row.font = { name: 'Calibri', size: 10 };
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? COLOR_ZEBRA_ROW : COLOR_WHITE } };

            row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
            row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
            row.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };
            row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };

            // Formato sobrio y profesional para prioridades altas
            if (c.prioridad_id === 4) {
                row.getCell(5).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF991B1B' } };
                row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
            } else {
                row.getCell(5).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF92400E' } };
                row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
            }

            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = borderStyleThin;
            });
        });
    }

    // =========================================================================
    // DESCARGA DIRECTA DEL ARCHIVO EXCEL
    // =========================================================================
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Tickets_${fechasAplicadas.inicio}_al_${fechasAplicadas.fin}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
