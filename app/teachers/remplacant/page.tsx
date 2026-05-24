"use client"

import { useState, useMemo } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus,
  Search,
  Eye,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  DollarSign,
  Trash2,
} from "lucide-react"

// Mock Data
const MOCK_SUBJECTS = [
  { id: "1", name: "Mathématiques" },
  { id: "2", name: "Français" },
  { id: "3", name: "Sciences" },
]

const MOCK_SUBSTITUTES = [
  {
    id: "sub_1",
    first_name: "Bakary",
    last_name: "Sanogo",
    subject_id: ["1", "3"],
    subject_names: ["Mathématiques", "Sciences"],
    phone: "70001122",
    email: "b.sanogo@gmail.com",
    address: "Baco Djicoroni",
    hourly_rate: 4000,
    status: "available"
  },
  {
    id: "sub_2",
    first_name: "Kadiatou",
    last_name: "Sidibé",
    subject_id: ["2"],
    subject_names: ["Français"],
    phone: "60001122",
    email: "k.sidibe@gmail.com",
    address: "Hamdallaye",
    hourly_rate: 4500,
    status: "busy"
  }
]

export default function RemplacantPage() {
  const [substitutes, setSubstitutes] = useState(MOCK_SUBSTITUTES)
  const [subjects] = useState(MOCK_SUBJECTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")

  const filtered = useMemo(() => {
    return substitutes.filter(s => {
      const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSubject = selectedSubject === "all" || s.subject_id.includes(selectedSubject)
      return matchesSearch && matchesSubject
    })
  }, [substitutes, searchTerm, selectedSubject])

  const handleDelete = (id: string) => {
    if (confirm("Supprimer ce remplaçant ?")) {
      setSubstitutes(prev => prev.filter(s => s.id !== id))
    }
  }

  return (
    <AppLayout>
          <PageHeader title="Professeurs Remplaçants" description="Gestion du vivier de remplaçants">
            <Button onClick={() => alert("Simulation Ajout")}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
          </PageHeader>

          <Card>
            <CardHeader><CardTitle>Filtres</CardTitle></CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Matière" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(sub => (
              <Card key={sub.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{sub.first_name} {sub.last_name}</CardTitle>
                    <Badge variant={sub.status === "available" ? "default" : "secondary"}>
                      {sub.status === "available" ? "Disponible" : "Occupé"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {sub.subject_names.map(name => <Badge key={name} variant="outline" className="text-[10px]">{name}</Badge>)}
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div className="flex items-center"><Phone className="h-3 w-3 mr-2" />{sub.phone}</div>
                    <div className="flex items-center"><Mail className="h-3 w-3 mr-2" />{sub.email}</div>
                    <div className="flex items-center"><MapPin className="h-3 w-3 mr-2" />{sub.address}</div>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <div className="text-sm font-bold text-green-600">{sub.hourly_rate.toLocaleString()} FCFA/h</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(sub.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </AppLayout>
  )
}
