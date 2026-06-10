"use client"

import { escHtml, fmt, SCHOOL_REPORT_HEADER, SIGNATURE, SCHOOL_FOOTER } from "./helpers"
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
}

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
<div class="report-title">BULLETIN SCOLAIRE</div>
<div class="report-subtitle">${escHtml(academicYearName)} — Trimestre ${trimester}</div>

<table>
  <tr>
    <td style="width:50%"><span class="font-bold">Élève :</span> ${escHtml(student.lastName.toUpperCase())} ${escHtml(student.firstName)}</td>
    <td style="width:25%"><span class="font-bold">Classe :</span> ${escHtml(className)}</td>
    <td style="width:25%" class="text-center"><span class="font-bold">Rang :</span> ${student.rank && student.totalStudents ? `${student.rank}/${student.totalStudents}` : "—"}</td>
  </tr>
</table>

<div class="section-title">Notes par matière</div>
<table>
  <thead>
    <tr>
      <th>Matière</th>
      <th class="text-center">Coeff.</th>
      <th class="text-center">Moy.</th>
      <th class="text-center">Moy. Gén.</th>
      <th>Appréciation</th>
    </tr>
  </thead>
  <tbody>
    ${student.subjects
      .map(
        (s) => `
    <tr${s.absent ? ' class="text-muted"' : ""}>
      <td>${escHtml(s.subjectName)}</td>
      <td class="text-center">${s.absent ? "—" : s.coefficient}</td>
      <td class="text-center">${s.absent ? "—" : fmt(s.devoirAverage)}</td>
      <td class="text-center font-bold">${s.absent ? "—" : fmt(s.finalAverage)}</td>
      <td>${escHtml(s.appreciation)}</td>
    </tr>`,
      )
      .join("")}
  </tbody>
  <tfoot>
    <tr style="font-weight:bold;border-top:2px solid #1e40af;">
      <td>Total</td>
      <td class="text-center">${student.totalActiveCoeffs}</td>
      <td></td>
      <td class="text-center">${fmt(student.generalAverage)}</td>
      <td>${escHtml(student.mention)}</td>
    </tr>
  </tfoot>
</table>
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
  const header = SCHOOL_REPORT_HEADER({ schoolName, schoolAddress, schoolPhone, directorName, logoUrl })
  const footer = `<br/>${SIGNATURE({ schoolAddress, directorName })}<br/>${SCHOOL_FOOTER({ schoolName, schoolAddress, schoolPhone })}`
  const pages = students
    .map(
      (s) => `
<div class="section" style="page-break-after:always;">
  ${header}
  ${buildBulletinHTML(s, schoolName, schoolAddress, schoolPhone, directorName, academicYearName, className, trimester, logoUrl)}
  ${footer}
</div>`,
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Bulletins - ${escHtml(className)}</title>
  <style>${reportStyles}</style>
</head>
<body>${pages}</body>
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
