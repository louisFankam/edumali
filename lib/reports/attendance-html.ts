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
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Relevé de présences - ${escHtml(p.className)}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 2cm; font-size: 12pt; }
    .header { text-align: center; margin-bottom: 1cm; }
    .header .school { font-weight: bold; font-size: 14pt; text-transform: uppercase; }
    .header .detail { font-size: 10pt; color: #333; }
    .header .rep { font-size: 13pt; font-weight: bold; letter-spacing: 2pt; margin-top: 4pt; }
    .header .devise { font-size: 9pt; font-style: italic; }
    .title { text-align: center; font-size: 15pt; font-weight: bold; text-decoration: underline; margin: 0.8cm 0; }
    .info { font-size: 11pt; margin-bottom: 0.8cm; }
    .info td { padding: 4pt 8pt; }
    .table { width: 100%; border-collapse: collapse; margin: 0.5cm 0; }
    .table th, .table td { border: 1px solid #000; padding: 8pt 12pt; text-align: center; }
    .table th { background: #f0f0f0; font-weight: bold; }
    .table .left { text-align: left; }
    .success { color: #059669; font-weight: bold; }
    .danger { color: #dc2626; font-weight: bold; }
    .warn { color: #d97706; font-weight: bold; }
    .footer { text-align: center; margin-top: 1.5cm; font-size: 9pt; color: #666; }
    .sig { margin-top: 1.5cm; text-align: right; }
    .sig .line { margin-top: 1cm; }
  </style>
</head>
<body>
  <div class="header">
    <div class="rep">REPUBLIQUE DU MALI</div>
    <div class="devise">Un Peuple – Un But – Une Foi</div>
    <div class="school">${escHtml(p.schoolName)}</div>
    <div class="detail">${escHtml(p.schoolAddress)} — Tel: ${escHtml(p.schoolPhone)}</div>
  </div>

  <div class="title">RELEVÉ DE PRÉSENCES</div>

  <table class="info">
    <tr><td><strong>Classe :</strong></td><td>${escHtml(p.className)}</td></tr>
    <tr><td><strong>Période :</strong></td><td>Année ${escHtml(p.academicYearName)} – Trimestre ${p.trimester}</td></tr>
  </table>

  <table class="table">
    <thead>
      <tr>
        <th>Statut</th>
        <th>Nombre</th>
        <th>Pourcentage</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="left">Présent</td>
        <td class="success">${p.présent}</td>
        <td>${p.total > 0 ? ((p.présent / p.total) * 100).toFixed(1) : 0}%</td>
      </tr>
      <tr>
        <td class="left">Absent</td>
        <td class="danger">${p.absent}</td>
        <td>${p.total > 0 ? ((p.absent / p.total) * 100).toFixed(1) : 0}%</td>
      </tr>
      <tr>
        <td class="left">Retard</td>
        <td class="warn">${p.retard}</td>
        <td>${p.total > 0 ? ((p.retard / p.total) * 100).toFixed(1) : 0}%</td>
      </tr>
      <tr>
        <td class="left">Congé</td>
        <td>${p.congé}</td>
        <td>${p.total > 0 ? ((p.congé / p.total) * 100).toFixed(1) : 0}%</td>
      </tr>
    </tbody>
    <tfoot>
      <tr style="font-weight:bold; border-top: 2px solid #000;">
        <td class="left">Total</td>
        <td>${p.total}</td>
        <td>100%</td>
      </tr>
    </tfoot>
  </table>

  <p style="text-align:center; margin-top:1cm;">
    <strong>Taux de présence :</strong>
    <span class="${p.rate >= 80 ? "success" : p.rate >= 60 ? "warn" : "danger"}">${p.rate}%</span>
  </p>

  <div class="sig">
    <div>Fait à ${escHtml(p.schoolAddress || "Bamako")}, le ${new Date().toLocaleDateString("fr-FR")}</div>
    <div class="line">_________________________</div>
    <div><strong>${escHtml(p.directorName)}</strong></div>
    <div>Le Directeur</div>
  </div>

  <div class="footer">${escHtml(p.schoolName)} – ${escHtml(p.schoolAddress)} – Tel: ${escHtml(p.schoolPhone)}</div>
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
