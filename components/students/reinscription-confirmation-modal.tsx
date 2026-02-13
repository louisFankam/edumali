"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Calendar, MapPin, Phone, GraduationCap, Building2, UserCheck, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { Class } from "@/hooks/use-classes"

interface ReinscriptionConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  student: {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    class: string
    classId: string
    parentName: string
    parentPhone: string
    address: string
    nationality: string
    previousAcademicYearId: string
    previousAcademicYearName: string
    previousStatus: string
    photo?: string
  }
  availableClasses: Class[]
  onConfirm: (selectedClassId: string) => Promise<void>
  isReinscribing: boolean
}

export function ReinscriptionConfirmationModal({ 
  isOpen, 
  onClose, 
  student, 
  availableClasses,
  onConfirm, 
  isReinscribing 
}: ReinscriptionConfirmationModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  
  useEffect(() => {
    console.log('Modal ouvert - classes disponibles:', availableClasses)
  }, [availableClasses, isOpen])

  const getAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const currentAcademicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`

  const handleConfirm = () => {
    if (selectedClassId) {
      onConfirm(selectedClassId)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>Confirmation de réinscription</span>
          </DialogTitle>
          <DialogDescription>
            Vérifiez les informations de l'élève avant de confirmer sa réinscription pour l'année académique {currentAcademicYear}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Carte d'information de l'élève */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={student.photo || (student.gender === "Masculin" ? "/homme.png" : "/femme.png")}
                    alt={`${student.firstName} ${student.lastName}`}
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials(student.firstName, student.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getAge(student.dateOfBirth)} ans • {student.gender}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Classe précédente:</strong> {student.class}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Année précédente:</strong> {student.previousAcademicYearName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Nationalité:</strong> {student.nationality || '-'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Téléphone parent:</strong> {student.parentPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Adresse:</strong> {student.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Statut précédent:</strong> 
                      <Badge variant="outline" className="ml-2">
                        {student.previousStatus === "active" ? "Actif" :
                         student.previousStatus === "graduated" ? "Diplômé" :
                         student.previousStatus === "transferred" ? "Transféré" : "Inactif"}
                      </Badge>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte de réinscription */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <UserCheck className="h-5 w-5" />
                <span>Détails de la réinscription</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-800">Année académique actuelle</p>
                    <Badge variant="default" className="bg-green-600 text-white mt-1">
                      {currentAcademicYear}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Date de réinscription</p>
                    <p className="text-sm text-green-700 mt-1">
                      {format(new Date(), "dd MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                </div>
                
                {/* Sélecteur de classe */}
                <div className="space-y-2">
                  <Label htmlFor="newClass" className="text-sm font-medium text-green-800">
                    Nouvelle classe *
                  </Label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger id="newClass" className="bg-white">
                      <SelectValue placeholder="Sélectionnez la nouvelle classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClasses.length === 0 ? (
                        <SelectItem value="loading" disabled>Aucune classe disponible</SelectItem>
                      ) : (
                        <>
                          {availableClasses.map((classItem) => (
                            <SelectItem key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedClassId && (
                    <p className="text-sm text-green-700">
                      L'élève sera réinscrit dans la classe: {availableClasses.find(c => c.id === selectedClassId)?.name}
                    </p>
                  )}
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Cette action créera un nouvel enregistrement pour {student.firstName} {student.lastName} 
                    {" "} dans l'année académique {currentAcademicYear}. Les données de l'année précédente seront conservées dans l'historique.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isReinscribing}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedClassId || isReinscribing}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              {isReinscribing ? "Réinscription en cours..." : "Confirmer la réinscription"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}