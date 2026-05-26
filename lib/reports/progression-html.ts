export interface ProgressionReportParams {
  className: string
  academicYearName: string
  trimesterAverages: (number | null)[]
  topSubjects: { name: string; average: number }[]
  weakSubjects: { name: string; average: number }[]
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  directorName: string
}

const trimesterLabels = ["1er Trimestre", "2ème Trimestre", "3ème Trimestre"]

export function buildProgressionHTML(p: ProgressionReportParams): string {
  const validAverages = p.trimesterAverages.filter((a): a is number => a !== null)
  const trend = validAverages.length >= 2
    ? validAverages[validAverages.length - 1] - validAverages[0]
    : null

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Rapport de progression - ${escHtml(p.className)}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 2cm; font-size: 12pt; }
    .header { text-align: center; margin-bottom: 1cm; }
    .header .school { font-weight: bold; font-size: 14pt; text-transform: uppercase; }
    .header .detail { font-size: 10pt; color: #333; }
    .header .rep { font-size: 13pt; font-weight: bold; letter-spacing: 2pt; margin-top: 4pt; }
    .header .devise { font-size: 9pt; font-style: italic; }
    .title { text-align: center; font-size: 15pt; font-weight: bold; text-decoration: underline; margin: 0.8cm 0; }
    .section { margin: 0.6cm 0; }
    .section-title { font-size: 13pt; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 4pt; margin-bottom: 0.4cm; }
    .table { width: 100%; border-collapse: collapse; margin: 0.4cm 0; }
    .table th, .table td { border: 1px solid #000; padding: 8pt 12pt; text-align: center; }
    .table th { background: #f0f0f0; font-weight: bold; }
    .table .left { text-align: left; }
    .up { color: #059669; font-weight: bold; }
    .down { color: #dc2626; font-weight: bold; }
    .stable { color: #d97706; font-weight: bold; }
    .bar-bg { width: 100%; height: 20pt; background: #e5e7eb; border-radius: 3pt; position: relative; }
    .bar-fill { height: 20pt; background: #2563eb; border-radius: 3pt; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 8pt; font-weight: bold; min-width: fit-content; padding: 0 6pt; }
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

  <div class="title">RAPPORT DE PROGRESSION</div>

  <p style="margin-bottom:0.5cm;"><strong>Classe :</strong> ${escHtml(p.className)} — ${escHtml(p.academicYearName)}</p>

  <div class="section">
    <div class="section-title">Évolution des moyennes générales</div>
    <table class="table">
      <thead>
        <tr>
          <th>Trimestre</th>
          <th>Moyenne</th>
          <th>Évolution</th>
        </tr>
      </thead>
      <tbody>
        ${p.trimesterAverages.map((avg, i) => {
          const prev = i > 0 ? p.trimesterAverages[i - 1] : null
          let diff = null
          let cls = ""
          let symbol = ""
          if (avg !== null && prev !== null) {
            diff = avg - prev
            cls = diff > 0 ? "up" : diff < 0 ? "down" : "stable"
            symbol = diff > 0 ? "▲" : diff < 0 ? "▼" : "—"
          }
          return `
            <tr>
              <td class="left">${trimesterLabels[i]}</td>
              <td>${avg !== null ? avg.toFixed(2) + "/20" : "—"}</td>
              <td class="${cls}">
                ${diff !== null ? `${symbol} ${diff >= 0 ? "+" : ""}${diff.toFixed(2)} pts` : "—"}
              </td>
            </tr>
          `
        }).join("")}
      </tbody>
      <tfoot>
        <tr style="font-weight:bold; border-top:2px solid #000;">
          <td class="left">Tendance générale</td>
          <td colspan="2" class="${trend !== null ? (trend > 0 ? "up" : trend < 0 ? "down" : "stable") : ""}">
            ${trend !== null
              ? `${trend > 0 ? "Progression" : trend < 0 ? "Régression" : "Stable"} (${trend >= 0 ? "+" : ""}${trend.toFixed(2)} pts)`
              : "Données insuffisantes"}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Matières les mieux réussies</div>
    ${p.topSubjects.length > 0 ? `
    <table class="table">
      <thead><tr><th class="left">Matière</th><th>Moyenne</th></tr></thead>
      <tbody>${p.topSubjects.map(s => `<tr><td class="left">${escHtml(s.name)}</td><td class="up">${s.average.toFixed(2)}/20</td></tr>`).join("")}</tbody>
    </table>
    ` : "<p>Aucune donnée</p>"}
  </div>

  <div class="section">
    <div class="section-title">Matières à améliorer</div>
    ${p.weakSubjects.length > 0 ? `
    <table class="table">
      <thead><tr><th class="left">Matière</th><th>Moyenne</th></tr></thead>
      <tbody>${p.weakSubjects.map(s => `<tr><td class="left">${escHtml(s.name)}</td><td class="down">${s.average.toFixed(2)}/20</td></tr>`).join("")}</tbody>
    </table>
    ` : "<p>Aucune donnée</p>"}
  </div>

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
