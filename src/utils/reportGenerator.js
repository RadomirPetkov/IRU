import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// XML run properties — taken verbatim from the template
const RPR_HDR_WHITE = '<w:rPr><w:b/><w:bCs/><w:color w:val="FFFFFF"/><w:sz w:val="18"/><w:szCs w:val="18"/><w:lang w:val="bg-BG"/></w:rPr>';
const RPR_HDR_DAY   = '<w:rPr><w:sz w:val="16"/><w:szCs w:val="16"/><w:lang w:val="bg-BG"/></w:rPr>';
const RPR_HDR_TOT   = '<w:rPr><w:b/><w:bCs/><w:color w:val="FFFFFF"/><w:sz w:val="16"/><w:szCs w:val="16"/><w:lang w:val="bg-BG"/></w:rPr>';
const RPR_BODY      = '<w:rPr><w:sz w:val="18"/><w:szCs w:val="18"/><w:lang w:val="bg-BG"/></w:rPr>';
const RPR_TIME      = '<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/><w:lang w:val="bg-BG"/></w:rPr>';
const MAR_TEXT      = '<w:tcMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar>';
const MAR_DAY       = '<w:tcMar><w:top w:w="60" w:type="dxa"/><w:left w:w="40" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="40" w:type="dxa"/></w:tcMar>';

function escXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDDMM(date) {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatDDMMYYYY(date) {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function formatHHMM(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// Adaptive column widths — stays within 14400 dxa usable width for any period length
function calculateColumnWidths(N) {
  const NAME_W = 1500;
  const TOTAL_W = 973;
  let emailW = 2800;

  if (N === 0) return { nameW: NAME_W, emailW, dayW: 640 };

  let dayW = Math.floor((14400 - NAME_W - emailW - TOTAL_W) / N);

  if (dayW < 400) {
    emailW = 1800;
    dayW = Math.floor((14400 - NAME_W - emailW - TOTAL_W) / N);
  }

  return { nameW: NAME_W, emailW, dayW: Math.max(dayW, 300) };
}

function hdrBlueCell(text, w, rpr) {
  return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1F4E79"/>${MAR_TEXT}</w:tcPr><w:p><w:pPr><w:jc w:val="center"/>${rpr}</w:pPr><w:r>${rpr}<w:t>${escXml(text)}</w:t></w:r></w:p></w:tc>`;
}

function hdrDayCell(dateLabel, dayW) {
  return `<w:tc><w:tcPr><w:tcW w:w="${dayW}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="D5DCE4"/>${MAR_DAY}</w:tcPr><w:p><w:pPr><w:jc w:val="center"/>${RPR_HDR_DAY}</w:pPr><w:r>${RPR_HDR_DAY}<w:t>${escXml(dateLabel)}</w:t></w:r></w:p></w:tc>`;
}

function bodyTextCell(text, w) {
  return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${MAR_TEXT}</w:tcPr><w:p><w:pPr>${RPR_BODY}</w:pPr><w:r>${RPR_BODY}<w:t xml:space="preserve">${escXml(text)}</w:t></w:r></w:p></w:tc>`;
}

function dayCell(timeStr, dayW) {
  const shd = timeStr ? '<w:shd w:val="clear" w:color="auto" w:fill="D9EAD3"/>' : '';
  const run = timeStr ? `<w:r>${RPR_TIME}<w:t>${timeStr}</w:t></w:r>` : '';
  return `<w:tc><w:tcPr><w:tcW w:w="${dayW}" w:type="dxa"/>${shd}${MAR_DAY}</w:tcPr><w:p><w:pPr><w:jc w:val="center"/>${RPR_TIME}</w:pPr>${run}</w:p></w:tc>`;
}

function totalCell(count) {
  return `<w:tc><w:tcPr><w:tcW w:w="973" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="FBE4D5"/>${MAR_TEXT}</w:tcPr><w:p><w:pPr><w:jc w:val="center"/>${RPR_BODY}</w:pPr><w:r>${RPR_BODY}<w:t>${count}</w:t></w:r></w:p></w:tc>`;
}

function buildTable(usersData, dayDates, nameW, emailW, dayW) {
  const N = dayDates.length;
  const totalW = nameW + emailW + N * dayW + 973;

  const gridCols =
    `<w:gridCol w:w="${nameW}"/>` +
    `<w:gridCol w:w="${emailW}"/>` +
    dayDates.map(() => `<w:gridCol w:w="${dayW}"/>`).join('') +
    `<w:gridCol w:w="973"/>`;

  const hdrCells =
    hdrBlueCell('Име', nameW, RPR_HDR_WHITE) +
    hdrBlueCell('Имейл', emailW, RPR_HDR_WHITE) +
    dayDates.map(d => hdrDayCell(formatDDMM(d), dayW)).join('') +
    `<w:tc><w:tcPr><w:tcW w:w="973" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1F4E79"/>${MAR_TEXT}</w:tcPr><w:p><w:pPr><w:jc w:val="center"/>${RPR_HDR_TOT}</w:pPr><w:r>${RPR_HDR_TOT}<w:t>Общо влизания</w:t></w:r></w:p></w:tc>`;

  const headerRow = `<w:tr><w:trPr><w:tblHeader/></w:trPr>${hdrCells}</w:tr>`;

  const dataRows = usersData.map(u => {
    let total = 0;
    const cells =
      bodyTextCell(u.displayName, nameW) +
      bodyTextCell(u.email, emailW) +
      dayDates.map(d => {
        const key = toLocalDateKey(d);
        const loginDate = u.loginsByDay[key];
        const timeStr = loginDate ? formatHHMM(loginDate) : '';
        if (timeStr) total++;
        return dayCell(timeStr, dayW);
      }).join('') +
      totalCell(total);
    return `<w:tr>${cells}</w:tr>`;
  }).join('');

  return (
    `<w:tbl>` +
    `<w:tblPr>` +
    `<w:tblW w:w="${totalW}" w:type="dxa"/>` +
    `<w:jc w:val="center"/>` +
    `<w:tblBorders>` +
    `<w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>` +
    `<w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>` +
    `<w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>` +
    `<w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>` +
    `<w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>` +
    `<w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>` +
    `</w:tblBorders>` +
    `<w:tblCellMar><w:left w:w="10" w:type="dxa"/><w:right w:w="10" w:type="dxa"/></w:tblCellMar>` +
    `<w:tblLook w:val="0000" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="0"/>` +
    `</w:tblPr>` +
    `<w:tblGrid>${gridCols}</w:tblGrid>` +
    headerRow +
    dataRows +
    `</w:tbl>`
  );
}

// Replace the multi-run period paragraph with a single clean run
function replacePeriodParagraph(xml, startDate, endDate) {
  const idx = xml.indexOf('Период: от');
  if (idx === -1) return xml;

  const pStart = xml.lastIndexOf('<w:p ', idx);
  const pEnd = xml.indexOf('</w:p>', idx) + '</w:p>'.length;
  const oldPara = xml.substring(pStart, pEnd);

  const pTagEnd = oldPara.indexOf('>') + 1;
  const pTag = oldPara.substring(0, pTagEnd);
  const pPrEnd = oldPara.indexOf('</w:pPr>') + '</w:pPr>'.length;
  const pPr = oldPara.substring(pTagEnd, pPrEnd);

  const periodText = `Период: от ${formatDDMMYYYY(startDate)} до ${formatDDMMYYYY(endDate)} г.`;
  const newPara =
    `${pTag}${pPr}` +
    `<w:r><w:rPr><w:color w:val="444444"/><w:lang w:val="bg-BG"/></w:rPr>` +
    `<w:t>${escXml(periodText)}</w:t></w:r>` +
    `</w:p>`;

  return xml.substring(0, pStart) + newPara + xml.substring(pEnd);
}

// Main entry point
// usersData: [{ displayName, email, loginsByDay: { 'YYYY-MM-DD': Date } }]
// startDate, endDate: Date objects
// program: 'Базово ниво, ниво 1 и 2' | 'Средно ниво, ниво 3 и 4'
export async function generateActivityReport({ usersData, startDate, endDate, program }) {
  const response = await fetch('/spravka_template.docx');
  if (!response.ok) throw new Error('Шаблонният файл не е намерен (spravka_template.docx)');
  const templateBuffer = await response.arrayBuffer();

  const zip = await JSZip.loadAsync(templateBuffer);
  let docXml = await zip.file('word/document.xml').async('string');

  // Build the array of dates for each column
  const dayDates = [];
  const cur = new Date(startDate);
  cur.setHours(0, 0, 0, 0);
  const endNorm = new Date(endDate);
  endNorm.setHours(0, 0, 0, 0);
  while (cur <= endNorm) {
    dayDates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const { nameW, emailW, dayW } = calculateColumnWidths(dayDates.length);

  // Replace table
  const newTable = buildTable(usersData, dayDates, nameW, emailW, dayW);
  const tblStart = docXml.indexOf('<w:tbl>');
  const tblEnd = docXml.lastIndexOf('</w:tbl>') + '</w:tbl>'.length;
  docXml = docXml.substring(0, tblStart) + newTable + docXml.substring(tblEnd);

  // Replace period paragraph
  docXml = replacePeriodParagraph(docXml, startDate, endDate);

  // Replace program level (default placeholder from template)
  docXml = docXml.replace('Базово ниво, ниво 1 и 2', program);

  // Remove any [trash]/ entries and update document.xml in place
  Object.keys(zip.files).forEach(name => {
    if (name.startsWith('[trash]')) zip.remove(name);
  });
  zip.file('word/document.xml', docXml);

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });

  const s = formatDDMMYYYY(startDate).replace(/\./g, '-');
  const e = formatDDMMYYYY(endDate).replace(/\./g, '-');
  saveAs(blob, `Справка_активност_${s}_${e}.docx`);
}
