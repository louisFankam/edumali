export interface YearComparison {
  name: string
  trimesterAverages: (number | null)[]
  studentCount: number
  passRate: number
}

export interface ComparativeAnalysisParams {
  className: string
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  directorName: string
  years: YearComparison[]
}

const trimesterLabels = ["T1", "T2", "T3"]

export function buildComparativeHTML(p: ComparativeAnalysisParams): string {
  if (p.years.length === 0) return "<html><body><p>Aucune donnée comparative disponible.</p></body></html>"

  const maxTrimesterLength = Math.max(...p.years.map(y => y.trimesterAverages.length))
  const trimesterHeaders = Array.from({ length: maxTrimesterLength }, (_, i) => `Trimestre ${i + 1}`)

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Analyse comparative - ${escHtml(p.className)}</title>
  <style>
    @page { size: A4 landscape; margin: 1.5cm; }
    body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 1.5cm; font-size: 11pt; }
    .header { text-align: center; margin-bottom: 0.8cm; }
    .header .school { font-weight: bold; font-size: 14pt; text-transform: uppercase; }
    .header .detail { font-size: 10pt; color: #333; }
    .header .rep { font-size: 13pt; font-weight: bold; letter-spacing: 2pt; }
    .header .devise { font-size: 9pt; font-style: italic; }
    .title { text-align: center; font-size: 15pt; font-weight: bold; text-decoration: underline; margin: 0.6cm 0; }
    .subtitle { text-align: center; font-size: 12pt; margin-bottom: 0.5cm; }
    .section { margin: 0.5cm 0; }
    .section-title { font-size: 12pt; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 3pt; margin-bottom: 0.3cm; }
    .table { width: 100%; border-collapse: collapse; margin: 0.3cm 0; }
    .table th, .table td { border: 1px solid #000; padding: 8pt 12pt; text-align: center; }
    .table th { background: #f0f0f0; font-weight: bold; }
    .table .left { text-align: left; }
    .table .highlight { background: #eff6ff; }
    .up { color: #059669; font-weight: bold; }
    .down { color: #dc2626; font-weight: bold; }
    .stable { color: #d97706; font-weight: bold; }
    .sig { margin-top: 1.5cm; text-align: right; }
    .sig .line { margin-top: 1cm; }
    .footer { text-align: center; margin-top: 1.2cm; font-size: 8pt; color: #666; }
    .trend-up { color: #059669; }
    .trend-down { color: #dc2626; }
  </style>
</head>
<body>
  <div class="header">
    <div class="rep">REPUBLIQUE DU MALI</div>
    <div class="devise">Un Peuple – Un But – Une Foi</div>
    <div class="school">${escHtml(p.schoolName)}</div>
    <div class="detail">${escHtml(p.schoolAddress)} — Tel: ${escHtml(p.schoolPhone)}</div>
  </div>

  <div class="title">ANALYSE COMPARATIVE</div>
  <div class="subtitle">Classe : ${escHtml(p.className)}</div>

  <div class="section">
    <div class="section-title">Moyennes par année et trimestre</div>
    <table class="table">
      <thead>
        <tr>
          <th class="left">Année scolaire</th>
          ${trimesterHeaders.map(h => `<th>${h}</th>`).join("")}
          <th>Moy. annuelle</th>
          <th>Effectif</th>
          <th>Taux réussite</th>
          <th>Tendance</th>
        </tr>
      </thead>
      <tbody>
        ${p.years.map((year, yi) => {
          const validAverages = year.trimesterAverages.filter((a): a is number => a !== null)
          const annualAvg = validAverages.length > 0
            ? validAverages.reduce((s, a) => s + a, 0) / validAverages.length
            : null

          const prevYear = yi > 0 ? p.years[yi - 1] : null
          const prevAnnual = prevYear
            ? (() => {
                const pa = prevYear.trimesterAverages.filter((a): a is number => a !== null)
                return pa.length > 0 ? pa.reduce((s, a) => s + a, 0) / pa.length : null
              })()
            : null
          let trendHtml = ""
          if (annualAvg !== null && prevAnnual !== null) {
            const diff = annualAvg - prevAnnual
            if (diff > 0.5) trendHtml = `<span class="trend-up">▲ Amélioration (+${diff.toFixed(2)})</span>`
            else if (diff < -0.5) trendHtml = `<span class="trend-down">▼ Baisse (${diff.toFixed(2)})</span>`
            else trendHtml = `<span class="stable">— Stable (${diff >= 0 ? "+" : ""}${diff.toFixed(2)})</span>`
          } else {
            trendHtml = "—"
          }

          return `
            <tr${yi === p.years.length - 1 ? ' class="highlight"' : ""}>
              <td class="left">${escHtml(year.name)}</td>
              ${Array.from({ length: maxTrimesterLength }, (_, ti) => `
                <td>${year.trimesterAverages[ti] !== undefined && year.trimesterAverages[ti] !== null
                  ? year.trimesterAverages[ti].toFixed(2)
                  : "—"
                }</td>
              `).join("")}
              <td><strong>${annualAvg !== null ? annualAvg.toFixed(2) : "—"}</strong></td>
              <td>${year.studentCount}</td>
              <td>${year.passRate}%</td>
              <td>${trendHtml}</td>
            </tr>
          `
        }).join("")}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Synthèse</div>
    ${p.years.length >= 2 ? (() => {
      const first = p.years[0]
      const last = p.years[p.years.length - 1]
      const firstAvg = first.trimesterAverages.filter((a): a is number => a !== null)
      const lastAvg = last.trimesterAverages.filter((a): a is number => a !== null)
      const fAvg = firstAvg.length > 0 ? firstAvg.reduce((s, a) => s + a, 0) / firstAvg.length : null
      const lAvg = lastAvg.length > 0 ? lastAvg.reduce((s, a) => s + a, 0) / lastAvg.length : null

      if (fAvg !== null && lAvg !== null) {
        const diff = lAvg - fAvg
        const trend = diff > 0.5 ? "positive" : diff < -0.5 ? "negative" : "stable"
        const trendText = trend === "positive"
          ? `amélioration significative (+${diff.toFixed(2)} pts entre ${first.name} et ${last.name})`
          : trend === "negative"
            ? `baisse significative (${diff.toFixed(2)} pts entre ${first.name} et ${last.name})`
            : `stabilité (${diff >= 0 ? "+" : ""}${diff.toFixed(2)} pts entre ${first.name} et ${last.name})`

        return `<p>Sur la période analysée (${first.name} → ${last.name}), la classe ${escHtml(p.className)} présente une <strong>${trendText}</strong>.</p>
          <p>Effectif : ${first.studentCount} élèves (${first.name}) → ${last.studentCount} élèves (${last.name})</p>
          <p>Taux de réussite : ${first.passRate}% (${first.name}) → ${last.passRate}% (${last.name})</p>`
      }
      return "<p>Données insuffisantes pour une synthèse comparative.</p>"
    })() : "<p>Une seule année disponible. Ajoutez plusieurs années pour une analyse comparative.</p>"}
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
