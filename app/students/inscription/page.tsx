"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Save } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

const MOCK_CLASSES = [
  { id: "c1", name: "1ère Année" },
  { id: "c2", name: "2ème Année" },
  { id: "c3", name: "3ème Année" },
]

export default function InscriptionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: undefined as Date | undefined,
    gender: "",
    class: "",
    nationality: "",
    parentName: "",
    parentPhone: "",
    address: "",
    status: "Actif"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      alert("Inscription réussie (Simulation)")
      setIsSubmitting(false)
      setFormData({
        firstName: "", lastName: "", dateOfBirth: undefined, gender: "",
        class: "", nationality: "", parentName: "", parentPhone: "",
        address: "", status: "Actif"
      })
    }, 1000)
  }

  return (
    <AppLayout>
          <PageHeader title="Nouvelle Inscription" description="Enregistrer un nouvel élève dans l'établissement" />

          <Card>
            <CardHeader>
              <CardTitle>Formulaire d'inscription</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de naissance</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateOfBirth ? format(formData.dateOfBirth, "dd/MM/yyyy") : "Choisir une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={formData.dateOfBirth} onSelect={d => setFormData({...formData, dateOfBirth: d})} locale={fr} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Genre</Label>
                    <Select value={formData.gender} onValueChange={v => setFormData({...formData, gender: v})}>
                      <SelectTrigger><SelectValue placeholder="Genre" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculin">Masculin</SelectItem>
                        <SelectItem value="Féminin">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Classe</Label>
                    <Select value={formData.class} onValueChange={v => setFormData({...formData, class: v})}>
                      <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                      <SelectContent>
                        {MOCK_CLASSES.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nationalité</Label>
                    <Input value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-bold">Parent / Tuteur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom complet du parent</Label>
                      <Input value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Adresse</Label>
                    <Textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                  </div>
                </div>

                <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Enregistrement..." : "Inscrire l'élève"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </AppLayout>
  )
}
