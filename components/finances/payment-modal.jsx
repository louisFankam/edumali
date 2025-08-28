"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, User } from "lucide-react"

export function PaymentModal({ open, onOpenChange, student }) {
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "",
    reference: "",
    notes: "",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    console.log("Paiement enregistré:", { student: student?.studentName, ...formData })
    onOpenChange(false)
    setFormData({
      amount: "",
      paymentMethod: "",
      reference: "",
      notes: "",
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  }

  if (!student) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Enregistrer un paiement</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Informations de l'élève</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Nom:</span>
                  <p className="font-semibold">{student.studentName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">ID:</span>
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
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé financier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{formatCurrency(student.totalFees)}</div>
                  <div className="text-sm text-gray-600">Total des frais</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{formatCurrency(student.paidAmount)}</div>
                  <div className="text-sm text-gray-600">Déjà payé</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{formatCurrency(student.remainingAmount)}</div>
                  <div className="text-sm text-gray-600">Reste à payer</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Détails du paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Montant à payer (FCFA) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder={student.remainingAmount.toString()}
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                  />
                  <div className="mt-1 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange("amount", student.remainingAmount.toString())}
                    >
                      Solde complet
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange("amount", Math.floor(student.remainingAmount / 2).toString())}
                    >
                      50%
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Mode de paiement *</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => handleInputChange("paymentMethod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="mobile">Mobile Money</SelectItem>
                      <SelectItem value="bank">Virement bancaire</SelectItem>
                      <SelectItem value="check">Chèque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="reference">Référence de transaction</Label>
                <Input
                  id="reference"
                  placeholder="Numéro de référence ou de transaction"
                  value={formData.reference}
                  onChange={(e) => handleInputChange("reference", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Notes additionnelles sur le paiement..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.amount || !formData.paymentMethod}>
            Enregistrer le paiement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
