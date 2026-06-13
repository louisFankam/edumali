"use client"

import { forwardRef } from "react"

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
  }
  schoolInfo: {
    name: string
    address?: string
    phone?: string
    email?: string
    logoUrl?: string
    director?: string
  }
  receiptNumber: string
}

const methodLabels: Record<string, string> = {
  espèces: "Espèces",
  mobile_money: "Mobile Money",
  virement: "Virement bancaire",
  chèque: "Chèque",
}

export const receiptStyles = `
  @page { size: A5 landscape; margin: 0mm; }
  @media print {
    body { margin: 0; padding: 0; }
  }
  .receipt-container {
    font-family: 'Courier New', Courier, monospace;
    font-size: 10pt;
    color: #1f2937;
    max-width: 210mm;
    margin: 0 auto;
    padding: 12px 20px;
  }
  .receipt-header {
    text-align: center;
    border-bottom: 2px dashed #374151;
    padding-bottom: 10px;
    margin-bottom: 16px;
  }
  .receipt-header .school-name {
    font-size: 13pt;
    font-weight: bold;
    color: #111827;
    margin-top: 4px;
  }
  .receipt-header .school-detail {
    font-size: 7.5pt;
    color: #6b7280;
    margin: 2px 0;
  }
  .receipt-title {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    letter-spacing: 2pt;
    margin: 14px 0 4px;
  }
  .receipt-number {
    text-align: center;
    font-size: 9pt;
    color: #6b7280;
    margin-bottom: 16px;
  }
  .receipt-info-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
  }
  .receipt-info-table td {
    padding: 3px 6px;
    font-size: 9pt;
    vertical-align: top;
  }
  .receipt-info-table td:first-child {
    font-weight: 600;
    width: 110px;
    color: #374151;
  }
  .receipt-divider {
    border-top: 1px dashed #9ca3af;
    margin: 12px 0;
  }
  .receipt-amount {
    text-align: center;
    font-size: 18pt;
    font-weight: bold;
    color: #059669;
    margin: 12px 0;
    padding: 8px;
    border: 2px solid #059669;
    border-radius: 4px;
  }
  .receipt-footer {
    text-align: center;
    font-size: 7.5pt;
    color: #9ca3af;
    border-top: 1px dashed #9ca3af;
    padding-top: 8px;
    margin-top: 20px;
  }
  .receipt-stamp {
    margin-top: 16px;
    text-align: right;
    font-size: 9pt;
  }
  .receipt-stamp .line {
    margin-top: 24px;
    border-top: 1px solid #374151;
    width: 180px;
    display: inline-block;
  }
  .receipt-legal {
    text-align: center;
    font-size: 7pt;
    color: #9ca3af;
    margin-top: 12px;
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
  const { payment, student, schoolInfo, receiptNumber } = props
  const logo = schoolInfo.logoUrl
    ? `<img src="${schoolInfo.logoUrl}" alt="Logo" style="height:50px;max-width:120px;object-fit:contain;" />`
    : ""

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
    </div>

    <div class="receipt-title">REÇU DE PAIEMENT</div>
    <div class="receipt-number">N° ${escHtml(receiptNumber)}</div>

    <table class="receipt-info-table">
      <tr><td>Élève</td><td>${escHtml(student.lastName)} ${escHtml(student.firstName)}</td></tr>
      ${student.className ? `<tr><td>Classe</td><td>${escHtml(student.className)}</td></tr>` : ""}
      ${student.parentName ? `<tr><td>Parent</td><td>${escHtml(student.parentName)}</td></tr>` : ""}
      ${student.parentPhone ? `<tr><td>Téléphone</td><td>${escHtml(student.parentPhone)}</td></tr>` : ""}
    </table>

    <div class="receipt-divider"></div>

    <table class="receipt-info-table">
      <tr><td>Date paiement</td><td>${formatReceiptDate(payment.date)}</td></tr>
      ${payment.feeTypeName ? `<tr><td>Type de frais</td><td>${escHtml(payment.feeTypeName)}</td></tr>` : ""}
      <tr><td>Mode</td><td>${methodLabels[payment.method] || payment.method}</td></tr>
      ${payment.reference ? `<tr><td>Référence</td><td>${escHtml(payment.reference)}</td></tr>` : ""}
    </table>

    <div class="receipt-amount">${formatReceiptAmount(payment.amount)}</div>

    <div class="receipt-stamp">
      ${schoolInfo.director ? `<p>Le Directeur</p><div class="line"></div><p style="margin:4px 0 0;font-weight:600;font-size:9pt">${escHtml(schoolInfo.director)}</p>` : ""}
    </div>

    <div class="receipt-footer">
      Reçu généré électroniquement le ${new Date().toLocaleDateString("fr-FR")}
    </div>
    <div class="receipt-legal">
      Ce document fait office de reçu officiel. Conservez-le comme preuve de paiement.
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

export type { ReceiptContentProps }
