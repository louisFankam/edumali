"use client"

import { escHtml, SCHOOL_REPORT_HEADER, SIGNATURE, SCHOOL_FOOTER, reportStyles } from "./helpers"
import { downloadHTMLAsPDF } from "./pdf-renderer"

export interface ClassReportParams {
  className: string
  academicYearName: string
  trimester: number
  totalStudents: number
  studentsFollowed: number
  averageGrade: string
  numericAverage: number | null
  passRate: number
  distribution: {
    excellent: number
    bien: number
    assezBien: number
    passable: number
    insuffisant: number
  }
  topSubjects: { name: string; average: number }[]
  weakSubjects: { name: string; average: number }[]
  trimesterAverages: (number | null)[]
  attendance?: {
    total: number
    présent: number
    absent: number
    retard: number
    congé: number
    rate: number
  }
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  directorName: string
}

const trimesterLabels = ["1er Trimestre", "2ème Trimestre", "3ème Trimestre"]

export function buildClassReportHTML(p: ClassReportParams): string {
  const distTotal =
    p.distribution.excellent +
    p.distribution.bien +
    p.distribution.assezBien +
    p.distribution.passable +
    p.distribution.insuffisant

  const passColor = p.passRate >= 70 ? "text-green" : p.passRate >= 50 ? "text-orange" : "text-red"

  return `${SCHOOL_REPORT_HEADER(p)}

<div class="report-title">RAPPORT DE CLASSE</div>
<div class="report-subtitle">${escHtml(p.className)} — ${escHtml(p.academicYearName)} — ${trimesterLabels[p.trimester - 1] || "Trimestre " + p.trimester}</div>

<div class="section-title">Aperçu général</div>
<div class="stats-grid">
  <div class="stat-card"><div class="label">Élèves</div><div class="value">${p.totalStudents}</div></div>
  <div class="stat-card"><div class="label">Moyenne générale</div><div class="value">${p.averageGrade}</div></div>
  <div class="stat-card"><div class="label">Taux de réussite</div><div class="value ${passColor}">${p.passRate}%</div></div>
  <div class="stat-card"><div class="label">Élèves suivis</div><div class="value">${p.studentsFollowed}</div></div>
</div>

<div class="section-title">Répartition des résultats</div>
${distTotal > 0 ? `
<table>
  <thead>
    <tr><th>Catégorie</th><th class="text-center">Nombre</th><th class="text-center">Pourcentage</th></tr>
  </thead>
  <tbody>
    <tr><td>Excellent (≥16)</td><td class="text-center">${p.distribution.excellent}</td><td class="text-center">${((p.distribution.excellent / distTotal) * 100).toFixed(1)}%</td></tr>
    <tr><td>Bien (14-16)</td><td class="text-center">${p.distribution.bien}</td><td class="text-center">${((p.distribution.bien / distTotal) * 100).toFixed(1)}%</td></tr>
    <tr><td>Assez bien (12-14)</td><td class="text-center">${p.distribution.assezBien}</td><td class="text-center">${((p.distribution.assezBien / distTotal) * 100).toFixed(1)}%</td></tr>
    <tr><td>Passable (10-12)</td><td class="text-center">${p.distribution.passable}</td><td class="text-center">${((p.distribution.passable / distTotal) * 100).toFixed(1)}%</td></tr>
    <tr><td>Insuffisant (&lt;10)</td><td class="text-center">${p.distribution.insuffisant}</td><td class="text-center">${((p.distribution.insuffisant / distTotal) * 100).toFixed(1)}%</td></tr>
  </tbody>
</table>
` : '<p class="text-muted" style="text-align:center;">Aucune donnée de répartition disponible</p>'}

<div class="section">
  <div class="section-title">Évolution des moyennes</div>
  ${p.trimesterAverages.length > 0 ? `
  <table>
    <thead><tr><th>Trimestre</th><th class="text-center">Moyenne</th></tr></thead>
    <tbody>
      ${p.trimesterAverages
        .map(
          (avg, i) =>
            `<tr><td>${trimesterLabels[i]}</td><td class="text-center font-bold">${avg !== null ? avg.toFixed(2) + "/20" : "—"}</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>
  ` : '<p class="text-muted" style="text-align:center;">Aucune donnée</p>'}
</div>

<div style="display:flex;gap:12px;margin-bottom:12px;">
  <div style="flex:1;">
    <div class="section-title">Matières les mieux réussies</div>
    ${p.topSubjects.length > 0 ? `
    <table>
      <thead><tr><th>Matière</th><th class="text-center">Moy.</th></tr></thead>
      <tbody>
        ${p.topSubjects.map((s) => `<tr><td>${escHtml(s.name)}</td><td class="text-center text-green font-bold">${s.average.toFixed(2)}</td></tr>`).join("")}
      </tbody>
    </table>
    ` : '<p class="text-muted" style="text-align:center;">Aucune donnée</p>'}
  </div>
  <div style="flex:1;">
    <div class="section-title">Matières à améliorer</div>
    ${p.weakSubjects.length > 0 ? `
    <table>
      <thead><tr><th>Matière</th><th class="text-center">Moy.</th></tr></thead>
      <tbody>
        ${p.weakSubjects.map((s) => `<tr><td>${escHtml(s.name)}</td><td class="text-center text-red font-bold">${s.average.toFixed(2)}</td></tr>`).join("")}
      </tbody>
    </table>
    ` : '<p class="text-muted" style="text-align:center;">Aucune donnée</p>'}
  </div>
</div>

${p.attendance ? `
<div class="section-title">Présences</div>
<table>
  <thead><tr><th>Statut</th><th class="text-center">Nombre</th><th class="text-center">%</th></tr></thead>
  <tbody>
    <tr><td>Présent</td><td class="text-center text-green font-bold">${p.attendance.présent}</td><td class="text-center">${p.attendance.total > 0 ? ((p.attendance.présent / p.attendance.total) * 100).toFixed(1) : 0}%</td></tr>
    <tr><td>Absent</td><td class="text-center text-red font-bold">${p.attendance.absent}</td><td class="text-center">${p.attendance.total > 0 ? ((p.attendance.absent / p.attendance.total) * 100).toFixed(1) : 0}%</td></tr>
    <tr><td>Retard</td><td class="text-center text-orange font-bold">${p.attendance.retard}</td><td class="text-center">${p.attendance.total > 0 ? ((p.attendance.retard / p.attendance.total) * 100).toFixed(1) : 0}%</td></tr>
    <tr><td>Congé</td><td class="text-center">${p.attendance.congé}</td><td class="text-center">${p.attendance.total > 0 ? ((p.attendance.congé / p.attendance.total) * 100).toFixed(1) : 0}%</td></tr>
  </tbody>
  <tfoot>
    <tr style="font-weight:bold;border-top:2px solid #1e40af;">
      <td>Taux de présence</td>
      <td colspan="2" class="text-center ${p.attendance.rate >= 80 ? "text-green" : "text-orange"}">${p.attendance.rate}%</td>
    </tr>
  </tfoot>
</table>
` : ""}

${SIGNATURE(p)}
${SCHOOL_FOOTER(p)}`
}

export async function downloadClassReportPDF(p: ClassReportParams): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Rapport de classe - ${escHtml(p.className)}</title>
  <style>${reportStyles}</style>
</head>
<body>${buildClassReportHTML(p)}</body>
</html>`
  await downloadHTMLAsPDF(html, `rapport-classe-${p.className}-T${p.trimester}.html`)
}
