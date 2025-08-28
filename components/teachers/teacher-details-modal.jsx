"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, MapPin, Phone, Mail, GraduationCap, Building2, DollarSign, Award } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function TeacherDetailsModal({ isOpen, onClose, teacher }) {
  if (!teacher) return null

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

  const getYearsOfService = (hireDate) => {
    const today = new Date()
    const hire = new Date(hireDate)
    return today.getFullYear() - hire.getFullYear()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profil du professeur</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Teacher Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={teacher.photo || "/placeholder.svg"} alt={`${teacher.firstName} ${teacher.lastName}`} />
              <AvatarFallback className="text-lg">{getInitials(teacher.firstName, teacher.lastName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-serif font-bold">
                {teacher.firstName} {teacher.lastName}
              </h2>
              <p className="text-muted-foreground">
                {getAge(teacher.dateOfBirth)} ans • {teacher.gender}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={teacher.status === "Actif" ? "default" : "secondary"}>{teacher.status}</Badge>
                <Badge variant="outline">{getYearsOfService(teacher.hireDate)} ans de service</Badge>
              </div>
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
                    {format(new Date(teacher.dateOfBirth), "dd MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Genre</p>
                  <p>{teacher.gender}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {teacher.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {teacher.email}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {teacher.address}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Informations professionnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">École</p>
                  <p className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    {teacher.school}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date d'embauche</p>
                  <p>{format(new Date(teacher.hireDate), "dd MMMM yyyy", { locale: fr })}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Qualification</p>
                  <p className="flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    {teacher.qualification}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expérience</p>
                  <p>{teacher.experience}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Salaire mensuel</p>
                <p className="flex items-center text-lg font-medium">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {teacher.salary.toLocaleString()} FCFA
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Teaching Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Matières enseignées</CardTitle>
                <CardDescription>Disciplines académiques</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects.map((subject, index) => (
                    <Badge key={index} variant="outline">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classes enseignées</CardTitle>
                <CardDescription>Niveaux scolaires</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {teacher.classes.map((classe, index) => (
                    <Badge key={index} variant="secondary">
                      {classe}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques de performance</CardTitle>
              <CardDescription>Indicateurs de performance du professeur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-serif font-bold text-accent">96%</p>
                  <p className="text-sm text-muted-foreground">Taux de présence</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-serif font-bold text-primary">4.8/5</p>
                  <p className="text-sm text-muted-foreground">Évaluation</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-serif font-bold text-secondary">89%</p>
                  <p className="text-sm text-muted-foreground">Réussite élèves</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-serif font-bold text-accent">12</p>
                  <p className="text-sm text-muted-foreground">Formations suivies</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
