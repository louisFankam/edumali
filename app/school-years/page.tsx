"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { SchoolYearsTable } from "@/components/school-years/school-years-table"
import { CreateSchoolYearModal } from "@/components/school-years/create-school-year-modal"
import { EditSchoolYearModal } from "@/components/school-years/edit-school-year-modal"
import { SchoolYearDetailsModal } from "@/components/school-years/school-year-details-modal"
import { ArchiveModal } from "@/components/school-years/archive-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAcademicYears, type AcademicYearData } from "@/hooks/use-settings"
import { Plus, Calendar, TrendingUp, Archive } from "lucide-react"
import { toast } from "sonner"

export default function SchoolYearsPage() {
  const { years, currentYear, isLoading, create, update, remove } = useAcademicYears()

  const [selectedSchoolYear, setSelectedSchoolYear] = useState<AcademicYearData | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const stats = {
    activeYear: currentYear?.name || "Aucune",
    totalYears: years.length,
    inactiveYears: years.filter((y) => !y.isCurrent).length,
  }

  const handleCreate = async (data: { name: string; startDate: string; endDate: string }) => {
    try {
      await create(data)
      toast.success("Année scolaire créée avec succès")
      setIsCreateModalOpen(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de la création")
    }
  }

  const handleEdit = async (data: { name: string; startDate: string; endDate: string }) => {
    if (!selectedSchoolYear?.id) return
    try {
      await update(selectedSchoolYear.id, data)
      toast.success("Année scolaire modifiée avec succès")
      setIsEditModalOpen(false)
      setSelectedSchoolYear(null)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de la modification")
    }
  }

  const handleActivate = async (id: string) => {
    try {
      for (const year of years) {
        if (year.id !== id && year.isCurrent) {
          await update(year.id, { isCurrent: false })
        }
      }
      await update(id, { isCurrent: true })
      toast.success("Année scolaire activée")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de l'activation")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await remove(id)
      toast.success("Année scolaire supprimée")
      setIsDeleteModalOpen(false)
      setSelectedSchoolYear(null)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de la suppression")
    }
  }

  const handleViewDetails = (schoolYear: AcademicYearData) => {
    setSelectedSchoolYear(schoolYear)
    setIsDetailsModalOpen(true)
  }

  const handleEditClick = (schoolYear: AcademicYearData) => {
    setSelectedSchoolYear(schoolYear)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (schoolYear: AcademicYearData) => {
    setSelectedSchoolYear(schoolYear)
    setIsDeleteModalOpen(true)
  }

  return (
    <AppLayout>
      <PageHeader title="Gestion des Années Scolaires" description="Gérer les années scolaires">
        <HelpButton section="annees-scolaires" />
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle année
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Années inactives</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold">
              {isLoading ? "Chargement..." : stats.inactiveYears}
            </div>
            <p className="text-xs text-muted-foreground">Non actives</p>
          </CardContent>
        </Card>
      </div>

      {currentYear && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Année scolaire active: {currentYear.name}
                </CardTitle>
                <CardDescription>
                  Du {new Date(currentYear.startDate).toLocaleDateString("fr-FR")} au{" "}
                  {new Date(currentYear.endDate).toLocaleDateString("fr-FR")}
                </CardDescription>
              </div>
              <Badge className="bg-primary text-primary-foreground">Active</Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      <SchoolYearsTable
        schoolYears={years}
        onActivate={handleActivate}
        onDelete={handleDeleteClick}
        onViewDetails={handleViewDetails}
        onEdit={handleEditClick}
        isLoading={isLoading}
      />

      <CreateSchoolYearModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
        existingNames={years.map((y) => y.name)}
      />

      <EditSchoolYearModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedSchoolYear(null)
        }}
        schoolYear={selectedSchoolYear}
        onUpdate={handleEdit}
        existingNames={years.map((y) => y.name)}
      />

      <SchoolYearDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        schoolYear={selectedSchoolYear}
      />

      <ArchiveModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedSchoolYear(null)
        }}
        schoolYear={selectedSchoolYear}
        onDelete={handleDelete}
      />
    </AppLayout>
  )
}
