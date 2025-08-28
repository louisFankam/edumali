"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function PaymentHistoryModal({ isOpen, onClose, teacher, history }) {
  if (!teacher) return null

  // Filter history for this teacher
  const teacherHistory = history.filter((payment) => payment.teacherId === teacher.teacherId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Historique des paiements - {teacher.firstName} {teacher.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Total paiements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">{teacherHistory.length}</div>
                <p className="text-xs text-muted-foreground">Depuis le début</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Montant total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">
                  {teacherHistory.reduce((sum, payment) => sum + payment.netSalary, 0).toLocaleString()} F
                </div>
                <p className="text-xs text-muted-foreground">Cumulé</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Dernier paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">
                  {teacherHistory.length > 0
                    ? teacherHistory[0].netSalary.toLocaleString()
                    : teacher.netSalary.toLocaleString()}{" "}
                  F
                </div>
                <p className="text-xs text-muted-foreground">
                  {teacherHistory.length > 0
                    ? format(new Date(teacherHistory[0].paymentDate), "MMM yyyy", { locale: fr })
                    : "Actuel"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Historique détaillé</CardTitle>
            </CardHeader>
            <CardContent>
              {teacherHistory.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Période</TableHead>
                        <TableHead>Montant net</TableHead>
                        <TableHead>Date de paiement</TableHead>
                        <TableHead>Méthode</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teacherHistory.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {format(new Date(payment.month), "MMMM yyyy", { locale: fr })}
                          </TableCell>
                          <TableCell className="font-bold">{payment.netSalary.toLocaleString()} F</TableCell>
                          <TableCell>{format(new Date(payment.paymentDate), "dd MMM yyyy", { locale: fr })}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell>
                            <Badge className="bg-accent text-accent-foreground">Terminé</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucun historique de paiement disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
