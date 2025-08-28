"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, MapPin, Phone, Mail, User, GraduationCap, Heart, Users } from "lucide-react"
import type { Eleve } from "./eleve-modal"

interface EleveDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  eleve: Eleve | null
}

export function EleveDetailsModal({ isOpen, onClose, eleve }: EleveDetailsModalProps) {
  if (!eleve) return null

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const getAge = (dateNaissance: string) => {
    const today = new Date()
    const birthDate = new Date(dateNaissance)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={eleve.photo || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(eleve.nom, eleve.prenom)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">
                {eleve.prenom} {eleve.nom}
              </div>
              <div className="text-sm text-muted-foreground">N° {eleve.numeroEleve}</div>
            </div>
            <Badge variant={eleve.statut === "Actif" ? "default" : "secondary"}>{eleve.statut}</Badge>
          </DialogTitle>
          <DialogDescription>
            Détails complets de l'élève - {eleve.niveau} {eleve.classe}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="famille">Famille</TabsTrigger>
            <TabsTrigger value="medical">Médical</TabsTrigger>
            <TabsTrigger value="academique">Académique</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Informations personnelles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(eleve.dateNaissance).toLocaleDateString("fr-FR")} ({getAge(eleve.dateNaissance)} ans)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{eleve.lieuNaissance}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Sexe:</span>
                    <span className="text-sm">{eleve.sexe === "M" ? "Masculin" : "Féminin"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Nationalité:</span>
                    <span className="text-sm">{eleve.nationalite}</span>
                  </div>
                  {eleve.telephone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{eleve.telephone}</span>
                    </div>
                  )}
                  {eleve.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{eleve.email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>Scolarité</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Établissement:</span>
                    <p className="text-sm text-muted-foreground">{eleve.etablissement}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Classe:</span>
                    <p className="text-sm text-muted-foreground">
                      {eleve.niveau} {eleve.classe}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Année scolaire:</span>
                    <p className="text-sm text-muted-foreground">{eleve.anneeScolaire}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Date d'inscription:</span>
                    <p className="text-sm text-muted-foreground">
                      {new Date(eleve.dateInscription).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Adresse</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{eleve.adresse}</p>
                <p className="text-sm text-muted-foreground">
                  {eleve.ville}, {eleve.region}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="famille" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Père</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Nom:</span>
                    <p className="text-sm text-muted-foreground">{eleve.nomPere}</p>
                  </div>
                  {eleve.professionPere && (
                    <div>
                      <span className="text-sm font-medium">Profession:</span>
                      <p className="text-sm text-muted-foreground">{eleve.professionPere}</p>
                    </div>
                  )}
                  {eleve.telephonePere && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{eleve.telephonePere}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Mère</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Nom:</span>
                    <p className="text-sm text-muted-foreground">{eleve.nomMere}</p>
                  </div>
                  {eleve.professionMere && (
                    <div>
                      <span className="text-sm font-medium">Profession:</span>
                      <p className="text-sm text-muted-foreground">{eleve.professionMere}</p>
                    </div>
                  )}
                  {eleve.telephoneMere && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{eleve.telephoneMere}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {eleve.tuteur && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Tuteur</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Nom:</span>
                    <p className="text-sm text-muted-foreground">{eleve.tuteur}</p>
                  </div>
                  {eleve.telephoneTuteur && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{eleve.telephoneTuteur}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Informations médicales</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {eleve.groupeSanguin && (
                  <div>
                    <span className="text-sm font-medium">Groupe sanguin:</span>
                    <Badge variant="outline" className="ml-2">
                      {eleve.groupeSanguin}
                    </Badge>
                  </div>
                )}

                {eleve.allergies && (
                  <div>
                    <span className="text-sm font-medium">Allergies:</span>
                    <p className="text-sm text-muted-foreground mt-1">{eleve.allergies}</p>
                  </div>
                )}

                {eleve.maladiesChroniques && (
                  <div>
                    <span className="text-sm font-medium">Maladies chroniques:</span>
                    <p className="text-sm text-muted-foreground mt-1">{eleve.maladiesChroniques}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Contact d'urgence</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Nom:</span>
                      <p className="text-sm text-muted-foreground">{eleve.contactUrgence}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{eleve.telephoneUrgence}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academique" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Résultats académiques</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {eleve.moyenneGenerale && eleve.moyenneGenerale > 0 && (
                    <div>
                      <span className="text-sm font-medium">Moyenne générale:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={eleve.moyenneGenerale >= 10 ? "default" : "destructive"}>
                          {eleve.moyenneGenerale.toFixed(2)}/20
                        </Badge>
                      </div>
                    </div>
                  )}

                  {eleve.classement && eleve.classement > 0 && (
                    <div>
                      <span className="text-sm font-medium">Classement:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{eleve.classement}e</Badge>
                      </div>
                    </div>
                  )}
                </div>

                {eleve.observations && (
                  <div>
                    <span className="text-sm font-medium">Observations:</span>
                    <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-lg">{eleve.observations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
