"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 10

export function TeachersTable({ teachers, onViewDetails, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(teachers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTeachers = teachers.slice(startIndex, endIndex)

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
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
                <TableHead>Âge</TableHead>
                <TableHead>Matières</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>École</TableHead>
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
                          src={teacher.photo || "/placeholder.svg"}
                          alt={`${teacher.firstName} ${teacher.lastName}`}
                        />
                        <AvatarFallback>{getInitials(teacher.firstName, teacher.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {teacher.firstName} {teacher.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">{teacher.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getAge(teacher.dateOfBirth)} ans</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.slice(0, 2).map((subject, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {teacher.subjects.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{teacher.subjects.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.slice(0, 2).map((classe, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {classe}
                        </Badge>
                      ))}
                      {teacher.classes.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{teacher.classes.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-48 truncate">{teacher.school}</TableCell>
                  <TableCell>{teacher.experience}</TableCell>
                  <TableCell>{teacher.salary.toLocaleString()} F</TableCell>
                  <TableCell>
                    <Badge variant={teacher.status === "Actif" ? "default" : "secondary"}>{teacher.status}</Badge>
                  </TableCell>
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
