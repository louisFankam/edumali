"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface Eleve {
  id: string
  numeroEleve: string
  nom: string
  prenom: string
  dateNaissance: string
  lieuNaissance: string
  sexe: "M" | "F"
  nationalite: string
  etablissement: string
  classe: string
  niveau: string
  anneeScolaire: string
  statut: "Actif" | "Inactif" | "Transféré" | "Diplômé"
  dateInscription: string

  // Informations personnelles
  adresse: string
  ville: string
  region: string
  telephone?: string
  email?: string

  // Informations familiales
  nomPere: string
  professionPere?: string
  telephonePere?: string
  nomMere: string
  professionMere?: string
  telephoneMere?: string
  tuteur?: string
  telephoneTuteur?: string

  // Informations médicales
  groupeSanguin?: string
  allergies?: string
  maladiesChroniques?: string
  contactUrgence: string
  telephoneUrgence: string

  // Informations académiques
  moyenneGenerale?: number
  classement?: number
  observations?: string

  photo?: string
}

interface EleveModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (eleve: Omit<Eleve, "id">) => void
  eleve?: Eleve
  mode: "create" | "edit"
  etablissements: Array<{ id: string; nom: string }>
}

const regions = ["Kayes", "Koulikoro", "Sikasso", "Ségou", "Mopti", "Tombouctou", "Gao", "Kidal", "Bamako"]
const niveaux = ["CP1", "CP2", "CE1", "CE2", "CM1", "CM2", "6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale"]
const classes = ["A", "B", "C", "D", "E", "F"]
const groupesSanguins = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export function EleveModal({ isOpen, onClose, onSave, eleve, mode, etablissements }: EleveModalProps) {
  const [formData, setFormData] = useState<Omit<Eleve, "id">>({
    numeroEleve: eleve?.numeroEleve || "",
    nom: eleve?.nom || "",
    prenom: eleve?.prenom || "",
    dateNaissance: eleve?.dateNaissance || "",
    lieuNaissance: eleve?.lieuNaissance || "",
    sexe: eleve?.sexe || "M",
    nationalite: eleve?.nationalite || "Malienne",
    etablissement: eleve?.etablissement || "",
    classe: eleve?.classe || "",
    niveau: eleve?.niveau || "",
    anneeScolaire: eleve?.anneeScolaire || "2024-2025",
    statut: eleve?.statut || "Actif",
    dateInscription: eleve?.dateInscription || new Date().toISOString().split("T")[0],

    adresse: eleve?.adresse || "",
    ville: eleve?.ville || "",
    region: eleve?.region || "",
    telephone: eleve?.telephone || "",
    email: eleve?.email || "",

    nomPere: eleve?.nomPere || "",
    professionPere: eleve?.professionPere || "",
    telephonePere: eleve?.telephonePere || "",
    nomMere: eleve?.nomMere || "",
    professionMere: eleve?.professionMere || "",
    telephoneMere: eleve?.telephoneMere || "",
    tuteur: eleve?.tuteur || "",
    telephoneTuteur: eleve?.telephoneTuteur || "",

    groupeSanguin: eleve?.groupeSanguin || "",
    allergies: eleve?.allergies || "",
    maladiesChroniques: eleve?.maladiesChroniques || "",
    contactUrgence: eleve?.contactUrgence || "",
    telephoneUrgence: eleve?.telephoneUrgence || "",

    moyenneGenerale: eleve?.moyenneGenerale || 0,
    classement: eleve?.classement || 0,
    observations: eleve?.observations || "",

    photo: eleve?.photo || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nouvel élève" : "Modifier l'élève"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Ajouter un nouvel élève au système" : "Modifier les informations de l'élève"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="famille">Famille</TabsTrigger>
              <TabsTrigger value="medical">Médical</TabsTrigger>
              <TabsTrigger value="academique">Académique</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numeroEleve">Numéro d'élève *</Label>
                      <Input
                        id="numeroEleve"
                        value={formData.numeroEleve}
                        onChange={(e) => handleChange("numeroEleve", e.target.value)}
                        placeholder="EL2024001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="anneeScolaire">Année scolaire</Label>
                      <Select
                        value={formData.anneeScolaire}
                        onValueChange={(value) => handleChange("anneeScolaire", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024-2025">2024-2025</SelectItem>
                          <SelectItem value="2023-2024">2023-2024</SelectItem>
                          <SelectItem value="2022-2023">2022-2023</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom *</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => handleChange("nom", e.target.value)}
                        placeholder="TRAORÉ"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom *</Label>
                      <Input
                        id="prenom"
                        value={formData.prenom}
                        onChange={(e) => handleChange("prenom", e.target.value)}
                        placeholder="Aminata"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateNaissance">Date de naissance *</Label>
                      <Input
                        id="dateNaissance"
                        type="date"
                        value={formData.dateNaissance}
                        onChange={(e) => handleChange("dateNaissance", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lieuNaissance">Lieu de naissance *</Label>
                      <Input
                        id="lieuNaissance"
                        value={formData.lieuNaissance}
                        onChange={(e) => handleChange("lieuNaissance", e.target.value)}
                        placeholder="Bamako"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sexe">Sexe *</Label>
                      <Select value={formData.sexe} onValueChange={(value) => handleChange("sexe", value as "M" | "F")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculin</SelectItem>
                          <SelectItem value="F">Féminin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nationalite">Nationalité</Label>
                      <Input
                        id="nationalite"
                        value={formData.nationalite}
                        onChange={(e) => handleChange("nationalite", e.target.value)}
                        placeholder="Malienne"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="statut">Statut</Label>
                      <Select value={formData.statut} onValueChange={(value) => handleChange("statut", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Actif">Actif</SelectItem>
                          <SelectItem value="Inactif">Inactif</SelectItem>
                          <SelectItem value="Transféré">Transféré</SelectItem>
                          <SelectItem value="Diplômé">Diplômé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scolarité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">


                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="niveau">Niveau *</Label>
                      <Select value={formData.niveau} onValueChange={(value) => handleChange("niveau", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          {niveaux.map((niveau) => (
                            <SelectItem key={niveau} value={niveau}>
                              {niveau}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="classe">Classe</Label>
                      <Select value={formData.classe} onValueChange={(value) => handleChange("classe", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la classe" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((classe) => (
                            <SelectItem key={classe} value={classe}>
                              {classe}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateInscription">Date d'inscription</Label>
                    <Input
                      id="dateInscription"
                      type="date"
                      value={formData.dateInscription}
                      onChange={(e) => handleChange("dateInscription", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Adresse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adresse">Adresse *</Label>
                    <Input
                      id="adresse"
                      value={formData.adresse}
                      onChange={(e) => handleChange("adresse", e.target.value)}
                      placeholder="Adresse complète"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ville">Ville *</Label>
                      <Input
                        id="ville"
                        value={formData.ville}
                        onChange={(e) => handleChange("ville", e.target.value)}
                        placeholder="Bamako"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Région *</Label>
                      <Select value={formData.region} onValueChange={(value) => handleChange("region", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la région" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telephone">Téléphone</Label>
                      <Input
                        id="telephone"
                        value={formData.telephone}
                        onChange={(e) => handleChange("telephone", e.target.value)}
                        placeholder="+223 XX XX XX XX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="eleve@email.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="famille" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations familiales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Père</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomPere">Nom du père *</Label>
                        <Input
                          id="nomPere"
                          value={formData.nomPere}
                          onChange={(e) => handleChange("nomPere", e.target.value)}
                          placeholder="Nom complet du père"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="professionPere">Profession</Label>
                        <Input
                          id="professionPere"
                          value={formData.professionPere}
                          onChange={(e) => handleChange("professionPere", e.target.value)}
                          placeholder="Profession du père"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telephonePere">Téléphone du père</Label>
                      <Input
                        id="telephonePere"
                        value={formData.telephonePere}
                        onChange={(e) => handleChange("telephonePere", e.target.value)}
                        placeholder="+223 XX XX XX XX"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Mère</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomMere">Nom de la mère *</Label>
                        <Input
                          id="nomMere"
                          value={formData.nomMere}
                          onChange={(e) => handleChange("nomMere", e.target.value)}
                          placeholder="Nom complet de la mère"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="professionMere">Profession</Label>
                        <Input
                          id="professionMere"
                          value={formData.professionMere}
                          onChange={(e) => handleChange("professionMere", e.target.value)}
                          placeholder="Profession de la mère"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telephoneMere">Téléphone de la mère</Label>
                      <Input
                        id="telephoneMere"
                        value={formData.telephoneMere}
                        onChange={(e) => handleChange("telephoneMere", e.target.value)}
                        placeholder="+223 XX XX XX XX"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Tuteur (optionnel)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tuteur">Nom du tuteur</Label>
                        <Input
                          id="tuteur"
                          value={formData.tuteur}
                          onChange={(e) => handleChange("tuteur", e.target.value)}
                          placeholder="Nom complet du tuteur"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telephoneTuteur">Téléphone du tuteur</Label>
                        <Input
                          id="telephoneTuteur"
                          value={formData.telephoneTuteur}
                          onChange={(e) => handleChange("telephoneTuteur", e.target.value)}
                          placeholder="+223 XX XX XX XX"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations médicales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupeSanguin">Groupe sanguin</Label>
                    <Select
                      value={formData.groupeSanguin}
                      onValueChange={(value) => handleChange("groupeSanguin", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le groupe sanguin" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupesSanguins.map((groupe) => (
                          <SelectItem key={groupe} value={groupe}>
                            {groupe}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => handleChange("allergies", e.target.value)}
                      placeholder="Allergies connues..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maladiesChroniques">Maladies chroniques</Label>
                    <Textarea
                      id="maladiesChroniques"
                      value={formData.maladiesChroniques}
                      onChange={(e) => handleChange("maladiesChroniques", e.target.value)}
                      placeholder="Maladies chroniques..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactUrgence">Contact d'urgence *</Label>
                      <Input
                        id="contactUrgence"
                        value={formData.contactUrgence}
                        onChange={(e) => handleChange("contactUrgence", e.target.value)}
                        placeholder="Nom du contact d'urgence"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telephoneUrgence">Téléphone d'urgence *</Label>
                      <Input
                        id="telephoneUrgence"
                        value={formData.telephoneUrgence}
                        onChange={(e) => handleChange("telephoneUrgence", e.target.value)}
                        placeholder="+223 XX XX XX XX"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academique" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations académiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="moyenneGenerale">Moyenne générale</Label>
                      <Input
                        id="moyenneGenerale"
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={formData.moyenneGenerale}
                        onChange={(e) => handleChange("moyenneGenerale", Number.parseFloat(e.target.value) || 0)}
                        placeholder="15.50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="classement">Classement</Label>
                      <Input
                        id="classement"
                        type="number"
                        min="1"
                        value={formData.classement}
                        onChange={(e) => handleChange("classement", Number.parseInt(e.target.value) || 0)}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observations">Observations</Label>
                    <Textarea
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => handleChange("observations", e.target.value)}
                      placeholder="Observations sur l'élève..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">{mode === "create" ? "Créer" : "Modifier"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
