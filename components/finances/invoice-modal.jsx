"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Printer, FileText, Phone, Mail } from "lucide-react"

export function InvoiceModal({ open, onOpenChange, student }) {
  if (!student) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    console.log("Télécharger facture:", student.studentName)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { label: "Payé", color: "bg-green-100 text-green-800" },
      partial: { label: "Partiel", color: "bg-yellow-100 text-yellow-800" },
      unpaid: { label: "Impayé", color: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status] || statusConfig.unpaid
    return <Badge className={config.color}>{config.label}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Facture - {student.studentName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4">
          {/* Header */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">FACTURE SCOLAIRE</CardTitle>
              <div className="text-sm text-gray-600">
                <p>{student.school}</p>
                <p>Année scolaire: 2024-2025</p>
                <p>Facture N°: FAC-{student.id.toString().padStart(6, "0")}</p>
              </div>
            </CardHeader>
          </Card>

          {/* Student and Parent Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations de l'élève</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Nom complet:</span>
                  <p className="font-semibold">{student.studentName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">ID Élève:</span>
                  <p className="font-semibold">{student.studentId}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Classe:</span>
                  <p className="font-semibold">{student.class}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">École:</span>
                  <p className="font-semibold">{student.school}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations du parent/tuteur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Nom:</span>
                  <p className="font-semibold">{student.parentName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{student.parentPhone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>parent@email.com</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fee Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détail des frais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-right p-3 font-medium">Montant</th>
                      <th className="text-center p-3 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3">Frais de scolarité</td>
                      <td className="p-3 text-right font-semibold">{formatCurrency(student.tuitionFee)}</td>
                      <td className="p-3 text-center">
                        <Badge className="bg-green-100 text-green-800">Inclus</Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Cantine</td>
                      <td className="p-3 text-right font-semibold">{formatCurrency(student.canteenFee)}</td>
                      <td className="p-3 text-center">
                        <Badge className="bg-green-100 text-green-800">Inclus</Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Transport</td>
                      <td className="p-3 text-right font-semibold">{formatCurrency(student.transportFee)}</td>
                      <td className="p-3 text-center">
                        <Badge className="bg-green-100 text-green-800">Inclus</Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Uniformes</td>
                      <td className="p-3 text-right font-semibold">{formatCurrency(student.uniformFee)}</td>
                      <td className="p-3 text-center">
                        <Badge className="bg-green-100 text-green-800">Inclus</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résumé des paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Total des frais:</span>
                  <span className="font-bold">{formatCurrency(student.totalFees)}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Montant payé:</span>
                  <span className="font-bold text-green-600">{formatCurrency(student.paidAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-xl">
                  <span className="font-bold">Solde restant:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${student.remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(student.remainingAmount)}
                    </span>
                    {getStatusBadge(student.paymentStatus)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {student.lastPaymentDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historique des paiements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Dernier paiement</span>
                      <p className="text-sm text-gray-600">
                        {new Date(student.lastPaymentDate).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <span className="font-semibold text-green-600">{formatCurrency(student.paidAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 print:text-xs">
            <p>Facture générée le {new Date().toLocaleDateString("fr-FR")}</p>
            <p>{student.school} - Système de Gestion Scolaire EduMali</p>
            <p>Pour toute question, contactez l'administration scolaire</p>
          </div>
        </div>

        <div className="flex justify-end pt-4 print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
