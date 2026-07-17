"use client"

interface PaymentHistoryItem {
  id: number | string
  amount: number
  method: string
  date: string
  feeTypeName?: string | null
  status?: string
}

interface ReceiptContentProps {
  payment: {
    id: number | string
    amount: number
    method: string
    date: string
    feeTypeName?: string | null
    reference?: string | null
  }
  student: {
    firstName: string
    lastName: string
    parentName?: string
    parentPhone?: string
    className?: string
    matricule?: string
  }
  schoolInfo: {
    name: string
    address?: string
    phone?: string
    email?: string
    logoUrl?: string
    director?: string
    rccm?: string
    nif?: string
  }
  receiptNumber: string
  academicYear?: string
  feeBreakdown?: { name: string; amount: number; period: string }[]
  totalDue?: number
  alreadyPaid?: number
  paymentHistory?: PaymentHistoryItem[]
}

const methodLabels: Record<string, string> = {
  espèces: "Espèces",
  mobile_money: "Mobile Money",
  virement: "Virement bancaire",
  chèque: "Chèque",
}

export const receiptStyles = `
  @page { size: A4 portrait; margin: 10mm; }
  @media print {
    body { margin: 0; padding: 0; }
  }
  .receipt-container {
    font-family: 'Courier New', Courier, monospace;
    font-size: 10pt;
    color: #1f2937;
    width: 190mm;
    margin: 0 auto;
    padding: 0;
  }
  .receipt-header {
    text-align: center;
    border-bottom: 2px solid #374151;
    padding-bottom: 10px;
    margin-bottom: 12px;
  }
  .receipt-header .school-name {
    font-size: 16pt;
    font-weight: bold;
    color: #111827;
    margin-top: 4px;
  }
  .receipt-header .school-detail {
    font-size: 8pt;
    color: #6b7280;
    margin: 2px 0;
  }
  .receipt-title {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    letter-spacing: 2pt;
    margin: 12px 0 4px;
  }
  .receipt-number {
    text-align: center;
    font-size: 10pt;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .receipt-academic-year {
    text-align: center;
    font-size: 9pt;
    color: #6b7280;
    margin-bottom: 12px;
  }
  .receipt-info-block {
    margin-bottom: 14px;
  }
  .receipt-info-block .block {
    margin-bottom: 10px;
  }
  .receipt-col-title {
    font-size: 10pt;
    font-weight: bold;
    background-color: #f3f4f6;
    padding: 4px 8px;
    border: 1px solid #d1d5db;
    margin-bottom: 0;
  }
  .receipt-info-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
  }
  .receipt-info-table td {
    padding: 3px 8px;
    font-size: 9pt;
    vertical-align: top;
    border: 1px solid #e5e7eb;
  }
  .receipt-info-table td:first-child {
    font-weight: 600;
    width: 100px;
    color: #374151;
    background-color: #f9fafb;
  }
  .receipt-section-title {
    font-size: 10pt;
    font-weight: bold;
    margin: 14px 0 6px;
    padding-bottom: 2px;
    border-bottom: 1px solid #374151;
  }
  .receipt-detail-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }
  .receipt-detail-table th {
    background-color: #f3f4f6;
    font-size: 9pt;
    font-weight: bold;
    padding: 4px 8px;
    border: 1px solid #d1d5db;
    text-align: left;
  }
  .receipt-detail-table th:nth-child(2),
  .receipt-detail-table th:nth-child(3) {
    text-align: right;
  }
  .receipt-detail-table td {
    padding: 3px 8px;
    font-size: 9pt;
    border: 1px solid #e5e7eb;
  }
  .receipt-detail-table td:nth-child(2),
  .receipt-detail-table td:nth-child(3) {
    text-align: right;
  }
  .receipt-detail-table tr.total-row td {
    font-weight: bold;
    border-top: 2px solid #374151;
  }
  .receipt-detail-table tr.highlight-row td {
    font-weight: bold;
    font-size: 10pt;
  }
  .receipt-amount-box {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin: 12px 0;
    padding: 8px;
    border: 2px solid #374151;
  }
  .receipt-stamp {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }
  .receipt-stamp .signature-block {
    text-align: center;
    width: 45%;
  }
  .receipt-stamp .line {
    margin-top: 30px;
    border-top: 1px solid #374151;
    width: 100%;
    display: inline-block;
  }
  .receipt-stamp .signature-label {
    font-size: 9pt;
    margin-top: 4px;
  }
  .receipt-footer {
    text-align: center;
    font-size: 7.5pt;
    color: #9ca3af;
    border-top: 1px dashed #9ca3af;
    padding-top: 6px;
    margin-top: 16px;
  }
  .receipt-legal {
    text-align: center;
    font-size: 7pt;
    color: #9ca3af;
    margin-top: 4px;
    font-style: italic;
  }
`

export function formatReceiptDate(dateStr: string): string {
  if (!dateStr) return ""
  const [y, m, d] = dateStr.split("-")
  return `${d}/${m}/${y}`
}

export function formatReceiptAmount(n: number): string {
  return n.toLocaleString("fr-FR") + " FCFA"
}

export function buildReceiptHTML(props: ReceiptContentProps): string {
  const { payment, student, schoolInfo, receiptNumber, academicYear, feeBreakdown, totalDue, alreadyPaid, paymentHistory } = props
  const logo = schoolInfo.logoUrl
    ? `<img src="${schoolInfo.logoUrl}" alt="Logo" style="height:60px;max-width:140px;object-fit:contain;" />`
    : ""

  const feeBreakdownRows = feeBreakdown && feeBreakdown.length > 0
    ? feeBreakdown.map(f => `
      <tr>
        <td>${escHtml(f.name)}</td>
        <td>${f.amount.toLocaleString("fr-FR")} FCFA</td>
        <td>${escHtml(f.period)}</td>
      </tr>`).join("")
    : ""

  const summaryRows = totalDue !== undefined ? `
    <tr class="total-row"><td>TOTAL DÛ</td><td>${totalDue.toLocaleString("fr-FR")} FCFA</td><td></td></tr>
    ${alreadyPaid !== undefined ? `<tr><td>Déjà payé</td><td>-${alreadyPaid.toLocaleString("fr-FR")} FCFA</td><td></td></tr>` : ""}
    <tr class="highlight-row"><td>CE PAIEMENT</td><td>${payment.amount.toLocaleString("fr-FR")} FCFA</td><td></td></tr>
    ${totalDue !== undefined && alreadyPaid !== undefined ? `
    <tr class="total-row"><td>RESTE À PAYER</td><td>${Math.max(0, totalDue - alreadyPaid - payment.amount).toLocaleString("fr-FR")} FCFA</td><td></td></tr>` : ""}
  ` : ""

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Facture</title>
  <style>${receiptStyles}</style>
</head>
<body>
  <div class="receipt-container">
    <div class="receipt-header">
      ${logo ? `<div>${logo}</div>` : ""}
      <div class="school-name">${escHtml(schoolInfo.name)}</div>
      ${schoolInfo.address ? `<div class="school-detail">${escHtml(schoolInfo.address)}</div>` : ""}
      <div class="school-detail">
        ${schoolInfo.phone ? `Tel: ${escHtml(schoolInfo.phone)}` : ""}
        ${schoolInfo.email ? ` — Email: ${escHtml(schoolInfo.email)}` : ""}
      </div>
      <div class="school-detail">
        ${schoolInfo.rccm ? `RCCM: ${escHtml(schoolInfo.rccm)}` : ""}
        ${schoolInfo.nif ? ` — NIF: ${escHtml(schoolInfo.nif)}` : ""}
      </div>
    </div>

    <div class="receipt-title">REÇU DE PAIEMENT</div>
    <div class="receipt-number">N° ${escHtml(receiptNumber)}</div>
    ${academicYear ? `<div class="receipt-academic-year">Année scolaire: ${escHtml(academicYear)}</div>` : ""}

    <div class="receipt-info-block">
      <div class="block">
        <div class="receipt-col-title">INFORMATIONS ÉLÈVE</div>
        <table class="receipt-info-table">
          <tr><td>Élève</td><td><strong>${escHtml(student.lastName)} ${escHtml(student.firstName)}</strong></td></tr>
          ${student.className ? `<tr><td>Classe</td><td>${escHtml(student.className)}</td></tr>` : ""}
          ${student.matricule ? `<tr><td>Matricule</td><td><strong>${escHtml(student.matricule)}</strong></td></tr>` : ""}
          ${student.parentName ? `<tr><td>Parent</td><td>${escHtml(student.parentName)}</td></tr>` : ""}
          ${student.parentPhone ? `<tr><td>Tél. parent</td><td>${escHtml(student.parentPhone)}</td></tr>` : ""}
        </table>
      </div>
      <div class="block">
        <div class="receipt-col-title">INFORMATIONS PAIEMENT</div>
        <table class="receipt-info-table">
          <tr><td>Date</td><td><strong>${formatReceiptDate(payment.date)}</strong></td></tr>
          ${payment.feeTypeName ? `<tr><td>Type de frais</td><td>${escHtml(payment.feeTypeName)}</td></tr>` : ""}
          <tr><td>Mode</td><td>${methodLabels[payment.method] || payment.method}</td></tr>
          ${payment.reference ? `<tr><td>Référence</td><td>${escHtml(payment.reference)}</td></tr>` : ""}
        </table>
      </div>
    </div>

    ${feeBreakdownRows ? `
    <div class="receipt-section-title">DÉTAIL DU PAIEMENT</div>
    <table class="receipt-detail-table">
      <thead>
        <tr><th>Désignation</th><th>Montant</th><th>Échéancier</th></tr>
      </thead>
      <tbody>
        ${feeBreakdownRows}
        ${summaryRows}
      </tbody>
    </table>
    ` : ""}

    <div class="receipt-amount-box">
      MONTANT PAYÉ : ${formatReceiptAmount(payment.amount)}
    </div>

    <div class="receipt-stamp">
      <div class="signature-block">
        <div class="signature-label">L'Élève / Le Parent</div>
        <div class="line"></div>
      </div>
      <div class="signature-block">
        <div class="signature-label">Le Directeur</div>
        <div class="line"></div>
        ${schoolInfo.director ? `<div class="signature-label" style="font-weight:600">${escHtml(schoolInfo.director)}</div>` : ""}
      </div>
    </div>

    <div class="receipt-footer">
      Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
    </div>
    <div class="receipt-legal">
      Ce reçu fait office de preuve de paiement officiel. Conservez-le précieusement.
    </div>
  </div>
</body>
</html>`
}

function escHtml(s: string | null | undefined): string {
  if (s === null || s === undefined) return ""
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export type { ReceiptContentProps, PaymentHistoryItem }
