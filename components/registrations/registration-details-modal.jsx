"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Users, FileText, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

export function RegistrationDetailsModal({ registration, open, onOpenChange }) {
  if (!registration) return null

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approuvée", color: "bg-green-100 text-green-800" },
      rejected: { label: "Rejetée", color: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <Badge className={config.color}>
        {getStatusIcon(status)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    )
  }

  const handleApprove = () => {
    console.log("Approuver inscription:", registration.id)
    onOpenChange(false)
  }

  const handleReject = () => {
    console.log("Rejeter inscription:", registration.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Détails de l'inscription - {registration.studentName}</span>
            </div>
            {getStatusBadge(registration.status)}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="parent">Parent/Tuteur</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations de l'élève</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Nom complet:</span>
                    <p className="text-gray-900">{registration.studentName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Classe demandée:</span>
                    <p className="text-gray-900">{registration.class}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">École:</span>
                    <p className="text-gray-900">{registration.school}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Type d'inscription:</span>
                    <Badge variant="outline">
                      {registration.type === "new" ? "Nouvelle inscription" : "Réinscription"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations administratives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Date de soumission:</span>
                    <p className="text-gray-900">{new Date(registration.submittedDate).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Statut:</span>
                    <div className="mt-1">{getStatusBadge(registration.status)}</div>
                  </div>
                  {registration.rejectionReason && (
                    <div>
                      <span className="font-medium text-gray-600">Raison du rejet:</span>
                      <p className="text-red-600">{registration.rejectionReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="parent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Informations du parent/tuteur</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-600">Nom complet:</span>
                    <p className="text-gray-900">{registration.parentName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Téléphone:</span>
                    <p className="text-gray-900">{registration.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Documents fournis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Documents reçus:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {registration.documents.map((doc, index) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {registration.missingDocs.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600">Documents manquants:</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {registration.missingDocs.map((doc, index) => (
                          <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                            <XCircle className="h-3 w-3 mr-1" />
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actions disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {registration.status === "pending" && (
                    <div className="flex space-x-2">
                      <Button onClick={handleApprove} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver l'inscription
                      </Button>
                      <Button variant="destructive" onClick={handleReject} className="flex-1">
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter l'inscription
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Télécharger dossier
                    </Button>
                    <Button variant="outline">
                      <User className="h-4 w-4 mr-2" />
                      Contacter parent
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
