"use client"

import { escHtml, SCHOOL_REPORT_HEADER, SIGNATURE, SCHOOL_FOOTER, reportStyles } from "./helpers"
import { downloadHTMLAsPDF } from "./pdf-renderer"

export interface CertificateParams {
  studentName: string
  studentId: string | number
  className: string
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail?: string
  directorName: string
  academicYearName: string
  birthDate?: string
  birthPlace?: string
}

export function buildCertificateHTML(p: CertificateParams): string {
  return `${SCHOOL_REPORT_HEADER(p)}

<div class="report-title">CERTIFICAT DE SCOLARITÉ</div>

<div style="line-height:2;text-align:justify;font-size:10pt;margin:20px 0;">
  <p>Je soussigné, <strong>${escHtml(p.directorName)}</strong>, Directeur de <strong>${escHtml(p.schoolName)}</strong>, certifie que l'élève :</p>

  <p style="text-align:center;font-size:13pt;font-weight:bold;margin:16px 0;">
    ${escHtml(p.studentName)}
  </p>

  <p>
    ${p.birthDate || p.birthPlace ? "Né" : ""}
    ${p.birthDate ? " le " + escHtml(p.birthDate) : ""}
    ${p.birthPlace ? " à " + escHtml(p.birthPlace) : ""}
    ${p.birthDate || p.birthPlace ? "," : ""}
    est régulièrement inscrit(e) en classe de <strong>${escHtml(p.className)}</strong>
    pour l'année scolaire <strong>${escHtml(p.academicYearName)}</strong>.
  </p>

  <p>
    Cet(te) élève est suivi(e) sous le numéro d'identification <strong>${escHtml(String(p.studentId))}</strong>
    dans les registres de l'établissement.
  </p>

  <p>Le présent certificat lui est délivré pour servir et valoir ce que de droit.</p>
</div>

${SIGNATURE(p)}
${SCHOOL_FOOTER(p)}`
}

export async function downloadCertificatePDF(p: CertificateParams): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Certificat - ${escHtml(p.studentName)}</title>
  <style>${reportStyles}</style>
</head>
<body>${buildCertificateHTML(p)}</body>
</html>`
  await downloadHTMLAsPDF(html, `certificat-${p.studentName.replace(/\s+/g, "_")}.html`)
}
