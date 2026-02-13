"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Play, Archive, Calendar, Edit } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function SchoolYearsTable({ schoolYears, yearTotals, onActivate, onArchive, onViewDetails, onEdit, isLoading = false }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-primary text-primary-foreground">Active</Badge>
      case "upcoming":
        return <Badge variant="secondary">À venir</Badge>
      case "archived":
        return <Badge variant="outline">Archivée</Badge>
      default:
        return null
    }
  }

  const sortedSchoolYears = [...schoolYears].sort((a, b) => {
    // Sort by status priority (active > upcoming > archived) then by start date
    const statusPriority = { active: 3, upcoming: 2, archived: 1 }
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[b.status] - statusPriority[a.status]
    }
    return new Date(b.startDate) - new Date(a.startDate)
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
                <TableHead>Élèves</TableHead>
                <TableHead>Professeurs</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSchoolYears.map((schoolYear) => {
                const totals = yearTotals?.[schoolYear.id] || { students: 0, teachers: 0 }
                return (
                  <TableRow key={schoolYear.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{schoolYear.year}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(schoolYear.start_date), "dd MMM yyyy", { locale: fr })}</div>
                        <div className="text-muted-foreground">
                          au {format(new Date(schoolYear.end_date), "dd MMM yyyy", { locale: fr })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{totals.students.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{totals.teachers}</TableCell>
                  <TableCell>{getStatusBadge(schoolYear.status)}</TableCell>
                  <TableCell>
                    {schoolYear.created 
                      ? format(new Date(schoolYear.created), "dd MMM yyyy", { locale: fr }) 
                      : "N/A"
                    }
                  </TableCell>
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
                      {schoolYear.status === "upcoming" && (
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
                      {schoolYear.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onArchive(schoolYear)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-muted-foreground"
                          title="Archiver cette année"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
