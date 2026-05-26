"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Play, Edit, Trash2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function SchoolYearsTable({ schoolYears, onActivate, onDelete, onViewDetails, onEdit, isLoading = false }) {
  const getStatusBadge = (isCurrent) => {
    return isCurrent
      ? <Badge className="bg-primary text-primary-foreground">Active</Badge>
      : <Badge variant="outline">Inactive</Badge>
  }

  const sortedSchoolYears = [...schoolYears].sort((a, b) => {
    if (a.isCurrent !== b.isCurrent) {
      return a.isCurrent ? -1 : 1
    }
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement des années scolaires...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Toutes les années scolaires ({schoolYears.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Année scolaire</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSchoolYears.map((schoolYear) => (
                <TableRow key={schoolYear.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{schoolYear.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(schoolYear.startDate), "dd MMM yyyy", { locale: fr })}</div>
                      <div className="text-muted-foreground">
                        au {format(new Date(schoolYear.endDate), "dd MMM yyyy", { locale: fr })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(schoolYear.isCurrent)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(schoolYear)}
                        className="h-8 w-8 p-0"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(schoolYear)}
                        className="h-8 w-8 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                        title="Modifier cette année"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!schoolYear.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onActivate(schoolYear.id)}
                          className="h-8 w-8 p-0 text-primary hover:text-primary"
                          title="Activer cette année"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(schoolYear)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Supprimer cette année"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
