import jsPDF from 'jspdf';

/**
 * Carga una imagen como DataURL para incrustarla en jsPDF
 */
function loadImageAsDataUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Genera y descarga el PDF nativo del Orden de la Casa
 */
export async function generateOrdenDeLaCasaPDF({ state, seminaristas = [] }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - (marginX * 2); // 182mm

  // 1. Cargar escudo oficial si está disponible
  const logoDataUrl = await loadImageAsDataUrl('/logo.png');

  // ==========================================
  // ENCABEZADO SOLEMNE
  // ==========================================
  let headerTop = 12;

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', marginX, headerTop - 2, 20, 24);
  }

  const textStartX = logoDataUrl ? marginX + 24 : marginX;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9); // Gold amber
  doc.text('ARQUIDIÓCESIS DE MARACAIBO', textStartX, headerTop + 3);

  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('SEMINARIO MAYOR SANTO TOMÁS DE AQUINO', textStartX, headerTop + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text('CURSO FORMATIVO 2026–2027 • ASAMBLEA GENERAL ELECTIVA', textStartX, headerTop + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Padrón canónico oficial de 38 seminaristas de Filosofía y Teología', textStartX, headerTop + 18);

  // Línea dorada divisoria
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.7);
  doc.line(marginX, headerTop + 23, marginX + contentWidth, headerTop + 23);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(marginX, headerTop + 24, marginX + contentWidth, headerTop + 24);

  // ==========================================
  // TÍTULO DEL DOCUMENTO
  // ==========================================
  let currentY = headerTop + 28;

  doc.setFillColor(15, 23, 42); // Navy Dark
  doc.roundedRect(marginX, currentY, contentWidth, 9, 2, 2, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(254, 240, 138); // Yellow gold
  doc.text(
    'ORDEN DE LA CASA Y DISTRIBUCIÓN DE COORDINACIONES PASTORALES',
    pageWidth / 2,
    currentY + 6,
    { align: 'center' }
  );

  currentY += 13;

  // ==========================================
  // COORDINADOR GENERAL ELECTO
  // ==========================================
  const winner = state?.winner;
  doc.setFillColor(254, 252, 232); // Amber light tint
  doc.setDrawColor(245, 158, 11); // Amber border
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, currentY, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('COORDINADOR GENERAL DE LA COMUNIDAD DE SEMINARISTAS', marginX + 4, currentY + 5);

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(
    winner ? winner.nombre.toUpperCase() : 'PENDIENTE POR PROCLAMACIÓN CANÓNICA',
    marginX + 4,
    currentY + 11
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const winnerSubtitle = winner 
    ? `${winner.curso} • Elegido canónicamente para presidir las cuatro coordinaciones`
    : 'Elección en curso por votación de la asamblea';
  doc.text(winnerSubtitle, marginX + 4, currentY + 15.5);

  currentY += 22;

  // ==========================================
  // LAS 4 COORDINACIONES PASTORALES (Grid 2x2)
  // ==========================================
  const coordinations = state?.coordinations || {};
  const coordinators = state?.coordinators || {};
  const memberSubgroups = state?.memberSubgroups || {};

  const colWidth = 88; // mm cada columna
  const colGap = 6;    // mm separación
  const col1X = marginX;
  const col2X = marginX + colWidth + colGap;

  const coordConfigs = [
    {
      key: 'liturgia',
      title: 'COORDINACIÓN DE LITURGIA',
      subtitle: 'Altar, Celebraciones Litúrgicas y Canto Sacro',
      col: 1,
      accentColor: [109, 40, 217], // Violet
      bgTint: [250, 245, 255]
    },
    {
      key: 'cultura',
      title: 'COORDINACIÓN DE CULTURA',
      subtitle: 'Actos Académicos, Biblioteca y Medios',
      col: 2,
      accentColor: [3, 105, 161], // Sky Blue
      bgTint: [240, 249, 255]
    },
    {
      key: 'cocina',
      title: 'COORDINACIÓN DE COCINA',
      subtitle: 'Comedor, Despensa y Servicio Fraterno',
      col: 1,
      accentColor: [180, 83, 9], // Amber
      bgTint: [254, 252, 232]
    },
    {
      key: 'servicios_generales',
      title: 'SERVICIOS GENERALES',
      subtitle: 'Mantenimiento, Jardinería y Logística',
      col: 2,
      accentColor: [4, 120, 87], // Emerald Green
      bgTint: [236, 253, 245]
    }
  ];

  // Altura fija de cada tarjeta de coordinación
  const cardHeight = 84;

  coordConfigs.forEach((cfg) => {
    const isCol1 = cfg.col === 1;
    const isRow1 = cfg.key === 'liturgia' || cfg.key === 'cultura';

    const cardX = isCol1 ? col1X : col2X;
    const cardY = isRow1 ? currentY : currentY + cardHeight + 4;

    // Fondo y borde de tarjeta
    doc.setFillColor(...cfg.bgTint);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, cardY, colWidth, cardHeight, 2, 2, 'FD');

    // Barra superior decorativa
    doc.setFillColor(...cfg.accentColor);
    doc.rect(cardX, cardY, colWidth, 1.8, 'F');

    // Título de Coordinación
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...cfg.accentColor);
    doc.text(cfg.title, cardX + 3.5, cardY + 6);

    // Subtítulo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(cfg.subtitle, cardX + 3.5, cardY + 9.5);

    // Separador sutil
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(cardX + 3, cardY + 11.5, cardX + colWidth - 3, cardY + 11.5);

    // Coordinador de Área
    const coordLeaderId = coordinators[cfg.key];
    const coordLeader = seminaristas.find(s => s.id === coordLeaderId);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...cfg.accentColor);
    doc.setLineWidth(0.25);
    doc.roundedRect(cardX + 3, cardY + 13, colWidth - 6, 8.5, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(180, 83, 9);
    doc.text('COORDINADOR DE ÁREA:', cardX + 5, cardY + 16.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const leaderName = coordLeader ? `${coordLeader.nombre} (${coordLeader.curso.split(' ')[0]})` : 'Por designar';
    doc.text(leaderName, cardX + 5, cardY + 20);

    // Lista de Integrantes
    const memberIds = coordinations[cfg.key] || [];
    const members = memberIds.map(id => seminaristas.find(s => s.id === id)).filter(Boolean);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(`INTEGRANTES ASIGNADOS (${members.length}):`, cardX + 3.5, cardY + 25.5);

    let memberY = cardY + 29.5;
    const lineHeight = 4.3;

    if (members.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Sin seminaristas asignados aún', cardX + 5, memberY);
    } else {
      members.slice(0, 12).forEach((m, idx) => {
        const isLeader = m.id === coordLeaderId;
        doc.setFont('helvetica', isLeader ? 'bold' : 'normal');
        doc.setFontSize(7.3);
        doc.setTextColor(isLeader ? 180 : 30, isLeader ? 83 : 41, isLeader ? 9 : 59);

        const bullet = `${idx + 1}.`;
        doc.text(bullet, cardX + 4, memberY);
        doc.text(m.nombre, cardX + 8, memberY);

        // Subgrupos asignados si los tiene
        const sgs = memberSubgroups[m.id] || [];
        if (sgs.length > 0) {
          const nameW = doc.getTextWidth(m.nombre);
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(5.8);
          doc.setTextColor(146, 64, 14); // Amber 800
          const maxSgW = colWidth - 8 - nameW - 20; // espacio libre antes del curso
          let sgStr = `(${sgs.join(', ')})`;
          if (doc.getTextWidth(sgStr) > maxSgW && sgs.length > 1) {
            sgStr = `(${sgs[0]}, +${sgs.length - 1})`;
          }
          doc.text(sgStr, cardX + 8 + nameW + 1.5, memberY);
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        const courseAbbr = m.curso.replace('de Filosofía', 'Fil.').replace('de Teología', 'Teol.');
        doc.text(courseAbbr, cardX + colWidth - 4, memberY, { align: 'right' });

        memberY += lineHeight;
      });

      if (members.length > 12) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`... y ${members.length - 12} hermano(s) más`, cardX + 8, memberY);
      }
    }
  });

  // ==========================================
  // PIE CANÓNICO Y FIRMAS
  // ==========================================
  const footerY = currentY + (cardHeight * 2) + 12;

  // Fecha y lugar
  const fechaHoy = new Date();
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const fechaTexto = `Dado en la Sede del Seminario Mayor Santo Tomás de Aquino, Maracaibo, a los ${fechaHoy.getDate()} días del mes de ${meses[fechaHoy.getMonth()]} de ${fechaHoy.getFullYear()}.`;

  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(fechaTexto, pageWidth / 2, footerY, { align: 'center' });

  // Firmas solemnes
  const signY = footerY + 16;
  const signLineWidth = 60;

  // Firma 1: Rector
  const sign1X = marginX + 16;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(sign1X, signY, sign1X + signLineWidth, signY);

  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Pbro. Rector', sign1X + (signLineWidth / 2), signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Rector del Seminario Mayor', sign1X + (signLineWidth / 2), signY + 7.5, { align: 'center' });

  // Firma 2: Coordinador General
  const sign2X = marginX + contentWidth - signLineWidth - 16;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(sign2X, signY, sign2X + signLineWidth, signY);

  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(winner ? winner.nombre : 'Coordinador General', sign2X + (signLineWidth / 2), signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Coordinador General Electo', sign2X + (signLineWidth / 2), signY + 7.5, { align: 'center' });

  // Lema oficial en el fondo de página
  doc.setFont('times', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('«Sacerdos Lux — In lumine tuo videbimus lumen»', pageWidth / 2, pageHeight - 7, { align: 'center' });

  // Guardar / Descargar PDF nativo
  const fileName = `ORDEN_DE_LA_CASA_2026-2027_${Date.now()}.pdf`;
  doc.save(fileName);
  return fileName;
}
