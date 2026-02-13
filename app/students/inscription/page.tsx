"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Save, Upload, Camera } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useStudents } from "@/hooks/use-students"
import { useToast } from "@/hooks/use-toast"

// Définition du type de données pour le formulaire
export type NewEleveData = {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender: string;
  class: string;
  nationality: string;
  parentName: string;
  parentPhone: string;
  address: string;
  enrollmentDate: Date;
  status: string;
};

export default function InscriptionPage() {
  const { createStudent, classes, isLoading: classesLoading, fetchStudents } = useStudents()

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const { toast } = useToast()
  
  const [formData, setFormData] = useState<NewEleveData>({
    firstName: "",
    lastName: "",
    dateOfBirth: undefined,
    gender: "",
    class: "",
    nationality: "",
    parentName: "",
    parentPhone: "",
    address: "",
    enrollmentDate: new Date(),
    status: "Actif"
  });

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.class || !formData.nationality) {
      toast({
        title: "Champs obligatoires manquants",
        description: "Veuillez remplir tous les champs obligatoires (nom, prénom, date de naissance, classe, nationalité).",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      await createStudent({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: format(formData.dateOfBirth, "yyyy-MM-dd"),
        gender: formData.gender,
        class: formData.class,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        address: formData.address,
        enrollmentDate: format(formData.enrollmentDate, "yyyy-MM-dd"),
        status: formData.status
      })

      toast({
        title: "Succès",
        description: "Nouvel élève enregistré avec succès !",
      })

      // Reset form fields after submission
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: undefined,
        gender: "",
        class: "",
        nationality: "",
        parentName: "",
        parentPhone: "",
        address: "",
        enrollmentDate: new Date(),
        status: "Actif"
      })

    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  };

  const handleInputChange = (field: keyof NewEleveData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Intégration de la sidebar */}
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          {/* En-tête de la page */}
          <PageHeader
            title="Inscription d'un nouvel élève"
            description="Utilisez ce formulaire pour enregistrer un nouvel élève."
            className=""
          >
            <Button 
              type="submit" 
              form="new-eleve-form" 
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Enregistrement..." : "Enregistrer l'élève"}
            </Button>
          </PageHeader>

          <Card>
            <CardHeader>
              <CardTitle>Formulaire d'inscription</CardTitle>
              <CardDescription>Remplissez tous les champs requis pour procéder à l'inscription.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Formulaire complet */}
              <form id="new-eleve-form" onSubmit={handleSubmit} className="space-y-6">

                {/* Section Informations personnelles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informations personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="Prénom de l'élève"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom de famille *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Nom de famille"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date de naissance *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-transparent",
                              !formData.dateOfBirth && "text-muted-foreground",
                            )}
                            disabled={isSubmitting}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.dateOfBirth ? (
                              format(formData.dateOfBirth, "dd MMMM yyyy", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.dateOfBirth}
                            onSelect={(date) => handleInputChange("dateOfBirth", date)}
                            initialFocus
                            locale={fr}
                            disabled={(date) => date > new Date()}
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Genre</Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(value) => handleInputChange("gender", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le genre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Masculin">Masculin</SelectItem>
                          <SelectItem value="Féminin">Féminin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nationalité *</Label>
                      <Input
                        value={formData.nationality}
                        onChange={(e) => handleInputChange("nationality", e.target.value)}
                        placeholder="Nationalité de l'élève"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Section Informations scolaires */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informations scolaires</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Classe *</Label>
                      <Select 
                        value={formData.class} 
                        onValueChange={(value) => handleInputChange("class", value)}
                        disabled={isSubmitting || classesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la classe" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((classItem) => (
                            <SelectItem key={classItem.id} value={classItem.name}>
                              {classItem.name} ({classItem.level})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {classesLoading && (
                        <p className="text-sm text-muted-foreground">Chargement des classes...</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Date d'inscription</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-transparent",
                              !formData.enrollmentDate && "text-muted-foreground",
                            )}
                            disabled={isSubmitting}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(formData.enrollmentDate, "dd MMMM yyyy", { locale: fr })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.enrollmentDate}
                            onSelect={(date) => handleInputChange("enrollmentDate", date || new Date())}
                            initialFocus
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Section Informations du parent/tuteur */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informations du parent/tuteur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentName">Nom du parent/tuteur</Label>
                      <Input
                        id="parentName"
                        value={formData.parentName}
                        onChange={(e) => handleInputChange("parentName", e.target.value)}
                        placeholder="Nom complet du parent"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentPhone">Téléphone</Label>
                      <Input
                        id="parentPhone"
                        value={formData.parentPhone}
                        onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                        placeholder="+223 XX XX XX XX"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Adresse complète de résidence"
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Section Statut */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Statut de l'élève</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Statut</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => handleInputChange("status", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Actif">Actif</SelectItem>
                          <SelectItem value="Inactif">Inactif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}