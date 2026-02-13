"use client"

import { useState, useEffect } from "react"
import { AcademicYear } from "@/hooks/use-academic-years"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { SchoolYearsTable } from "@/components/school-years/school-years-table"
import { CreateSchoolYearModal } from "@/components/school-years/create-school-year-modal"
import { EditSchoolYearModal } from "@/components/school-years/edit-school-year-modal"
import { SchoolYearDetailsModal } from "@/components/school-years/school-year-details-modal"
import { ArchiveModal } from "@/components/school-years/archive-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Archive, TrendingUp } from "lucide-react"
import { useAcademicYears } from "@/hooks/use-academic-years"

export default function SchoolYearsPage() {
  const {
    academicYears,
    isLoading,
    error,
    createAcademicYear,
    updateAcademicYear,
    activateAcademicYear,
    archiveAcademicYear,
    getActiveAcademicYear,
    calculateTotals,
    getStats,
  } = useAcademicYears()

  const [selectedSchoolYear, setSelectedSchoolYear] = useState<AcademicYear | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
  const [yearTotals, setYearTotals] = useState<{[key: string]: {students: number, teachers: number}}>({})

  const handleCreateSchoolYear = async (newSchoolYear: Omit<AcademicYear, 'id' | 'created' | 'updated'>) => {
    const success = await createAcademicYear(newSchoolYear)
    if (success) {
      setIsCreateModalOpen(false)
    }
  }

  const handleActivateSchoolYear = async (schoolYearId: string) => {
    await activateAcademicYear(schoolYearId)
  }

  const handleArchiveSchoolYear = async (schoolYearId: string) => {
    await archiveAcademicYear(schoolYearId)
    setIsArchiveModalOpen(false)
  }

  const handleViewDetails = (schoolYear: AcademicYear) => {
    setSelectedSchoolYear(schoolYear)
    setIsDetailsModalOpen(true)
  }

  const handleArchiveClick = (schoolYear: AcademicYear) => {
    setSelectedSchoolYear(schoolYear)
    setIsArchiveModalOpen(true)
  }

  const handleEditClick = (schoolYear: AcademicYear) => {
    setSelectedSchoolYear(schoolYear)
    setIsEditModalOpen(true)
  }

  const handleEditYear = async (updatedYear: Partial<AcademicYear>) => {
    console.log("handleEditYear called with:", updatedYear)
    if (selectedSchoolYear?.id) {
      console.log("Updating school year with ID:", selectedSchoolYear.id)
      const success = await updateAcademicYear(selectedSchoolYear.id, updatedYear)
      console.log("Update result:", success)
      if (success) {
        // Recharger les totaux
        await loadYearTotals()
        setIsEditModalOpen(false)
        setSelectedSchoolYear(null)
      }
    } else {
      console.log("No selectedSchoolYear.id found")
    }
  }

  const loadYearTotals = async () => {
    const totals: {[key: string]: {students: number, teachers: number}} = {}
    for (const year of academicYears) {
      if (year.id) {
        const yearTotal = await calculateTotals(year.id)
        totals[year.id] = yearTotal
      }
    }
    setYearTotals(totals)
  }

  // Get current active school year
  const activeSchoolYear = getActiveAcademicYear()

  // Load year totals when academic years change
  useEffect(() => {
    if (academicYears.length > 0) {
      loadYearTotals()
    }
  }, [academicYears])

  // Calculate statistics
  const stats = getStats()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Gestion des Années Scolaires" description="Gérer les années scolaires et périodes">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle année
            </Button>
          </PageHeader>

          {/* Error Message */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Année active</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold text-primary">
                  {isLoading ? "Chargement..." : stats.activeYear}
                </div>
                <p className="text-xs text-muted-foreground">En cours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total années</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">
                  {isLoading ? "Chargement..." : stats.totalYears}
                </div>
                <p className="text-xs text-muted-foreground">Gérées dans le système</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Années archivées</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">
                  {isLoading ? "Chargement..." : stats.archivedYears}
                </div>
                <p className="text-xs text-muted-foreground">Terminées</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">À venir</CardTitle>
                <Calendar className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold text-secondary">
                  {isLoading ? "Chargement..." : stats.upcomingYears}
                </div>
                <p className="text-xs text-muted-foreground">Planifiées</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="calendar">Calendrier</TabsTrigger>
              <TabsTrigger value="archive">Archives</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Current School Year Highlight */}
              {activeSchoolYear && (
                <Card className="border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-primary" />
                          Année scolaire active: {activeSchoolYear.year}
                        </CardTitle>
                        <CardDescription>
                          Du {new Date(activeSchoolYear.start_date).toLocaleDateString("fr-FR")} au{" "}
                          {new Date(activeSchoolYear.end_date).toLocaleDateString("fr-FR")}
                        </CardDescription>
                      </div>
                      <Badge className="bg-primary text-primary-foreground">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <div className="text-2xl font-serif font-bold text-primary">
                          {activeSchoolYear.id ? (yearTotals[activeSchoolYear.id]?.students || 0).toLocaleString() : "0"}
                        </div>
                        <p className="text-sm text-muted-foreground">Élèves inscrits</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-serif font-bold text-secondary">
                          {activeSchoolYear.id ? yearTotals[activeSchoolYear.id]?.teachers || 0 : 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Professeurs</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-serif font-bold text-accent">1</div>
                        <p className="text-sm text-muted-foreground">Établissement</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* School Years Table */}
              <SchoolYearsTable
                schoolYears={academicYears}
                yearTotals={yearTotals}
                onActivate={handleActivateSchoolYear}
                onArchive={handleArchiveClick}
                onViewDetails={handleViewDetails}
                onEdit={handleEditClick}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calendrier scolaire</CardTitle>
                  <CardDescription>Périodes et vacances pour l'année active</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeSchoolYear ? (
                    <div className="space-y-6">
                      {/* Periods */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Trimestres</h3>
                        <div className="grid gap-4 md:grid-cols-3">
                          {(activeSchoolYear.periods || []).map((period, index) => (
                            <Card key={index}>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">{period.name}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground">
                                  Du {new Date(period.startDate).toLocaleDateString("fr-FR")} au{" "}
                                  {new Date(period.endDate).toLocaleDateString("fr-FR")}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Holidays */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Vacances</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {(activeSchoolYear.holidays || []).map((holiday, index) => (
                            <Card key={index}>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">{holiday.name}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground">
                                  Du {new Date(holiday.startDate).toLocaleDateString("fr-FR")} au{" "}
                                  {new Date(holiday.endDate).toLocaleDateString("fr-FR")}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {isLoading ? "Chargement..." : "Aucune année scolaire active"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="archive" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Années archivées</CardTitle>
                  <CardDescription>Consulter les données des années scolaires précédentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {academicYears
                      .filter((year) => year.status === "archived")
                      .map((year) => (
                        <Card key={year.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-base">{year.year}</CardTitle>
                                <CardDescription>
                                  {year.total_students?.toLocaleString() || 0} élèves • {year.total_teachers || 0} professeurs
                                </CardDescription>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">Archivée</Badge>
                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(year)}>
                                  Voir détails
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    {academicYears.filter((year) => year.status === "archived").length === 0 && !isLoading && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Aucune année scolaire archivée</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Modals */}
          <CreateSchoolYearModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateSchoolYear}
          />

          <EditSchoolYearModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedSchoolYear(null)
            }}
            schoolYear={selectedSchoolYear}
            onUpdate={handleEditYear}
          />

          <SchoolYearDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            schoolYear={selectedSchoolYear}
          />

          <ArchiveModal
            isOpen={isArchiveModalOpen}
            onClose={() => setIsArchiveModalOpen(false)}
            schoolYear={selectedSchoolYear}
            onArchive={handleArchiveSchoolYear}
          />
        </div>
      </main>
    </div>
  )
}