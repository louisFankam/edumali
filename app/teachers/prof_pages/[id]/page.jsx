"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EditTeacherProfileModal } from "@/components/teachers/edit-teacher-profile-modal"
import {
  User,
  GraduationCap,
  BookOpen,
  Clock,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Download,
  Award,
  Building,
} from "lucide-react"

// Mock detailed teacher data
const getTeacherById = (id) => {
  const teachers = {
    1: {
      id: 1,
      firstName: "Amadou",
      lastName: "Diallo",
      fullName: "Amadou Diallo",
      dateOfBirth: "1985-06-15",
      gender: "Masculin",
      nationality: "Malienne",
      teacherId: "PROF-2024-001",
      hireDate: "2020-09-01",
      status: "Actif",
      photo: "/teacher-avatar.png",

      // Contact Info
      contactInfo: {
        phone: "+223 76 54 32 10",
        email: "amadou.diallo@school.edu.ml",
        emergencyContact: "Fatoumata Diallo (+223 65 43 21 87)",
        address: {
          street: "Rue 123, Porte 45",
          neighborhood: "Badalabougou",
          city: "Bamako",
          region: "District de Bamako",
        },
      },

      // Qualifications
      qualifications: {
        degrees: [
          {
            degree: "Master en Mathématiques",
            institution: "Université de Bamako",
            year: "2010",
            grade: "Mention Bien",
          },
          {
            degree: "Licence en Mathématiques",
            institution: "Université de Bamako",
            year: "2008",
            grade: "Mention Assez Bien",
          },
        ],
        certifications: [
          "Certificat d'Aptitude Pédagogique",
          "Formation en Pédagogie Moderne",
          "Certification TIC en Éducation",
        ],
        languages: ["Français", "Bambara", "Anglais (niveau intermédiaire)"],
      },

      // Teaching Info
      teachingInfo: {
        subjects: ["Mathématiques", "Physique"],
        classes: ["6ème A", "6ème B", "5ème A"],
        schools: ["Collège Soundiata", "Lycée Askia Mohamed"],
        experience: "15 ans",
        specialization: "Mathématiques et Sciences",
        teachingLoad: "18 heures/semaine",
      },

      // Schedule & Availability
      schedule: {
        availability: [
          { day: "Lundi", hours: "8h-12h, 14h-17h", classes: ["6ème A", "5ème A"] },
          { day: "Mardi", hours: "8h-12h", classes: ["6ème B"] },
          { day: "Mercredi", hours: "8h-12h, 14h-16h", classes: ["6ème A", "6ème B"] },
          { day: "Jeudi", hours: "8h-12h, 14h-17h", classes: ["5ème A", "6ème A"] },
          { day: "Vendredi", hours: "8h-12h", classes: ["6ème B", "5ème A"] },
        ],
        totalHours: 18,
        attendanceRate: "98%",
      },

      // Performance
      performance: {
        studentSatisfaction: "4.8/5",
        classResults: "85% de réussite moyenne",
        punctuality: "Excellent",
        collaboration: "Très bon",
        lastEvaluation: "2024-01-15",
        evaluationScore: "18/20",
      },

      // Financial Info
      financialInfo: {
        baseSalary: "450,000 FCFA",
        allowances: "50,000 FCFA",
        totalSalary: "500,000 FCFA",
        paymentStatus: "À jour",
        contractType: "CDI",
      },
    },
  }

  return teachers[id] || null
}

export default function TeacherProfilePage() {
  const params = useParams()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const teacher = getTeacherById(params.id)

  if (!teacher) {
    return <div>Enseignant non trouvé</div>
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      Actif: "bg-green-100 text-green-800",
      Inactif: "bg-red-100 text-red-800",
      Congé: "bg-yellow-100 text-yellow-800",
    }
    return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title={`Profil de ${teacher.fullName}`}
            description={`${teacher.teachingInfo.specialization} - ${teacher.teachingInfo.experience} d'expérience`}
          >
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button onClick={() => setIsEditModalOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </div>
          </PageHeader>

          {/* Teacher Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={teacher.photo || "/placeholder.svg"} alt={teacher.fullName} />
                  <AvatarFallback className="text-lg">
                    {teacher.firstName[0]}
                    {teacher.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{teacher.fullName}</h2>
                      <p className="text-gray-600">ID: {teacher.teacherId}</p>
                    </div>
                    {getStatusBadge(teacher.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span>{teacher.teachingInfo.subjects.join(", ")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Embauché le {new Date(teacher.hireDate).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{teacher.contactInfo.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
              <TabsTrigger value="teaching">Enseignement</TabsTrigger>
              <TabsTrigger value="schedule">Emploi du temps</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="financial">Financier</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Informations personnelles</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Prénom</span>
                        <p className="text-gray-900">{teacher.firstName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Nom</span>
                        <p className="text-gray-900">{teacher.lastName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Date de naissance</span>
                        <p className="text-gray-900">{new Date(teacher.dateOfBirth).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Sexe</span>
                        <p className="text-gray-900">{teacher.gender}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Nationalité</span>
                        <p className="text-gray-900">{teacher.nationality}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Date d'embauche</span>
                        <p className="text-gray-900">{new Date(teacher.hireDate).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Contact</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{teacher.contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{teacher.contactInfo.email}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Contact d'urgence</span>
                      <p className="text-gray-900">{teacher.contactInfo.emergencyContact}</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-gray-900">{teacher.contactInfo.address.street}</p>
                        <p className="text-gray-600 text-sm">
                          {teacher.contactInfo.address.neighborhood}, {teacher.contactInfo.address.city}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="qualifications" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>Diplômes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {teacher.qualifications.degrees.map((degree, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <h4 className="font-medium text-gray-900">{degree.degree}</h4>
                        <p className="text-sm text-gray-600">{degree.institution}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-500">{degree.year}</span>
                          <Badge variant="outline">{degree.grade}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-4 w-4" />
                      <span>Certifications & Langues</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Certifications</h4>
                      <div className="space-y-2">
                        {teacher.qualifications.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-2">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Langues</h4>
                      <div className="space-y-2">
                        {teacher.qualifications.languages.map((lang, index) => (
                          <Badge key={index} variant="secondary" className="mr-2 mb-2">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="teaching" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Matières enseignées</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Matières principales</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {teacher.teachingInfo.subjects.map((subject, index) => (
                          <Badge key={index} className="bg-primary/10 text-primary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Spécialisation</span>
                      <p className="text-gray-900">{teacher.teachingInfo.specialization}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Expérience</span>
                      <p className="text-gray-900">{teacher.teachingInfo.experience}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Charge horaire</span>
                      <p className="text-gray-900">{teacher.teachingInfo.teachingLoad}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Classes & Établissements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Classes assignées</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {teacher.teachingInfo.classes.map((classe, index) => (
                          <Badge key={index} variant="outline">
                            {classe}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Établissements</span>
                      <div className="space-y-2 mt-1">
                        {teacher.teachingInfo.schools.map((school, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900">{school}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Emploi du temps</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teacher.schedule.availability.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{day.day}</h4>
                          <p className="text-sm text-gray-600">{day.hours}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {day.classes.map((classe, classIndex) => (
                            <Badge key={classIndex} variant="outline" className="text-xs">
                              {classe}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Total heures/semaine</span>
                      <p className="text-lg font-semibold text-gray-900">{teacher.schedule.totalHours}h</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Taux de présence</span>
                      <p className="text-lg font-semibold text-green-600">{teacher.schedule.attendanceRate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>Évaluation de performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Satisfaction des élèves</span>
                        <p className="text-lg font-semibold text-gray-900">{teacher.performance.studentSatisfaction}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Résultats des classes</span>
                        <p className="text-gray-900">{teacher.performance.classResults}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Ponctualité</span>
                        <Badge className="bg-green-100 text-green-800 ml-2">{teacher.performance.punctuality}</Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Collaboration</span>
                        <Badge className="bg-blue-100 text-blue-800 ml-2">{teacher.performance.collaboration}</Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Dernière évaluation</span>
                        <p className="text-gray-900">
                          {new Date(teacher.performance.lastEvaluation).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Score d'évaluation</span>
                        <p className="text-lg font-semibold text-primary">{teacher.performance.evaluationScore}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations salariales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Salaire de base</span>
                        <p className="text-lg font-semibold text-gray-900">{teacher.financialInfo.baseSalary}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Indemnités</span>
                        <p className="text-gray-900">{teacher.financialInfo.allowances}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Salaire total</span>
                        <p className="text-xl font-bold text-primary">{teacher.financialInfo.totalSalary}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Type de contrat</span>
                        <Badge className="bg-blue-100 text-blue-800 ml-2">{teacher.financialInfo.contractType}</Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Statut de paiement</span>
                        <Badge className="bg-green-100 text-green-800 ml-2">
                          {teacher.financialInfo.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <EditTeacherProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            teacher={teacher}
          />
        </div>
      </main>
    </div>
  )
}
