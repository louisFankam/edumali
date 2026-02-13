"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Users, GraduationCap, Building2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function SchoolYearDetailsModal({ isOpen, onClose, schoolYear }) {
  if (!schoolYear) return null

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-primary text-primary-foreground">Active</Badge>
      case "upcoming":
        return <Badge variant="secondary">À venir</Badge>
      case "archived":
        return <Badge variant="outline">Archivée</Badge>
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de l'année scolaire {schoolYear.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-bold">{schoolYear.year}</h2>
              <p className="text-muted-foreground">
                Du {format(new Date(schoolYear.start_date), "dd MMMM yyyy", { locale: fr })} au{" "}
                {format(new Date(schoolYear.end_date), "dd MMMM yyyy", { locale: fr })}
              </p>
            </div>
            {getStatusBadge(schoolYear.status)}
          </div>

          <Separator />

          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Élèves inscrits</CardTitle>
                <GraduationCap className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold text-primary">
                  {(schoolYear.total_students || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Professeurs</CardTitle>
                <Users className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold text-secondary">{schoolYear.total_teachers || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Établissements</CardTitle>
                <Building2 className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold text-accent">1</div>
              </CardContent>
            </Card>
          </div>

          {/* Periods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Trimestres/Semestres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {schoolYear.periods.map((period, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{period.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Du {format(new Date(period.startDate), "dd MMMM", { locale: fr })} au{" "}
                        {format(new Date(period.endDate), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Holidays */}
          <Card>
            <CardHeader>
              <CardTitle>Vacances scolaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {schoolYear.holidays.map((holiday, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{holiday.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Du {format(new Date(holiday.startDate), "dd MMMM", { locale: fr })} au{" "}
                        {format(new Date(holiday.endDate), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Informations système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                  <p>{schoolYear.created ? format(new Date(schoolYear.created), "dd MMMM yyyy", { locale: fr }) : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <p>
                    {schoolYear.status === "active"
                      ? "Active"
                      : schoolYear.status === "upcoming"
                        ? "À venir"
                        : "Archivée"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
