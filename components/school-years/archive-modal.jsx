"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, AlertTriangle } from "lucide-react"

export function ArchiveModal({ isOpen, onClose, schoolYear, onDelete }) {
  if (!schoolYear) return null

  const handleDelete = () => {
    onDelete(schoolYear.id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <Trash2 className="h-5 w-5 mr-2" />
            Supprimer l'année scolaire
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de supprimer l'année scolaire <strong>{schoolYear.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Cette action est irréversible. Toutes les données liées à cette année scolaire (inscriptions, notes, présences, etc.) seront supprimées définitivement.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-medium">Cette action va :</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Supprimer définitivement l'année scolaire</li>
              <li>• Effacer toutes les données associées</li>
              <li>• Libérer l'année pour une nouvelle configuration</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="bg-transparent">
              Annuler
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
