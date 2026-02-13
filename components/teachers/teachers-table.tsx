"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, User } from "lucide-react"

interface Teacher {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  address: string
  hire_date: string
  salary: number
  status: "active" | "inactive" | "on_leave"
  photo: string
  user_id: string
  gender: "Masculin" | "Feminin"
  contrat: "horaire" | "mensuel"
  speciality: string[]
  speciality_names: string[]
  created: string
  updated: string
}

interface TeachersTableProps {
  teachers: Teacher[]
  isLoading?: boolean
  error?: string | null
  onViewDetails: (teacher: Teacher) => void
  onEdit: (teacher: Teacher) => void
  onDelete: (teacherId: string) => void
}

const ITEMS_PER_PAGE = 10

export function TeachersTable({ teachers, isLoading = false, error = null, onViewDetails, onEdit, onDelete }: TeachersTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(teachers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTeachers = teachers.slice(startIndex, endIndex)

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return "??"
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getExperienceYears = (hireDate: string) => {
    const today = new Date()
    const hireDateObj = new Date(hireDate)
    let years = today.getFullYear() - hireDateObj.getFullYear()
    const monthDiff = today.getMonth() - hireDateObj.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hireDateObj.getDate())) {
      years--
    }
    return `${years} ans`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Actif</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactif</Badge>
      case "on_leave":
        return <Badge variant="outline">En congé</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des professeurs...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">Erreur: {error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (teachers.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun professeur trouvé</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des professeurs ({teachers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professeur</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Spécialité(s)</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Expérience</TableHead>
                <TableHead>Salaire</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={teacher.photo || teacher.gender === "Masculin" ? "/homme.png" : "/femme.png"}
                          alt={`${teacher.first_name} ${teacher.last_name}`}
                        />
                        <AvatarFallback>{getInitials(teacher.first_name, teacher.last_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {teacher.first_name} {teacher.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">{teacher.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={teacher.gender === "Masculin" ? "default" : "secondary"} className="text-xs">
                      {teacher.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.speciality_names.slice(0, 2).map((subject, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {teacher.speciality_names.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{teacher.speciality_names.length - 2}
                        </Badge>
                      )}
                      {teacher.speciality_names.length === 0 && (
                        <span className="text-muted-foreground text-sm">Non définie</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{teacher.phone}</div>
                      <div className="text-muted-foreground">{teacher.address}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getExperienceYears(teacher.hire_date)}</TableCell>
                  <TableCell>{teacher.salary.toLocaleString('fr-FR')} FCFA</TableCell>
                  <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => onViewDetails(teacher)} className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(teacher)} className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(teacher.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Affichage de {startIndex + 1} à {Math.min(endIndex, teachers.length)} sur {teachers.length} professeurs
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
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "" : "bg-transparent"}
                    >
                      {page}
                    </Button>
                  )
                })}
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