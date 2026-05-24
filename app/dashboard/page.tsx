"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
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
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  RefreshCw
} from "lucide-react"

import Link from "next/link"
import { NotificationBellMain } from "@/components/notifications/notification-bell-main"
import { AlertsSection } from "@/components/alerts/alerts-section"

// Données en dur pour le mode front-only
const DASHBOARD_DATA = {
  students: {
    total: 450,
    growth: 5.2,
    newThisMonth: 12,
    byClass: [
      { name: "1ère Année", count: 45, capacity: 50, percentage: 90 },
      { name: "2ème Année", count: 42, capacity: 50, percentage: 84 },
      { name: "3ème Année", count: 48, capacity: 50, percentage: 96 },
      { name: "4ème Année", count: 40, capacity: 50, percentage: 80 },
    ]
  },
  attendance: {
    overall: 92,
    trend: 2.1,
    byClass: [
      { class: "1ère A", rate: 95, trend: 1.5 },
      { class: "2ème A", rate: 88, trend: -0.5 },
      { class: "3ème A", rate: 94, trend: 2.0 },
    ]
  },
  financial: {
    totalRevenue: 15000000,
    growth: 8.5,
    monthlyAverage: 1250000,
    outstandingPayments: 2000000
  },
  exams: {
    passRate: 78,
    averageScore: 14.5,
    topSubjects: [
      { subject: "Mathématiques", average: 15.2, students: 120 },
      { subject: "Français", average: 14.8, students: 120 },
      { subject: "Sciences", average: 16.0, students: 45 },
    ]
  }
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 500)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const data = DASHBOARD_DATA

  return (
    <AppLayout>
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
                title="Actualiser"
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
                <div className="text-2xl font-bold">{data.students.total}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{data.students.growth}%</span>
                  <span>vs mois dernier</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +{data.students.newThisMonth} nouveaux ce mois
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de présence</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.attendance.overall}%</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{data.attendance.trend}%</span>
                  <span>vs semaine dernière</span>
                </div>
                <Progress value={data.attendance.overall} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.financial.totalRevenue)}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{data.financial.growth}%</span>
                  <span>vs mois dernier</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Moyenne: {formatCurrency(data.financial.monthlyAverage)}/mois
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.exams.passRate}%</div>
                <div className="text-xs text-muted-foreground">
                  Moyenne: {data.exams.averageScore}/20
                </div>
                <Progress value={data.exams.passRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {data.exams.topSubjects.length} matières évaluées
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
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
                  {data.students.byClass.map((classData) => (
                    <div key={classData.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-red-600">{classData.name.substring(0,2)}</span>
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

            <AlertsSection />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Accès rapides</CardTitle>
              <CardDescription>Fonctions les plus utilisées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Inscription", sub: "Inscrire un élève", href: "/students/inscription", icon: GraduationCap, color: "bg-blue-100 text-blue-600" },
                  { title: "Saisir notes", sub: "Entrer les notes", href: "/notes/examen", icon: FileText, color: "bg-purple-100 text-purple-600" },
                  { title: "Emploi du temps", sub: "Gérer planning", href: "/planning/emploi-du-temps", icon: Clock, color: "bg-orange-100 text-orange-600" },
                  { title: "Finances", sub: "Gérer paiements", href: "/finances", icon: DollarSign, color: "bg-green-100 text-green-600" },
                ].map((item) => (
                  <Link href={item.href} key={item.title}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.sub}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </AppLayout>
  )
}
