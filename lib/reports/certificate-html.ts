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
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Certificat de scolarité - ${escHtml(p.studentName)}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 2cm; font-size: 12pt; }
    .header { text-align: center; margin-bottom: 1.5cm; }
    .header .rep { font-size: 14pt; font-weight: bold; letter-spacing: 2pt; }
    .header .devise { font-size: 10pt; font-style: italic; margin-top: 4pt; }
    .header .school { font-size: 13pt; font-weight: bold; margin-top: 8pt; text-transform: uppercase; }
    .header .detail { font-size: 10pt; color: #333; }
    .title { text-align: center; font-size: 16pt; font-weight: bold; text-decoration: underline; margin: 1cm 0; }
    .body { line-height: 2; text-align: justify; font-size: 12pt; margin: 1cm 0; }
    .body p { margin: 0.5cm 0; }
    .signature { margin-top: 2cm; text-align: right; }
    .signature .line { margin-top: 1.5cm; }
    .signature .name { font-weight: bold; }
    .footer { text-align: center; margin-top: 1.5cm; font-size: 9pt; color: #666; border-top: 1px solid #ccc; padding-top: 0.5cm; }
  </style>
</head>
<body>
  <div class="header">
    <div class="rep">REPUBLIQUE DU MALI</div>
    <div class="devise">Un Peuple – Un But – Une Foi</div>
    <div class="school">${escHtml(p.schoolName)}</div>
    <div class="detail">${escHtml(p.schoolAddress)}</div>
    ${p.schoolPhone ? `<div class="detail">Tel: ${escHtml(p.schoolPhone)}</div>` : ""}
    ${p.schoolEmail ? `<div class="detail">Email: ${escHtml(p.schoolEmail)}</div>` : ""}
  </div>

  <div class="title">CERTIFICAT DE SCOLARITÉ</div>

  <div class="body">
    <p>Je soussigné, <strong>${escHtml(p.directorName)}</strong>, Directeur de <strong>${escHtml(p.schoolName)}</strong>, certifie que l'élève :</p>

    <p style="text-align:center; font-size:14pt; font-weight:bold; margin:0.6cm 0;">
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

  <div class="signature">
    <p>Fait à ${escHtml(p.schoolAddress || "Bamako")}, le ${new Date().toLocaleDateString("fr-FR")}</p>
    <div class="line">_________________________</div>
    <div class="name">${escHtml(p.directorName)}</div>
    <div>Le Directeur</div>
  </div>

  <div class="footer">
    ${escHtml(p.schoolName)} – ${escHtml(p.schoolAddress)} – Tel: ${escHtml(p.schoolPhone || "—")}
  </div>
</body>
</html>`
}

function escHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
