"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

export function AddFeeModal({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    studentId: "",
    feeType: "",
    amount: "",
    dueDate: "",
    description: "",
    paymentMethod: "",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    console.log("Nouveau frais ajouté:", formData)
    onOpenChange(false)
    setFormData({
      studentId: "",
      feeType: "",
      amount: "",
      dueDate: "",
      description: "",
      paymentMethod: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Ajouter des frais</span>
          </DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle>Informations sur les frais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentId">ID Élève *</Label>
                <Input
                  id="studentId"
                  placeholder="EPB-2024-001"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange("studentId", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="feeType">Type de frais *</Label>
                <Select value={formData.feeType} onValueChange={(value) => handleInputChange("feeType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Frais de scolarité</SelectItem>
                    <SelectItem value="canteen">Cantine</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="uniform">Uniformes</SelectItem>
                    <SelectItem value="books">Manuels scolaires</SelectItem>
                    <SelectItem value="activities">Activités extra-scolaires</SelectItem>
                    <SelectItem value="exam">Frais d'examen</SelectItem>
                    <SelectItem value="other">Autres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Montant (FCFA) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="150000"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Date d'échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description détaillée des frais..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Mode de paiement préféré</Label>
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
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Ajouter les frais</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
