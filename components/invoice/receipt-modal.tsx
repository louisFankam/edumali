"use client"

import { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import { ReceiptContentProps, buildReceiptHTML, receiptStyles, formatReceiptDate, formatReceiptAmount } from "./receipt-content"
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
    await downloadHTMLAsPDF(html, `recu-${data.receiptNumber}.pdf`, false, "a4")
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

const methodLabels: Record<string, string> = {
  espèces: "Espèces",
  mobile_money: "Mobile Money",
  virement: "Virement bancaire",
  chèque: "Chèque",
}

function ReceiptView(props: ReceiptContentProps) {
  const { payment, student, schoolInfo, receiptNumber, academicYear, feeBreakdown, totalDue, alreadyPaid } = props

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
                style={{ height: 60, maxWidth: 140, objectFit: "contain" }}
              />
            </div>
          )}
          <div className="school-name">{schoolInfo.name}</div>
          {schoolInfo.address && <div className="school-detail">{schoolInfo.address}</div>}
          <div className="school-detail">
            {schoolInfo.phone && `Tel: ${schoolInfo.phone}`}
            {schoolInfo.email && ` — Email: ${schoolInfo.email}`}
          </div>
          <div className="school-detail">
            {schoolInfo.rccm && `RCCM: ${schoolInfo.rccm}`}
            {schoolInfo.nif && ` — NIF: ${schoolInfo.nif}`}
          </div>
        </div>

        <div className="receipt-title">REÇU DE PAIEMENT</div>
        <div className="receipt-number">N° {receiptNumber}</div>
        {academicYear && <div className="receipt-academic-year">Année scolaire: {academicYear}</div>}

        <div className="receipt-info-block">
          <div className="block">
            <div className="receipt-col-title">INFORMATIONS ÉLÈVE</div>
            <table className="receipt-info-table">
              <tbody>
                <tr><td>Élève</td><td><strong>{student.lastName} {student.firstName}</strong></td></tr>
                {student.className && <tr><td>Classe</td><td>{student.className}</td></tr>}
                {student.matricule && <tr><td>Matricule</td><td><strong>{student.matricule}</strong></td></tr>}
                {student.parentName && <tr><td>Parent</td><td>{student.parentName}</td></tr>}
                {student.parentPhone && <tr><td>Tél. parent</td><td>{student.parentPhone}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="block">
            <div className="receipt-col-title">INFORMATIONS PAIEMENT</div>
            <table className="receipt-info-table">
              <tbody>
                <tr><td>Date</td><td><strong>{formatReceiptDate(payment.date)}</strong></td></tr>
                {payment.feeTypeName && <tr><td>Type de frais</td><td>{payment.feeTypeName}</td></tr>}
                <tr><td>Mode</td><td>{methodLabels[payment.method] || payment.method}</td></tr>
                {payment.reference && <tr><td>Référence</td><td>{payment.reference}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {feeBreakdown && feeBreakdown.length > 0 && (
          <>
            <div className="receipt-section-title">DÉTAIL DU PAIEMENT</div>
            <table className="receipt-detail-table">
              <thead>
                <tr><th>Désignation</th><th>Montant</th><th>Échéancier</th></tr>
              </thead>
              <tbody>
                {feeBreakdown.map((f, i) => (
                  <tr key={i}>
                    <td>{f.name}</td>
                    <td>{f.amount.toLocaleString("fr-FR")} FCFA</td>
                    <td>{f.period}</td>
                  </tr>
                ))}
                {totalDue !== undefined && (
                  <tr className="total-row"><td>TOTAL DÛ</td><td>{totalDue.toLocaleString("fr-FR")} FCFA</td><td></td></tr>
                )}
                {alreadyPaid !== undefined && (
                  <tr><td>Déjà payé</td><td>-{alreadyPaid.toLocaleString("fr-FR")} FCFA</td><td></td></tr>
                )}
                <tr className="highlight-row"><td>CE PAIEMENT</td><td>{payment.amount.toLocaleString("fr-FR")} FCFA</td><td></td></tr>
                {totalDue !== undefined && alreadyPaid !== undefined && (
                  <tr className="total-row"><td>RESTE À PAYER</td><td>{Math.max(0, totalDue - alreadyPaid - payment.amount).toLocaleString("fr-FR")} FCFA</td><td></td></tr>
                )}
              </tbody>
            </table>
          </>
        )}

        <div className="receipt-amount-box">
          MONTANT PAYÉ : {formatReceiptAmount(payment.amount)}
        </div>

        <div className="receipt-stamp">
          <div className="signature-block">
            <div className="signature-label">L&apos;Élève / Le Parent</div>
            <div className="line"></div>
          </div>
          <div className="signature-block">
            <div className="signature-label">Le Directeur</div>
            <div className="line"></div>
            {schoolInfo.director && (
              <div className="signature-label" style={{ fontWeight: 600 }}>{schoolInfo.director}</div>
            )}
          </div>
        </div>

        <div className="receipt-footer">
          Document généré le {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="receipt-legal">
          Ce reçu fait office de preuve de paiement officiel. Conservez-le précieusement.
        </div>
      </div>
    </div>
  )
}

export type { ReceiptModalProps }
