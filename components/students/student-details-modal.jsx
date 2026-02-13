"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { User, Calendar, MapPin, Phone, GraduationCap, Building2, UserCheck } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useEffect, useState } from "react"
import { useSchoolInfo } from '@/hooks/use-school-info'
import { getApiUrl, getAuthToken } from "@/lib/pocketbase"

export function StudentDetailsModal({ isOpen, onClose, student, onReinscribe, isReinscribing = false }) {
  const { schoolInfo } = useSchoolInfo()
  const [academicData, setAcademicData] = useState({
    generalAverage: null,
    attendanceRate: null,
    monthlyAbsences: null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && student?.id) {
      fetchAcademicData()
    }
  }, [isOpen, student])

  const fetchAcademicData = async () => {
    if (!student?.id) return

    setLoading(true)
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      // Récupérer la moyenne générale depuis les bulletins
      const reportCardsResponse = await fetch(
        getApiUrl(`collections/edumali_report_cards/records?filter=student_id="${student.id}"&sort=-created`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!reportCardsResponse.ok) {
        throw new Error('Erreur lors de la récupération des bulletins')
      }

      const reportCardsData = await reportCardsResponse.json()
      const reportCards = reportCardsData.items

      let generalAverage = null
      if (reportCards.length > 0) {
        // Prendre la moyenne du dernier bulletin
        generalAverage = reportCards[0].general_average
      } else {
        // Calculer manuellement la moyenne si pas de bulletin
        const gradesResponse = await fetch(
          getApiUrl(`collections/edumali_grades/records?filter=student_id="${student.id}"&expand=exam_id&perPage=500`),
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (!gradesResponse.ok) {
          throw new Error('Erreur lors de la récupération des notes')
        }

        const gradesData = await gradesResponse.json()
        const grades = gradesData.items

        if (grades.length > 0) {
          let totalWeighted = 0
          let totalCoefficient = 0

          grades.forEach(grade => {
            const exam = grade.expand?.exam_id
            if (exam) {
              totalWeighted += grade.score * exam.coefficient
              totalCoefficient += exam.coefficient
            }
          })

          if (totalCoefficient > 0) {
            generalAverage = (totalWeighted / totalCoefficient).toFixed(2)
          }
        }
      }

      // Calculer le taux de présence
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const startOfMonthStr = startOfMonth.toISOString().split('T')[0]

      const attendanceResponse = await fetch(
        getApiUrl(`collections/edumali_attendance/records?filter=student_id="${student.id}" && date >= "${startOfMonthStr}"&perPage=500`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!attendanceResponse.ok) {
        throw new Error('Erreur lors de la récupération des présences')
      }

      const attendanceData = await attendanceResponse.json()
      const attendanceRecords = attendanceData.items
      
      let presentDays = 0
      let totalDays = 0
      let monthlyAbsences = 0
      
      attendanceRecords.forEach(record => {
        totalDays++
        if (record.status === 'present') {
          presentDays++
        } else if (record.status === 'absent') {
          monthlyAbsences++
        }
      })
      
      const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(0) : null
      
      setAcademicData({
        generalAverage,
        attendanceRate,
        monthlyAbsences
      })
    } catch (error) {
      console.error("Erreur lors du chargement des données académiques:", error)
      // Optionnel: afficher un message d'erreur à l'utilisateur
    } finally {
      setLoading(false)
    }
  }

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
              <AvatarImage src={student.photo || (student.gender === "Masculin" ? "/homme.png" : "/femme.png")} alt={`${student.firstName} ${student.lastName}`} />
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
                <p className="text-sm font-medium text-muted-foreground">Nationalité</p>
                <p>{student.nationality || '-'}</p>
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
                  {schoolInfo ? schoolInfo.name : '-'}
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
              {loading ? (
                <div className="text-center py-4">Chargement des données...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-serif font-bold text-accent">
                      {academicData.generalAverage !== null ? `${academicData.generalAverage}%` : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Moyenne générale</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-serif font-bold text-primary">
                      {academicData.attendanceRate !== null ? `${academicData.attendanceRate}%` : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Taux de présence</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-serif font-bold text-secondary">
                      {academicData.monthlyAbsences !== null ? academicData.monthlyAbsences : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Absences ce mois</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Bouton de réinscription */}
          {onReinscribe && (
            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={onReinscribe} 
                disabled={isReinscribing}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                {isReinscribing ? "Réinscription en cours..." : "Réinscrire l'élève"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}