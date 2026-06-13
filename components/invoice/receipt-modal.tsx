"use client"

import { useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import { ReceiptContentProps, buildReceiptHTML, receiptStyles } from "./receipt-content"
import { downloadHTMLAsPDF } from "@/lib/reports/pdf-renderer"

interface ReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ReceiptContentProps
}

export function ReceiptModal({ open, onOpenChange, data }: ReceiptModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    const html = buildReceiptHTML(data)
    await downloadHTMLAsPDF(html, `recu-${data.receiptNumber}.pdf`, true, "a5")
  }

  const handlePrint = () => {
    const w = window.open("", "_blank")
    if (!w) return
    const html = buildReceiptHTML(data)
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Facture</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />Imprimer
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />PDF
            </Button>
          </div>
        </DialogHeader>
        <div ref={contentRef}>
          <ReceiptView {...data} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ReceiptView(props: ReceiptContentProps) {
  const { payment, student, schoolInfo, receiptNumber } = props

  return (
    <div className="receipt-preview">
      <style>{receiptStyles}</style>
      <div className="receipt-container" style={{ maxWidth: "100%", padding: "12px" }}>
        <div className="receipt-header">
          {schoolInfo.logoUrl && (
            <div>
              <img
                src={schoolInfo.logoUrl}
                alt="Logo"
                style={{ height: 50, maxWidth: 120, objectFit: "contain" }}
              />
            </div>
          )}
          <div className="school-name">{schoolInfo.name}</div>
          {schoolInfo.address && <div className="school-detail">{schoolInfo.address}</div>}
          <div className="school-detail">
            {schoolInfo.phone && `Tel: ${schoolInfo.phone}`}
            {schoolInfo.email && ` — Email: ${schoolInfo.email}`}
          </div>
        </div>

        <div className="receipt-title">REÇU DE PAIEMENT</div>
        <div className="receipt-number">N° {receiptNumber}</div>

        <table className="receipt-info-table">
          <tbody>
            <tr><td>Élève</td><td>{student.lastName} {student.firstName}</td></tr>
            {student.className && <tr><td>Classe</td><td>{student.className}</td></tr>}
            {student.parentName && <tr><td>Parent</td><td>{student.parentName}</td></tr>}
            {student.parentPhone && <tr><td>Téléphone</td><td>{student.parentPhone}</td></tr>}
          </tbody>
        </table>

        <div className="receipt-divider" />

        <table className="receipt-info-table">
          <tbody>
            <tr><td>Date paiement</td><td>{formatReceiptDate(payment.date)}</td></tr>
            {payment.feeTypeName && <tr><td>Type de frais</td><td>{payment.feeTypeName}</td></tr>}
            <tr><td>Mode</td><td>{methodLabels[payment.method] || payment.method}</td></tr>
            {payment.reference && <tr><td>Référence</td><td>{payment.reference}</td></tr>}
          </tbody>
        </table>

        <div className="receipt-amount">{formatReceiptAmount(payment.amount)}</div>

        <div className="receipt-stamp">
          {schoolInfo.director && (
            <>
              <p>Le Directeur</p>
              <div className="line" />
              <p style={{ margin: "4px 0 0", fontWeight: 600, fontSize: "9pt" }}>{schoolInfo.director}</p>
            </>
          )}
        </div>

        <div className="receipt-footer">
          Reçu généré électroniquement le {new Date().toLocaleDateString("fr-FR")}
        </div>
        <div className="receipt-legal">
          Ce document fait office de reçu officiel. Conservez-le comme preuve de paiement.
        </div>
      </div>
    </div>
  )
}

function formatReceiptDate(dateStr: string): string {
  if (!dateStr) return ""
  const [y, m, d] = dateStr.split("-")
  return `${d}/${m}/${y}`
}

function formatReceiptAmount(n: number): string {
  return n.toLocaleString("fr-FR") + " FCFA"
}

const methodLabels: Record<string, string> = {
  espèces: "Espèces",
  mobile_money: "Mobile Money",
  virement: "Virement bancaire",
  chèque: "Chèque",
}

export type { ReceiptModalProps }
