export interface SubjectBulletinRow {
  subjectName: string
  coefficient: number
  devoirAverage: number | null
  trimestrielleScore: number | null
  finalAverage: number | null
  absent: boolean
}

export interface StudentBulletinData {
  lastName: string
  firstName: string
  subjects: SubjectBulletinRow[]
  generalAverage: number | null
  rank: number | null
  totalStudents: number
  mention: string
  totalActiveCoeffs: number
}

export function fmt(n: number | null): string {
  if (n === null || n === undefined) return "—"
  return n.toFixed(2).replace(".", ",")
}

export function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export const bulletinStyles = `
@page { size: A4 landscape; margin: 3mm; }
body { margin: 0; padding: 0; font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; font-size: 10pt; }
.page { width: 297mm; min-height: 210mm; display: flex; flex-direction: row; align-items: stretch; margin: 0 auto; box-sizing: border-box; page-break-after: always; }
.bulletin { width: 50%; border: 1px solid #000; padding: 3mm; margin: 0; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid; display: flex; flex-direction: column; }
.bulletin:first-child { border-right: none; }
.header-row { display: flex; flex-direction: row; align-items: flex-start; margin-bottom: 1.5mm; }
.header-left { flex: 1; text-align: left; font-size: 7pt; }
.header-left .school-name { font-weight: bold; font-size: 8pt; text-transform: uppercase; }
.header-left .school-detail { font-size: 6.5pt; color: #333; }
.header-center { flex: 1; text-align: center; }
.header-right { flex: 0 0 auto; text-align: right; }
.header { margin-bottom: 2mm; }
.logo { text-align: right; }
.logo img { max-height: 14mm; width: auto; object-fit: contain; }
.header .rep { font-size: 9pt; font-weight: bold; letter-spacing: 1pt; }
.header .devise { font-size: 6.5pt; font-style: italic; }
.header .title { font-size: 10pt; font-weight: bold; text-decoration: underline; margin: 0.5mm 0; text-align: center; }
.header .subtitle { font-size: 7pt; margin-bottom: 1mm; text-align: center; }
.info { width: 100%; font-size: 7pt; border-collapse: collapse; margin-bottom: 1mm; }
.info td { padding: 0.5mm 1mm; vertical-align: top; }
.info .lbl { font-weight: bold; white-space: nowrap; width: 1%; }
.info .val { padding-right: 2mm; }
table.notes { width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 7pt; margin-bottom: 2mm; flex: 1; }
table.notes th { border: 1px solid #000; padding: 1mm 0.5mm; font-weight: bold; text-align: center; background: #f0f0f0; }
table.notes td { border: 1px solid #000; padding: 1mm 0.5mm; text-align: center; }
.col-m { text-align: left; }
.col-c { width: 8%; }
.col-n { width: 14%; }
.col-a { width: 25%; text-align: left; font-style: italic; }
.nf { font-weight: bold; }
.ar td { color: #888; }
.ar .col-m { color: #000; }
.tr td { font-weight: bold; border-top: 2px solid #000; }
.footer { display: flex; justify-content: space-between; align-items: flex-start; font-size: 7pt; margin-top: 1mm; }
.footer-parent { text-align: center; }
.footer-parent .sig-line { font-size: 8pt; letter-spacing: 1pt; }
.fd { text-align: center; }
`

export const previewStyles = `
.preview-bulletin { font-family: 'Times New Roman', Times, serif; border: 1px solid #000; padding: 3mm; }
.preview-bulletin .header-row { display: flex; flex-direction: row; align-items: flex-start; margin-bottom: 1.5mm; }
.preview-bulletin .header-left { flex: 1; text-align: left; font-size: 7pt; }
.preview-bulletin .header-left .school-name { font-weight: bold; font-size: 8pt; text-transform: uppercase; }
.preview-bulletin .header-left .school-detail { font-size: 6.5pt; color: #333; }
.preview-bulletin .header-center { flex: 1; text-align: center; }
.preview-bulletin .header-right { flex: 0 0 auto; text-align: right; }
.preview-bulletin .logo { text-align: right; }
.preview-bulletin .logo img { max-height: 14mm; width: auto; object-fit: contain; }
.preview-bulletin .rep { font-size: 9pt; font-weight: bold; letter-spacing: 1pt; }
.preview-bulletin .devise { font-size: 6.5pt; font-style: italic; }
.preview-bulletin .title { font-size: 10pt; font-weight: bold; text-decoration: underline; margin: 0.5mm 0; text-align: center; }
.preview-bulletin .subtitle { font-size: 7pt; margin-bottom: 1mm; text-align: center; }
.preview-bulletin .info { width: 100%; font-size: 7pt; border-collapse: collapse; margin-bottom: 1mm; }
.preview-bulletin .info td { padding: 0.5mm 1mm; vertical-align: top; }
.preview-bulletin .info .lbl { font-weight: bold; white-space: nowrap; width: 1%; }
.preview-bulletin .info .val { padding-right: 2mm; }
.preview-bulletin table.notes { width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 7pt; margin-bottom: 2mm; }
.preview-bulletin table.notes th { border: 1px solid #000; padding: 1mm 0.5mm; font-weight: bold; text-align: center; background: #f0f0f0; }
.preview-bulletin table.notes td { border: 1px solid #000; padding: 1mm 0.5mm; text-align: center; }
.preview-bulletin .col-m { text-align: left; }
.preview-bulletin .col-c { width: 8%; }
.preview-bulletin .col-n { width: 14%; }
.preview-bulletin .col-a { width: 25%; text-align: left; font-style: italic; }
.preview-bulletin .nf { font-weight: bold; }
.preview-bulletin .ar td { color: #888; }
.preview-bulletin .ar .col-m { color: #000; }
.preview-bulletin .tr td { font-weight: bold; border-top: 2px solid #000; }
.preview-bulletin .footer { display: flex; justify-content: space-between; align-items: flex-start; font-size: 7pt; margin-top: 1mm; }
.preview-bulletin .footer-parent { text-align: center; }
.preview-bulletin .footer-parent .sig-line { font-size: 8pt; letter-spacing: 1pt; }
.preview-bulletin .fd { text-align: center; }
`

export function buildBulletinHTML(
  student: StudentBulletinData,
  schoolName: string,
  schoolAddress: string,
  schoolPhone: string,
  directorName: string,
  academicYearName: string,
  className: string,
  trimester: number,
  logoUrl: string,
): string {
  return `
    <div class="header-row">
      <div class="header-left">
        <div class="school-name">${escHtml(schoolName)}</div>
        <div class="school-detail">${escHtml(schoolAddress)}</div>
        <div class="school-detail">${escHtml(schoolPhone)}</div>
      </div>
      <div class="header-center">
        <div class="rep">REPUBLIQUE DU MALI</div>
        <div class="devise">Un Peuple – Un But – Une Foi</div>
      </div>
      <div class="header-right">
        ${logoUrl ? `<div class="logo"><img src="${escHtml(logoUrl)}" alt="Logo" /></div>` : ""}
      </div>
    </div>
    <div class="header">
      <div class="title">BULLETIN SCOLAIRE</div>
      <div class="subtitle">Année scolaire ${escHtml(academicYearName)} – Trimestre ${String(trimester)}</div>
    </div>
    <table class="info">
      <tr>
        <td class="lbl">Élève</td>
        <td class="val">${escHtml(student.lastName.toUpperCase())} ${escHtml(student.firstName)}</td>
        <td class="lbl">Classe</td>
        <td class="val">${escHtml(className)}</td>
        <td class="lbl">Rang</td>
        <td class="val">${student.rank ? `${student.rank}/${student.totalStudents}` : "—"}</td>
      </tr>
    </table>
    <table class="notes">
      <thead><tr>
        <th class="col-m">Matières</th>
        <th class="col-c">Coeff.</th>
        <th class="col-n">N.Classe</th>
        <th class="col-n">N.Comp</th>
        <th class="col-n">Moy.Générale</th>
        <th class="col-a">Appréciation</th>
      </tr></thead>
      <tbody>
        ${student.subjects.map(s => `
          <tr class="${s.absent ? "ar" : ""}">
            <td class="col-m">${escHtml(s.subjectName)}</td>
            <td class="col-c">${s.absent ? "—" : s.coefficient}</td>
            <td class="col-n">${s.absent ? "—" : fmt(s.devoirAverage)}</td>
            <td class="col-n">${s.absent ? "—" : fmt(s.trimestrielleScore)}</td>
            <td class="col-n nf">${s.absent ? "—" : fmt(s.finalAverage)}</td>
            <td class="col-a">${s.absent ? "Absent" : ""}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot>
        <tr class="tr">
          <td class="col-m">Total</td>
          <td class="col-c">${student.totalActiveCoeffs}</td>
          <td colspan="2"></td>
          <td class="col-n nf">${fmt(student.generalAverage)}</td>
          <td class="col-a">${student.mention}</td>
        </tr>
      </tfoot>
    </table>
    <div class="footer">
      <div class="footer-parent">
        <div class="sig-line">_________________________</div>
        <div>Parent</div>
      </div>
      <div class="fd">Le Directeur<br />${escHtml(directorName)}</div>
    </div>
  `
}

export function buildBulletinDocument(
  students: StudentBulletinData[],
  schoolName: string,
  schoolAddress: string,
  schoolPhone: string,
  directorName: string,
  academicYearName: string,
  className: string,
  trimester: number,
  logoUrl: string,
): string {
  const pagesHtml: string[] = []
  for (let i = 0; i < students.length; i += 2) {
    const pair = students.slice(i, i + 2)
    const bulletinsHtml = pair
      .map(s => `<div class="bulletin">${buildBulletinHTML(s, schoolName, schoolAddress, schoolPhone, directorName, academicYearName, className, trimester, logoUrl)}</div>`)
      .join("")
    pagesHtml.push(`<div class="page">${bulletinsHtml}</div>`)
  }
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Bulletins - ${escHtml(className)}</title>
  <style>${bulletinStyles}</style>
</head>
<body>${pagesHtml.join("")}</body>
</html>`
}
