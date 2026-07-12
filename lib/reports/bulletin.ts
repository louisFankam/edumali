"use client"

import { escHtml, fmt } from "./helpers"
import { downloadHTMLAsPDF } from "./pdf-renderer"

export interface SubjectBulletinRow {
  subjectName: string
  coefficient: number
  devoirAverage: number | null
  trimestrielleScore: number | null
  finalAverage: number | null
  absent: boolean
  appreciation: string
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
  weightedSum: number
}

const sharedBulletinStyles = `
.header-row { display: flex; flex-direction: row; align-items: flex-start; margin-bottom: 1.5mm; }
.header-left { flex: 1; text-align: left; font-size: 11pt; }
.header-left .school-name { font-weight: bold; font-size: 11pt; text-transform: uppercase; }
.header-left .school-detail { font-size: 8.5pt; color: #333; }
.header-center { flex: 0 0 auto; text-align: center; }
.header-right { flex: 1; text-align: right; }
.header { margin-bottom: 2mm; }
.logo { text-align: center; }
.logo img { max-height: 18mm; width: auto; object-fit: contain; }
.header .rep { font-size: 11pt; font-weight: bold; letter-spacing: 1pt; }
.header .devise { font-size: 8.5pt; font-style: italic; }
.header .title { font-size: 11pt; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 0.5mm 0; text-align: center; }
.header .subtitle { font-size: 11pt; margin-bottom: 1mm; text-align: center; }
.info { width: 100%; font-size: 11pt; border-collapse: collapse; margin-bottom: 6mm; border: 1px solid #000; }
.info td { padding: 2px 4px; vertical-align: top; border: 1px solid #000; }
.info .lbl { font-weight: bold; white-space: nowrap; width: 25%; background: #f0f0f0; }
.info .val { }
table.notes { width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 2mm; table-layout: fixed; }
table.notes th,
table.notes td { border: 1px solid #000; padding: 1px 3px !important; line-height: 1.1 !important; height: 16px !important; text-align: center; vertical-align: middle; white-space: nowrap; overflow: hidden; }
table.notes th { font-weight: bold; background: #f0f0f0; }
.col-m { text-align: left; width: 30%; }
.col-c { text-align: center; width: 7%; }
.col-n { text-align: center; width: 15.75%; }
.nf { font-weight: bold; }
.ar td { color: #888; }
.ar .col-m { color: #000; }
.tr td { font-weight: bold; border-top: 2px solid #000; }
.footer { display: flex; justify-content: space-between; align-items: flex-start; font-size: 8.5pt; margin-top: 15mm; padding-top: 1mm; }
.fd { text-align: center; font-size: 11pt; }
.footer-stamp { width: 40mm; }
.footer-parent { text-align: center; font-size: 11pt; font-weight: bold; letter-spacing: 1pt; text-transform: uppercase; }
`

export const bulletinStyles = `
@page { size: A4 landscape; margin: 0; }
body { margin: 0; padding: 0; font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; font-size: 11pt; }
.page { width: 297mm; min-height: 210mm; display: flex; flex-direction: row; align-items: stretch; margin: 0 auto; box-sizing: border-box; page-break-after: always; }
.bulletin { width: 50%; border: 1px solid #000; padding: 3mm; margin: 0; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid; display: flex; flex-direction: column; justify-content: flex-start; }
.page > .bulletin:first-child { border-right: none; }
${sharedBulletinStyles}
`

export const previewStyles = `
.bulletin { font-family: 'Times New Roman', Times, serif; font-size: 11pt; border: 1px solid #000; padding: 3mm 3mm 6cm; margin: 0 auto; box-sizing: border-box; display: flex; flex-direction: column; width: 148mm; }
${sharedBulletinStyles}
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
        ${logoUrl ? `<div class="logo"><img src="${escHtml(logoUrl)}" alt="Logo" /></div>` : ""}
      </div>
      <div class="header-right">
        <div class="rep">REPUBLIQUE DU MALI</div>
        <div class="devise">Un Peuple – Un But – Une Foi</div>
      </div>
    </div>
    <div class="header">
      <div class="title">BULLETIN DE NOTES DE LA ${trimester}ÈME PERIODE</div>
      <div class="subtitle">Année scolaire ${escHtml(academicYearName)} – Trimestre ${String(trimester)}</div>
    </div>
    <table class="info">
      <tr><td class="lbl">Classe</td><td class="val">${escHtml(className)}</td></tr>
      <tr><td class="lbl">Prénoms de l'Élève</td><td class="val">${escHtml(student.firstName)}</td></tr>
      <tr><td class="lbl">Nom de l'Élève</td><td class="val">${escHtml(student.lastName.toUpperCase())}</td></tr>
      <tr><td class="lbl">Rang</td><td class="val">${student.rank && student.totalStudents ? `${student.rank}/${student.totalStudents}` : "—"}</td></tr>
    </table>
    <table class="notes">
      <thead><tr>
        <th class="col-c">Coef</th>
        <th class="col-m">Matières</th>
        <th class="col-n">N.Classe</th>
        <th class="col-n">N.Comp/40</th>
        <th class="col-n">Moy.Géné</th>
        <th class="col-n">N.Coeff</th>
      </tr></thead>
      <tbody>
        ${student.subjects.map(s => `
          <tr class="${s.absent ? "ar" : ""}">
            <td class="col-c">${s.absent ? "—" : s.coefficient}</td>
            <td class="col-m">${escHtml(s.subjectName)}</td>
            <td class="col-n">${s.absent ? "—" : fmt(s.devoirAverage)}</td>
            <td class="col-n">${s.absent ? "—" : fmt(s.trimestrielleScore)}</td>
            <td class="col-n nf">${s.absent ? "—" : fmt(s.finalAverage)}</td>
            <td class="col-n">${s.absent ? "—" : fmt((s.finalAverage ?? 0) * s.coefficient)}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot>
        <tr class="tr">
          <td class="col-c">${student.totalActiveCoeffs}</td>
          <td class="col-m">Total</td>
          <td class="col-n"></td>
          <td class="col-n"></td>
          <td class="col-n nf">${fmt(student.generalAverage)}</td>
          <td class="col-n nf">${fmt(student.weightedSum)}</td>
        </tr>
        <tr>
          <td colspan="6" style="text-align:left;border:1px solid #000;padding:2px 4px;font-size:9pt;">
            <strong>Moyenne :</strong> ${fmt(student.generalAverage)}
          </td>
        </tr>
        <tr>
          <td colspan="6" style="text-align:left;border:1px solid #000;padding:2px 4px;font-size:9pt;">
            <strong>Rang :</strong> ${student.rank}/${student.totalStudents}
          </td>
        </tr>
        <tr>
          <td colspan="6" style="text-align:left;border:1px solid #000;padding:2px 4px;font-size:9pt;">
            <strong>Appréciation :</strong> ${student.mention}
          </td>
        </tr>
      </tfoot>
    </table>
    <div class="footer">
      <div class="fd">DIRECTEUR<br /><strong>${escHtml(directorName)}</strong></div>
      <div class="footer-stamp"></div>
      <div class="footer-parent">PARENTS</div>
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
  <title>${escHtml(schoolName)}</title>
  <style>${bulletinStyles}</style>
</head>
<body>${pagesHtml.join("")}</body>
</html>`
}

export async function downloadBulletinPDF(
  students: StudentBulletinData[],
  schoolName: string,
  schoolAddress: string,
  schoolPhone: string,
  directorName: string,
  academicYearName: string,
  className: string,
  trimester: number,
  logoUrl: string,
): Promise<void> {
  const html = buildBulletinDocument(students, schoolName, schoolAddress, schoolPhone, directorName, academicYearName, className, trimester, logoUrl)
  await downloadHTMLAsPDF(html, `bulletins-${className}-T${trimester}.html`)
}

// ─── Bulletin Annuel ─────────────────────────────────────────────

export interface AnnualSubjectBulletinRow {
  subjectName: string
  coefficient: number
  trimesterAverages: Record<number, number | null>
  annualAverage: number | null
  points: number | null
}

export interface AnnualStudentBulletinData {
  lastName: string
  firstName: string
  subjects: AnnualSubjectBulletinRow[]
  annualGeneralAverage: number | null
  annualRank: number | null
  totalStudents: number
  totalPoints: number
  totalCoeffs: number
  admis: boolean
}

const sharedAnnualBulletinStyles = `
.header-row { display: flex; flex-direction: row; align-items: flex-start; margin-bottom: 1.5mm; }
.header-left { flex: 1; text-align: left; font-size: 11pt; }
.header-left .school-name { font-weight: bold; font-size: 11pt; text-transform: uppercase; }
.header-left .school-detail { font-size: 8.5pt; color: #333; }
.header-center { flex: 0 0 auto; text-align: center; }
.header-right { flex: 1; text-align: right; }
.header { margin-bottom: 2mm; }
.logo { text-align: center; }
.logo img { max-height: 18mm; width: auto; object-fit: contain; }
.header .rep { font-size: 11pt; font-weight: bold; letter-spacing: 1pt; }
.header .devise { font-size: 8.5pt; font-style: italic; }
.header .title { font-size: 11pt; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 0.5mm 0; text-align: center; }
.header .subtitle { font-size: 11pt; margin-bottom: 1mm; text-align: center; }
.info { width: 100%; font-size: 11pt; border-collapse: collapse; margin-bottom: 6mm; border: 1px solid #000; }
.info td { padding: 2px 4px; vertical-align: top; border: 1px solid #000; }
.info .lbl { font-weight: bold; white-space: nowrap; width: 25%; background: #f0f0f0; }
.info .val { }
table.notes { width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 0; table-layout: fixed; }
table.notes th,
table.notes td { border: 1px solid #000; padding: 1px 3px !important; line-height: 1.1 !important; height: 16px !important; text-align: center; vertical-align: middle; white-space: nowrap; overflow: hidden; }
table.notes th { font-weight: bold; background: #f0f0f0; }
.col-m { text-align: left; width: 31%; }
.col-c { text-align: center; width: 7%; }
.col-t { text-align: center; width: 12%; }
.col-ma { text-align: center; width: 13%; }
.col-p { text-align: center; width: 9%; }
.nf { font-weight: bold; }
.tr td { font-weight: bold; border-top: 2px solid #000; }
table.recap { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-top: 4mm; margin-bottom: 2mm; border: 1px solid #000; }
table.recap td { border: 1px solid #000; padding: 2px 6px; vertical-align: middle; }
table.recap .recap-lbl { font-weight: bold; width: 50%; background: #f0f0f0; }
table.recap .recap-val { text-align: center; font-weight: bold; }
table.recap .recap-decision { text-align: center; font-weight: bold; letter-spacing: 2pt; }
.footer { display: flex; justify-content: space-between; align-items: flex-start; font-size: 8.5pt; margin-top: 15mm; padding-top: 1mm; }
.fd { text-align: center; font-size: 11pt; }
.footer-stamp { width: 40mm; }
.footer-parent { text-align: center; font-size: 11pt; font-weight: bold; letter-spacing: 1pt; text-transform: uppercase; }
`

export const annualBulletinStyles = `
@page { size: A4 landscape; margin: 0; }
body { margin: 0; padding: 0; font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; font-size: 11pt; }
.page { width: 297mm; min-height: 210mm; display: flex; flex-direction: row; align-items: stretch; margin: 0 auto; box-sizing: border-box; page-break-after: always; }
.bulletin { width: 50%; border: 1px solid #000; padding: 3mm; margin: 0; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid; display: flex; flex-direction: column; justify-content: flex-start; }
.page > .bulletin:first-child { border-right: none; }
${sharedAnnualBulletinStyles}
`

export const annualPreviewStyles = `
.bulletin { font-family: 'Times New Roman', Times, serif; font-size: 11pt; border: 1px solid #000; padding: 3mm 3mm 6cm; margin: 0 auto; box-sizing: border-box; display: flex; flex-direction: column; width: 148mm; }
${sharedAnnualBulletinStyles}
`

function trimesterLabel(t: number): string {
  return `T${t}`
}

function annualTableHeaders(trimesters: number[]): string {
  const tHeaders = trimesters.map(t => `<th class="col-t">${trimesterLabel(t)}</th>`).join("")
  return `
    <th class="col-m">Matières</th>
    <th class="col-c">Coeff.</th>
    ${tHeaders}
    <th class="col-ma">Moy. Annuelle</th>
    <th class="col-p">Points</th>
  `
}

function annualTableRow(subj: AnnualSubjectBulletinRow, trimesters: number[]): string {
  const tCells = trimesters.map(t => {
    const v = subj.trimesterAverages[t]
    return `<td class="col-t">${v !== null ? fmt(v) : "—"}</td>`
  }).join("")
  return `
    <tr>
      <td class="col-m">${escHtml(subj.subjectName)}</td>
      <td class="col-c">${subj.coefficient}</td>
      ${tCells}
      <td class="col-ma nf">${fmt(subj.annualAverage)}</td>
      <td class="col-p nf">${fmt(subj.points)}</td>
    </tr>
  `
}

function annualRecapTableHtml(student: AnnualStudentBulletinData): string {
  const rankStr = student.annualRank && student.totalStudents
    ? `${student.annualRank}/${student.totalStudents}`
    : "—"
  const decisionColor = student.admis ? "#15803d" : "#dc2626"
  const decisionText = student.admis ? "ADMIS" : "ÉCHOUÉ"
  return `
    <table class="recap">
      <tr><td colspan="2" style="text-align:center;font-weight:bold;background:#f0f0f0;border:1px solid #000;padding:2px 6px;">RÉCAPITULATIF ANNUEL</td></tr>
      <tr><td class="recap-lbl">Moyenne Générale</td><td class="recap-val">${fmt(student.annualGeneralAverage)}</td></tr>
      <tr><td class="recap-lbl">Total des Points</td><td class="recap-val">${fmt(student.totalPoints)}</td></tr>
      <tr><td class="recap-lbl">Total des Coefficients</td><td class="recap-val">${student.totalCoeffs}</td></tr>
      <tr><td class="recap-lbl">Rang</td><td class="recap-val">${rankStr}</td></tr>
      <tr><td class="recap-lbl">Décision</td><td class="recap-decision" style="color:${decisionColor}">${decisionText}</td></tr>
    </table>
  `
}

export function buildAnnualBulletinHTML(
  student: AnnualStudentBulletinData,
  schoolName: string,
  schoolAddress: string,
  schoolPhone: string,
  directorName: string,
  academicYearName: string,
  className: string,
  trimesters: number[],
  logoUrl: string,
): string {
  const synthLabel = trimesters.map(trimesterLabel).join("/")
  return `
    <div class="header-row">
      <div class="header-left">
        <div class="school-name">${escHtml(schoolName)}</div>
        <div class="school-detail">${escHtml(schoolAddress)}</div>
        <div class="school-detail">${escHtml(schoolPhone)}</div>
      </div>
      <div class="header-center">
        ${logoUrl ? `<div class="logo"><img src="${escHtml(logoUrl)}" alt="Logo" /></div>` : ""}
      </div>
      <div class="header-right">
        <div class="rep">REPUBLIQUE DU MALI</div>
        <div class="devise">Un Peuple – Un But – Une Foi</div>
      </div>
    </div>
    <div class="header">
      <div class="title">BULLETIN ANNUEL</div>
      <div class="subtitle">Année scolaire ${escHtml(academicYearName)} – Synthèse ${synthLabel}</div>
    </div>
    <table class="info">
      <tr><td class="lbl">Classe</td><td class="val">${escHtml(className)}</td></tr>
      <tr><td class="lbl">Prénoms de l'Élève</td><td class="val">${escHtml(student.firstName)}</td></tr>
      <tr><td class="lbl">Nom de l'Élève</td><td class="val">${escHtml(student.lastName.toUpperCase())}</td></tr>
      <tr><td class="lbl">Rang</td><td class="val">${student.annualRank && student.totalStudents ? `${student.annualRank}/${student.totalStudents}` : "—"}</td></tr>
      <tr><td class="lbl">Statut</td><td class="val" style="font-weight:bold;color:${student.admis ? '#15803d' : '#dc2626'}">${student.admis ? "ADMIS" : "ÉCHOUÉ"}</td></tr>
    </table>
    <table class="notes">
      <thead><tr>${annualTableHeaders(trimesters)}</tr></thead>
      <tbody>
        ${student.subjects.map(s => annualTableRow(s, trimesters)).join("")}
      </tbody>
      <tfoot>
        <tr class="tr">
          <td class="col-m">Total</td>
          <td class="col-c">${student.totalCoeffs}</td>
          ${trimesters.map(() => '<td class="col-t"></td>').join("")}
          <td class="col-ma nf">${fmt(student.annualGeneralAverage)}</td>
          <td class="col-p nf">${fmt(student.totalPoints)}</td>
        </tr>
      </tfoot>
    </table>
    ${annualRecapTableHtml(student)}
    <div class="footer">
      <div class="fd">DIRECTEUR<br /><strong>${escHtml(directorName)}</strong></div>
      <div class="footer-stamp"></div>
      <div class="footer-parent">PARENTS</div>
    </div>
  `
}

export function buildAnnualBulletinDocument(
  students: AnnualStudentBulletinData[],
  schoolName: string,
  schoolAddress: string,
  schoolPhone: string,
  directorName: string,
  academicYearName: string,
  className: string,
  trimesters: number[],
  logoUrl: string,
): string {
  const pagesHtml: string[] = []
  for (let i = 0; i < students.length; i += 2) {
    const pair = students.slice(i, i + 2)
    const bulletinsHtml = pair
      .map(s => `<div class="bulletin">${buildAnnualBulletinHTML(s, schoolName, schoolAddress, schoolPhone, directorName, academicYearName, className, trimesters, logoUrl)}</div>`)
      .join("")
    pagesHtml.push(`<div class="page">${bulletinsHtml}</div>`)
  }
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>${escHtml(schoolName)}</title>
  <style>${annualBulletinStyles}</style>
</head>
<body>${pagesHtml.join("")}</body>
</html>`
}

export async function downloadAnnualBulletinPDF(
  students: AnnualStudentBulletinData[],
  schoolName: string,
  schoolAddress: string,
  schoolPhone: string,
  directorName: string,
  academicYearName: string,
  className: string,
  trimesters: number[],
  logoUrl: string,
): Promise<void> {
  const html = buildAnnualBulletinDocument(students, schoolName, schoolAddress, schoolPhone, directorName, academicYearName, className, trimesters, logoUrl)
  await downloadHTMLAsPDF(html, `bulletins-annuels-${className}.html`)
}
