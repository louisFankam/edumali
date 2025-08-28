"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, DollarSign, History, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const ITEMS_PER_PAGE = 10

export function SalariesTable({ salaries, onPaySalary, onViewPayroll, onViewHistory, selectedMonth }) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(salaries.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentSalaries = salaries.slice(startIndex, endIndex)

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Salaires - {format(selectedMonth, "MMMM yyyy", { locale: fr })} ({salaries.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professeur</TableHead>
                <TableHead>École</TableHead>
                <TableHead>Salaire de base</TableHead>
                <TableHead>Primes</TableHead>
                <TableHead>Déductions</TableHead>
                <TableHead>Net à payer</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de paiement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentSalaries.map((salary) => (
                <TableRow key={salary.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={salary.photo || "/placeholder.svg"}
                          alt={`${salary.firstName} ${salary.lastName}`}
                        />
                        <AvatarFallback>{getInitials(salary.firstName, salary.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {salary.firstName} {salary.lastName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-48 truncate">{salary.school}</TableCell>
                  <TableCell className="font-medium">{salary.baseSalary.toLocaleString()} F</TableCell>
                  <TableCell className="text-accent font-medium">+{salary.allowances.toLocaleString()} F</TableCell>
                  <TableCell className="text-destructive font-medium">
                    -{salary.deductions.toLocaleString()} F
                  </TableCell>
                  <TableCell className="font-bold text-lg">{salary.netSalary.toLocaleString()} F</TableCell>
                  <TableCell>{getStatusBadge(salary.paymentStatus)}</TableCell>
                  <TableCell>
                    {salary.paymentDate ? format(new Date(salary.paymentDate), "dd MMM yyyy", { locale: fr }) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewPayroll(salary)}
                        className="h-8 w-8 p-0"
                        title="Voir la fiche de paie"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewHistory(salary)}
                        className="h-8 w-8 p-0"
                        title="Voir l'historique"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      {salary.paymentStatus === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPaySalary(salary.id)}
                          className="h-8 w-8 p-0 text-accent hover:text-accent"
                          title="Marquer comme payé"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Affichage de {startIndex + 1} à {Math.min(endIndex, salaries.length)} sur {salaries.length} salaires
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "" : "bg-transparent"}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-transparent"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
