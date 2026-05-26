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
  const distTotal = p.distribution.excellent + p.distribution.bien + p.distribution.assezBien
    + p.distribution.passable + p.distribution.insuffisant

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Rapport de classe - ${escHtml(p.className)}</title>
  <style>
    @page { size: A4; margin: 1.5cm; }
    body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 1.5cm; font-size: 11pt; }
    .header { text-align: center; margin-bottom: 0.8cm; }
    .header .school { font-weight: bold; font-size: 14pt; text-transform: uppercase; }
    .header .detail { font-size: 10pt; color: #333; }
    .header .rep { font-size: 13pt; font-weight: bold; letter-spacing: 2pt; }
    .header .devise { font-size: 9pt; font-style: italic; }
    .title { text-align: center; font-size: 15pt; font-weight: bold; text-decoration: underline; margin: 0.6cm 0; }
    .section { margin: 0.5cm 0; }
    .section-title { font-size: 12pt; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 3pt; margin-bottom: 0.3cm; }
    .grid { display: flex; flex-wrap: wrap; gap: 0.3cm; margin: 0.3cm 0; }
    .stat-card { border: 1px solid #000; padding: 8pt 12pt; flex: 1; min-width: 120pt; }
    .stat-card .label { font-size: 8pt; color: #555; text-transform: uppercase; }
    .stat-card .value { font-size: 16pt; font-weight: bold; }
    .table { width: 100%; border-collapse: collapse; margin: 0.3cm 0; }
    .table th, .table td { border: 1px solid #000; padding: 6pt 10pt; text-align: center; }
    .table th { background: #f0f0f0; font-weight: bold; }
    .table .left { text-align: left; }
    .bar { display: flex; height: 22pt; border-radius: 3pt; overflow: hidden; margin: 0.3cm 0; }
    .bar-seg { display: flex; align-items: center; justify-content: center; font-size: 7pt; font-weight: bold; color: #fff; min-width: fit-content; padding: 0 4pt; white-space: nowrap; }
    .sig { margin-top: 1.5cm; text-align: right; }
    .sig .line { margin-top: 1cm; }
    .footer { text-align: center; margin-top: 1.2cm; font-size: 8pt; color: #666; border-top: 1px solid #ccc; padding-top: 0.3cm; }
    .pass { color: #059669; font-weight: bold; }
    .warn { color: #d97706; font-weight: bold; }
    .fail { color: #dc2626; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div class="rep">REPUBLIQUE DU MALI</div>
    <div class="devise">Un Peuple – Un But – Une Foi</div>
    <div class="school">${escHtml(p.schoolName)}</div>
    <div class="detail">${escHtml(p.schoolAddress)} — Tel: ${escHtml(p.schoolPhone)}</div>
  </div>

  <div class="title">RAPPORT DE CLASSE</div>

  <p style="text-align:center;font-size:12pt;font-weight:bold;margin-bottom:0.5cm;">
    ${escHtml(p.className)} – ${escHtml(p.academicYearName)} – ${trimesterLabels[p.trimester - 1] || "Trimestre " + p.trimester}
  </p>

  <div class="section">
    <div class="section-title">Aperçu général</div>
    <div class="grid">
      <div class="stat-card"><div class="label">Élèves</div><div class="value">${p.totalStudents}</div></div>
      <div class="stat-card"><div class="label">Moyenne générale</div><div class="value">${p.averageGrade}</div></div>
      <div class="stat-card"><div class="label">Taux de réussite</div><div class="value ${p.passRate >= 70 ? "pass" : p.passRate >= 50 ? "warn" : "fail"}">${p.passRate}%</div></div>
      <div class="stat-card"><div class="label">Élèves suivis</div><div class="value">${p.studentsFollowed}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Répartition des résultats</div>
    ${distTotal > 0 ? `
    <div class="bar">
      ${[
        { label: "≥16", value: p.distribution.excellent, color: "#059669" },
        { label: "14-16", value: p.distribution.bien, color: "#2563eb" },
        { label: "12-14", value: p.distribution.assezBien, color: "#d97706" },
        { label: "10-12", value: p.distribution.passable, color: "#ea580c" },
        { label: "<10", value: p.distribution.insuffisant, color: "#dc2626" },
      ].filter(s => s.value > 0).map(s => `
        <div class="bar-seg" style="flex:${s.value / distTotal};background:${s.color};">${s.label} (${((s.value / distTotal) * 100).toFixed(0)}%)</div>
      `).join("")}
    </div>
    <table class="table">
      <thead><tr><th class="left">Catégorie</th><th>Nombre</th><th>Pourcentage</th></tr></thead>
      <tbody>
        <tr><td class="left">Excellent (≥16)</td><td>${p.distribution.excellent}</td><td>${((p.distribution.excellent / distTotal) * 100).toFixed(1)}%</td></tr>
        <tr><td class="left">Bien (14-16)</td><td>${p.distribution.bien}</td><td>${((p.distribution.bien / distTotal) * 100).toFixed(1)}%</td></tr>
        <tr><td class="left">Assez bien (12-14)</td><td>${p.distribution.assezBien}</td><td>${((p.distribution.assezBien / distTotal) * 100).toFixed(1)}%</td></tr>
        <tr><td class="left">Passable (10-12)</td><td>${p.distribution.passable}</td><td>${((p.distribution.passable / distTotal) * 100).toFixed(1)}%</td></tr>
        <tr><td class="left">Insuffisant (&lt;10)</td><td>${p.distribution.insuffisant}</td><td>${((p.distribution.insuffisant / distTotal) * 100).toFixed(1)}%</td></tr>
      </tbody>
    </table>
    ` : "<p>Aucune donnée de répartition disponible</p>"}
  </div>

  <div class="section">
    <div class="section-title">Moyennes par trimestre</div>
    <table class="table">
      <thead><tr><th class="left">Trimestre</th><th>Moyenne</th></tr></thead>
      <tbody>${p.trimesterAverages.map((avg, i) => `
        <tr><td class="left">${trimesterLabels[i]}</td><td>${avg !== null ? avg.toFixed(2) + "/20" : "—"}</td></tr>
      `).join("")}</tbody>
    </table>
  </div>

  <div style="display:flex;gap:0.3cm;">
    <div style="flex:1;">
      <div class="section-title">Matières les mieux réussies</div>
      ${p.topSubjects.length > 0 ? `
      <table class="table">
        <thead><tr><th class="left">Matière</th><th>Moy.</th></tr></thead>
        <tbody>${p.topSubjects.map(s => `<tr><td class="left">${escHtml(s.name)}</td><td class="pass">${s.average.toFixed(2)}</td></tr>`).join("")}</tbody>
      </table>
      ` : "<p>Aucune donnée</p>"}
    </div>
    <div style="flex:1;">
      <div class="section-title">Matières à améliorer</div>
      ${p.weakSubjects.length > 0 ? `
      <table class="table">
        <thead><tr><th class="left">Matière</th><th>Moy.</th></tr></thead>
        <tbody>${p.weakSubjects.map(s => `<tr><td class="left">${escHtml(s.name)}</td><td class="fail">${s.average.toFixed(2)}</td></tr>`).join("")}</tbody>
      </table>
      ` : "<p>Aucune donnée</p>"}
    </div>
  </div>

  ${p.attendance ? `
  <div class="section">
    <div class="section-title">Présences</div>
    <table class="table">
      <thead><tr><th class="left">Statut</th><th>Nombre</th><th>%</th></tr></thead>
      <tbody>
        <tr><td class="left">Présent</td><td>${p.attendance.présent}</td><td>${p.attendance.total > 0 ? ((p.attendance.présent / p.attendance.total) * 100).toFixed(1) : 0}%</td></tr>
        <tr><td class="left">Absent</td><td>${p.attendance.absent}</td><td>${p.attendance.total > 0 ? ((p.attendance.absent / p.attendance.total) * 100).toFixed(1) : 0}%</td></tr>
        <tr><td class="left">Retard</td><td>${p.attendance.retard}</td><td>${p.attendance.total > 0 ? ((p.attendance.retard / p.attendance.total) * 100).toFixed(1) : 0}%</td></tr>
        <tr><td class="left">Congé</td><td>${p.attendance.congé}</td><td>${p.attendance.total > 0 ? ((p.attendance.congé / p.attendance.total) * 100).toFixed(1) : 0}%</td></tr>
      </tbody>
      <tfoot><tr style="font-weight:bold;border-top:2px solid #000;"><td class="left">Taux de présence</td><td colspan="2" class="${p.attendance.rate >= 80 ? "pass" : "warn"}">${p.attendance.rate}%</td></tr></tfoot>
    </table>
  </div>
  ` : ""}

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
