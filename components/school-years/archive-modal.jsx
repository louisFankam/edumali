"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Archive, AlertTriangle } from "lucide-react"

export function ArchiveModal({ isOpen, onClose, schoolYear, onArchive }) {
  if (!schoolYear) return null

  const handleArchive = () => {
    onArchive(schoolYear.id)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Archive className="h-5 w-5 mr-2" />
            Archiver l'année scolaire
          </DialogTitle>
          <DialogDescription>Vous êtes sur le point d'archiver l'année scolaire {schoolYear.name}.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Une fois archivée, cette année scolaire ne pourra plus être modifiée. Toutes les données seront conservées
              en lecture seule.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-medium">Cette action va :</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Marquer l'année comme archivée</li>
              <li>• Conserver toutes les données en lecture seule</li>
              <li>• Permettre l'activation d'une nouvelle année</li>
              <li>• Générer un rapport de fin d'année</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="bg-transparent">
              Annuler
            </Button>
            <Button onClick={handleArchive} variant="destructive">
              Archiver l'année
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
