"use client"

import { useState, useMemo } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, UserCheck, ChevronLeft, ChevronRight, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock Data
const MOCK_PREVIOUS_STUDENTS = [
  { id: "ps_1", firstName: "Issa", lastName: "Sangaré", dateOfBirth: "2014-05-10", gender: "Masculin", class: "1ère Année", previousAcademicYear: "2023-2024", status: "active", nationality: "Malienne" },
  { id: "ps_2", firstName: "Mariam", lastName: "Sidibé", dateOfBirth: "2013-11-20", gender: "Féminin", class: "2ème Année", previousAcademicYear: "2023-2024", status: "active", nationality: "Malienne" },
]

const MOCK_CLASSES = [
  { id: "c1", name: "1ère Année" },
  { id: "c2", name: "2ème Année" },
  { id: "c3", name: "3ème Année" },
]

export default function ReinscriptionPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [students, setStudents] = useState(MOCK_PREVIOUS_STUDENTS)

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClass = selectedClass === "all" || s.class === selectedClass
      return matchesSearch && matchesClass
    })
  }, [students, searchTerm, selectedClass])

  const handleReinscribe = (id: string) => {
    if (confirm("Réinscrire cet élève ?")) {
      setStudents(prev => prev.filter(s => s.id !== id))
      alert("Élève réinscrit (Simulation)")
    }
  }

  return (
    <AppLayout>
          <PageHeader title="Réinscription" description="Réinscrire les anciens élèves pour la nouvelle année" />

          <Card>
            <CardHeader><CardTitle>Recherche</CardTitle></CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Nom de l'élève..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Classe précédente" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {MOCK_CLASSES.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Élève</TableHead>
                    <TableHead>Classe préc.</TableHead>
                    <TableHead>Année préc.</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{s.firstName[0]}{s.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{s.firstName} {s.lastName}</div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{s.class}</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{s.previousAcademicYear}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleReinscribe(s.id)}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Réinscrire
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Aucun élève à réinscrire</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </AppLayout>
  )
}
