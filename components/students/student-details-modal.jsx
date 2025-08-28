"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, MapPin, Phone, GraduationCap, Building2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function StudentDetailsModal({ isOpen, onClose, student }) {
  if (!student) return null

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

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profil de l'élève</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.photo || "/placeholder.svg"} alt={`${student.firstName} ${student.lastName}`} />
              <AvatarFallback className="text-lg">{getInitials(student.firstName, student.lastName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-serif font-bold">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-muted-foreground">
                {getAge(student.dateOfBirth)} ans • {student.gender}
              </p>
              <Badge variant={student.status === "Actif" ? "default" : "secondary"} className="mt-2">
                {student.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(student.dateOfBirth), "dd MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Genre</p>
                  <p>{student.gender}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {student.address}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* School Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Informations scolaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Classe</p>
                  <Badge variant="outline">{student.class}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date d'inscription</p>
                  <p>{format(new Date(student.enrollmentDate), "dd MMMM yyyy", { locale: fr })}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">École</p>
                <p className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  {student.school}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Parent Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations du parent/tuteur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                  <p>{student.parentName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {student.parentPhone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance académique</CardTitle>
              <CardDescription>Résultats et statistiques de l'élève</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-serif font-bold text-accent">87%</p>
                  <p className="text-sm text-muted-foreground">Moyenne générale</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-serif font-bold text-primary">94%</p>
                  <p className="text-sm text-muted-foreground">Taux de présence</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-serif font-bold text-secondary">3</p>
                  <p className="text-sm text-muted-foreground">Absences ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
