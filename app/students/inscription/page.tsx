"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { CalendarIcon, Save, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useClasses } from "@/hooks/use-classes"

export default function InscriptionPage() {
  const router = useRouter()
  const { classes, isLoading: classesLoading } = useClasses()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: undefined as Date | undefined,
    gender: "",
    classId: "",
    nationality: "",
    parentName: "",
    parentPhone: "",
    address: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender,
          birthDate: formData.dateOfBirth ? format(formData.dateOfBirth, "yyyy-MM-dd") : "",
          nationality: formData.nationality,
          parentName: formData.parentName,
          parentPhone: formData.parentPhone,
          address: formData.address,
          classId: formData.classId,
        }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.message)
      router.push("/students")
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <PageHeader title="Nouvelle Inscription" description="Enregistrer un nouvel élève dans l'établissement" />

      <Card>
        <CardHeader>
          <CardTitle>Formulaire d'inscription</CardTitle>
          {error && <CardDescription className="text-red-500">{error}</CardDescription>}
        </CardHeader>
        <CardContent>
          {classesLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
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
                  <Select value={formData.classId} onValueChange={v => setFormData({...formData, classId: v})}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSubmitting ? "Enregistrement..." : "Inscrire l'élève"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  )
}
