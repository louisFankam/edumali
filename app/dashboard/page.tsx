"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  GraduationCap,
  Users,
  FileText,
  Clock,
  Settings,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  RefreshCw
} from "lucide-react"

import Link from "next/link"
import { NotificationBellMain } from "@/components/notifications/notification-bell-main"

// Données mock pour les graphiques
const studentData = {
  total: 187,
  newThisMonth: 12,
  growth: 6.8,
  byClass: [
    { class: "CP", count: 28, capacity: 30, percentage: 93 },
    { class: "CE1", count: 25, capacity: 30, percentage: 83 },
    { class: "CE2", count: 27, capacity: 30, percentage: 90 },
    { class: "CM1", count: 26, capacity: 30, percentage: 87 },
    { class: "CM2", count: 29, capacity: 30, percentage: 97 },
    { class: "6ème", count: 32, capacity: 35, percentage: 91 }
  ]
}

const attendanceData = {
  overall: 94,
  trend: 2.1,
  byClass: [
    { class: "CP", rate: 96, trend: 1.2 },
    { class: "CE1", rate: 93, trend: -0.5 },
    { class: "CE2", rate: 95, trend: 2.3 },
    { class: "CM1", rate: 92, trend: -1.1 },
    { class: "CM2", rate: 97, trend: 3.2 },
    { class: "6ème", rate: 91, trend: 0.8 }
  ]
}

const financialData = {
  totalRevenue: 45000000, // 45M FCFA
  monthlyAverage: 3750000, // 3.75M FCFA
  growth: 8.5,
  outstandingPayments: 3200000, // 3.2M FCFA
  paymentRate: 87
}

const examData = {
  averageScore: 14.2,
  passRate: 78,
  topSubjects: [
    { subject: "Mathématiques", average: 15.8, students: 156 },
    { subject: "Français", average: 14.5, students: 156 },
    { subject: "Sciences", average: 13.9, students: 156 },
    { subject: "Histoire-Géo", average: 13.2, students: 156 }
  ]
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [isLoading, setIsLoading] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <PageHeader
              title="Tableau de bord"
              description="Vue d'ensemble de l'établissement scolaire"
            >
              <NotificationBellMain />
            </PageHeader>
            <div className="flex items-center space-x-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Statistiques principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Élèves</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentData.total}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {studentData.growth > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={studentData.growth > 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(studentData.growth)}%
                  </span>
                  <span>vs mois dernier</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +{studentData.newThisMonth} nouveaux ce mois
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de présence</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceData.overall}%</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {attendanceData.trend > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={attendanceData.trend > 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(attendanceData.trend)}%
                  </span>
                  <span>vs semaine dernière</span>
                </div>
                <Progress value={attendanceData.overall} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(financialData.totalRevenue)}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {financialData.growth > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={financialData.growth > 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(financialData.growth)}%
                  </span>
                  <span>vs mois dernier</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Moyenne: {formatCurrency(financialData.monthlyAverage)}/mois
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{examData.passRate}%</div>
                <div className="text-xs text-muted-foreground">
                  Moyenne: {examData.averageScore}/20
                </div>
                <Progress value={examData.passRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {examData.topSubjects.length} matières évaluées
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques et analyses détaillées */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Répartition par classe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Répartition par classe
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir détails
                  </Button>
                </CardTitle>
                <CardDescription>Effectifs et taux d'occupation par classe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentData.byClass.map((classData) => (
                    <div key={classData.class} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-red-600">{classData.class}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{classData.count}/{classData.capacity}</p>
                          <p className="text-xs text-muted-foreground">élèves</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{classData.percentage}%</p>
                        <Progress value={classData.percentage} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Taux de présence par classe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Présence par classe
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </CardTitle>
                <CardDescription>Taux de présence hebdomadaire</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendanceData.byClass.map((classData) => (
                    <div key={classData.class} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{classData.class}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{classData.rate}%</p>
                          <div className="flex items-center space-x-1">
                            {classData.trend > 0 ? (
                              <ArrowUpRight className="h-3 w-3 text-green-500" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-500" />
                            )}
                            <span className={`text-xs ${classData.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                              {Math.abs(classData.trend)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <Progress value={classData.rate} className="w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Meilleures matières */}
            <Card>
              <CardHeader>
                <CardTitle>Meilleures matières</CardTitle>
                <CardDescription>Moyennes par matière</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {examData.topSubjects.map((subject, index) => (
                    <div key={subject.subject} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-green-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{subject.subject}</p>
                          <p className="text-xs text-muted-foreground">{subject.students} élèves</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{subject.average}/20</p>
                        <Badge variant="secondary" className="text-xs">
                          {subject.average >= 15 ? "Excellent" : subject.average >= 12 ? "Bon" : "Moyen"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alertes et actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Alertes importantes</CardTitle>
                <CardDescription>Actions requises</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">Paiements en retard</p>
                      <p className="text-xs text-red-600">{formatCurrency(financialData.outstandingPayments)} à récupérer</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                      Voir
                    </Button>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-800">Absences non justifiées</p>
                      <p className="text-xs text-orange-600">3 élèves absents depuis 3+ jours</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">
                      Voir
                    </Button>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">Examens à venir</p>
                      <p className="text-xs text-blue-600">2 examens cette semaine</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
                      Voir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accès rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Accès rapides</CardTitle>
              <CardDescription>Fonctions les plus utilisées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/students/inscription">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Nouvelle inscription</p>
                          <p className="text-sm text-muted-foreground">Inscrire un élève</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/notes/examen">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Saisir notes</p>
                          <p className="text-sm text-muted-foreground">Entrer les notes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/planning/emploi-du-temps">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">Emploi du temps</p>
                          <p className="text-sm text-muted-foreground">Gérer planning</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/finances">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Finances</p>
                          <p className="text-sm text-muted-foreground">Gérer paiements</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
