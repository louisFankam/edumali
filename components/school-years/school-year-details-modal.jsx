"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function SchoolYearDetailsModal({ isOpen, onClose, schoolYear }) {
  if (!schoolYear) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails de l'année scolaire {schoolYear.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-bold">{schoolYear.name}</h2>
              <p className="text-muted-foreground">
                Du {format(new Date(schoolYear.startDate), "dd MMMM yyyy", { locale: fr })} au{" "}
                {format(new Date(schoolYear.endDate), "dd MMMM yyyy", { locale: fr })}
              </p>
            </div>
            {schoolYear.isCurrent
              ? <Badge className="bg-primary text-primary-foreground">Active</Badge>
              : <Badge variant="outline">Inactive</Badge>
            }
          </div>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Période
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Du {format(new Date(schoolYear.startDate), "dd MMMM yyyy", { locale: fr })} au{" "}
                {format(new Date(schoolYear.endDate), "dd MMMM yyyy", { locale: fr })}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
