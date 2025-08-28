"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Plus, Minus, Download } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function PayrollModal({ isOpen, onClose, teacher }) {
  if (!teacher) return null

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-accent text-accent-foreground">Payé</Badge>
      case "pending":
        return <Badge variant="secondary">En attente</Badge>
      case "processing":
        return <Badge variant="outline">En traitement</Badge>
      default:
        return null
    }
  }

  // Mock detailed breakdown
  const salaryBreakdown = {
    baseSalary: teacher.baseSalary,
    allowances: {
      transport: 15000,
      housing: 10000,
      total: teacher.allowances,
    },
    deductions: {
      tax: 8000,
      insurance: 5000,
      pension: 2000,
      total: teacher.deductions,
    },
    netSalary: teacher.netSalary,
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fiche de paie</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={teacher.photo || "/placeholder.svg"}
                  alt={`${teacher.firstName} ${teacher.lastName}`}
                />
                <AvatarFallback>{getInitials(teacher.firstName, teacher.lastName)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-serif font-bold">
                  {teacher.firstName} {teacher.lastName}
                </h2>
                <p className="text-muted-foreground">{teacher.school}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Période</p>
              <p className="font-medium">{format(new Date(teacher.month), "MMMM yyyy", { locale: fr })}</p>
              {getStatusBadge(teacher.paymentStatus)}
            </div>
          </div>

          <Separator />

          {/* Salary Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Earnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Gains
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Salaire de base</span>
                  <span className="font-medium">{salaryBreakdown.baseSalary.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between">
                  <span>Prime de transport</span>
                  <span className="font-medium">{salaryBreakdown.allowances.transport.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between">
                  <span>Prime de logement</span>
                  <span className="font-medium">{salaryBreakdown.allowances.housing.toLocaleString()} F</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-accent">
                  <span>Total gains</span>
                  <span>{(salaryBreakdown.baseSalary + salaryBreakdown.allowances.total).toLocaleString()} F</span>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <Minus className="h-4 w-4 mr-2" />
                  Déductions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Impôt sur le revenu</span>
                  <span className="font-medium">{salaryBreakdown.deductions.tax.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between">
                  <span>Assurance maladie</span>
                  <span className="font-medium">{salaryBreakdown.deductions.insurance.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between">
                  <span>Cotisation retraite</span>
                  <span className="font-medium">{salaryBreakdown.deductions.pension.toLocaleString()} F</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-destructive">
                  <span>Total déductions</span>
                  <span>{salaryBreakdown.deductions.total.toLocaleString()} F</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Net Salary */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <DollarSign className="h-4 w-4 mr-2" />
                Salaire net à payer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-serif font-bold text-primary mb-2">
                  {salaryBreakdown.netSalary.toLocaleString()} F CFA
                </div>
                {teacher.paymentDate && (
                  <p className="text-sm text-muted-foreground">
                    Payé le {format(new Date(teacher.paymentDate), "dd MMMM yyyy", { locale: fr })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
