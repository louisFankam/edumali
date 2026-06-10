"use client"

import { escHtml, SCHOOL_REPORT_HEADER, SIGNATURE, SCHOOL_FOOTER, reportStyles } from "./helpers"
import { downloadHTMLAsPDF } from "./pdf-renderer"

export interface AttendanceReportParams {
  className: string
  trimester: number
  academicYearName: string
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  directorName: string
  total: number
  présent: number
  absent: number
  retard: number
  congé: number
  rate: number
}

export function buildAttendanceHTML(p: AttendanceReportParams): string {
  return `${SCHOOL_REPORT_HEADER(p)}

<div class="report-title">RELEVÉ DE PRÉSENCES</div>
<div class="report-subtitle">${escHtml(p.className)} — ${escHtml(p.academicYearName)} — Trimestre ${p.trimester}</div>

<table>
  <thead>
    <tr>
      <th>Statut</th>
      <th class="text-center">Nombre</th>
      <th class="text-center">Pourcentage</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Présent</td>
      <td class="text-center text-green font-bold">${p.présent}</td>
      <td class="text-center">${p.total > 0 ? ((p.présent / p.total) * 100).toFixed(1) : 0}%</td>
    </tr>
    <tr>
      <td>Absent</td>
      <td class="text-center text-red font-bold">${p.absent}</td>
      <td class="text-center">${p.total > 0 ? ((p.absent / p.total) * 100).toFixed(1) : 0}%</td>
    </tr>
    <tr>
      <td>Retard</td>
      <td class="text-center text-orange font-bold">${p.retard}</td>
      <td class="text-center">${p.total > 0 ? ((p.retard / p.total) * 100).toFixed(1) : 0}%</td>
    </tr>
    <tr>
      <td>Congé</td>
      <td class="text-center">${p.congé}</td>
      <td class="text-center">${p.total > 0 ? ((p.congé / p.total) * 100).toFixed(1) : 0}%</td>
    </tr>
  </tbody>
  <tfoot>
    <tr style="font-weight:bold;border-top:2px solid #1e40af;">
      <td>Total</td>
      <td class="text-center font-bold">${p.total}</td>
      <td class="text-center">100%</td>
    </tr>
  </tfoot>
</table>

<div style="text-align:center;margin:16px 0;">
  <span style="font-weight:bold;">Taux de présence : </span>
  <span class="${p.rate >= 80 ? "text-green" : p.rate >= 60 ? "text-orange" : "text-red"}" style="font-size:13pt;font-weight:bold;">${p.rate}%</span>
</div>

${SIGNATURE(p)}
${SCHOOL_FOOTER(p)}`
}

export async function downloadAttendancePDF(p: AttendanceReportParams): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Présences - ${escHtml(p.className)}</title>
  <style>${reportStyles}</style>
</head>
<body>${buildAttendanceHTML(p)}</body>
</html>`
  await downloadHTMLAsPDF(html, `presences-${p.className}-T${p.trimester}.html`)
}
