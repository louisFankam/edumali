export function escHtml(s: string): string {
  if (s === null || s === undefined) return ""
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function fmt(n: number | null): string {
  if (n === null || n === undefined) return "—"
  return n.toFixed(2).replace(".", ",")
}

export const SCHOOL_REPORT_HEADER = (p: {
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  directorName: string
  logoUrl?: string
  schoolEmail?: string
}) => `
<div class="header">
  <div class="rep">REPUBLIQUE DU MALI</div>
  <div class="devise">Un Peuple — Un But — Une Foi</div>
  <div class="school-name">${escHtml(p.schoolName)}</div>
  <div class="school-detail">${escHtml(p.schoolAddress)} — Tel: ${escHtml(p.schoolPhone)}${p.schoolEmail ? " — Email: " + escHtml(p.schoolEmail) : ""}</div>
</div>
`

export const SIGNATURE = (p: { schoolAddress: string; directorName: string }) => `
<div class="signature">
  <p>Fait à ${escHtml(p.schoolAddress || "Bamako")}, le ${new Date().toLocaleDateString("fr-FR")}</p>
  <div class="line"></div>
  <p style="font-size:10pt;font-weight:bold;margin:4px 0 0">${escHtml(p.directorName)}</p>
  <p style="font-size:8pt;color:#6b7280;margin:0">Le Directeur</p>
</div>
`

export const SCHOOL_FOOTER = (p: { schoolName: string; schoolAddress: string; schoolPhone: string }) => `
<div class="footer">
  ${escHtml(p.schoolName)} — ${escHtml(p.schoolAddress)} — Tel: ${escHtml(p.schoolPhone)}
</div>
`

export const reportStyles = `
body {
  font-family: Helvetica, Arial, sans-serif;
  color: #1f2937;
  margin: 0;
  padding: 18px;
  font-size: 10pt;
  line-height: 1.5;
}
.header {
  text-align: center;
  border-bottom: 3px solid #1e40af;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.header .rep {
  font-size: 10pt;
  font-weight: bold;
  letter-spacing: 1.5pt;
  color: #1e40af;
}
.header .devise {
  font-size: 7.5pt;
  font-style: italic;
  color: #6b7280;
}
.header .school-name {
  font-size: 12pt;
  font-weight: bold;
  color: #111827;
  margin-top: 3px;
}
.header .school-detail {
  font-size: 7.5pt;
  color: #6b7280;
}
.report-title {
  text-align: center;
  font-size: 15pt;
  font-weight: bold;
  color: #1e40af;
  margin: 16px 0;
}
.report-subtitle {
  text-align: center;
  font-size: 10pt;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}
.section {
  margin-bottom: 16px;
}
.section-title {
  font-size: 11pt;
  font-weight: bold;
  color: #1e40af;
  border-bottom: 1.5px solid #d1d5db;
  padding-bottom: 3px;
  margin-bottom: 8px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}
th {
  background: #1e40af;
  color: #fff;
  padding: 5px 7px;
  text-align: left;
  font-size: 8.5pt;
  font-weight: 600;
}
td {
  padding: 4px 7px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 9pt;
}
tr:nth-child(even) td {
  background: #f9fafb;
}
.text-center { text-align: center; }
.text-right { text-align: right; }
.font-bold { font-weight: bold; }
.text-green { color: #059669; }
.text-red { color: #dc2626; }
.text-orange { color: #ea580c; }
.text-muted { color: #9ca3af; }
.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.stat-card {
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  padding: 8px 12px;
  flex: 1;
  min-width: 90px;
  text-align: center;
}
.stat-card .label {
  font-size: 7pt;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5pt;
}
.stat-card .value {
  font-size: 13pt;
  font-weight: bold;
  color: #111827;
  margin-top: 1px;
}
.badge {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 3px;
  font-size: 8pt;
  font-weight: 600;
}
.badge-green { background: #d1fae5; color: #065f46; }
.badge-red { background: #fee2e2; color: #991b1b; }
.badge-blue { background: #dbeafe; color: #1e40af; }
.badge-orange { background: #ffedd5; color: #9a3412; }
.footer {
  text-align: center;
  font-size: 7.5pt;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
  padding-top: 8px;
  margin-top: 24px;
}
.signature {
  margin-top: 20px;
  text-align: right;
  font-size: 9pt;
}
.signature .line {
  margin-top: 18px;
  border-top: 1px solid #374151;
  width: 190px;
  display: block;
}
`
