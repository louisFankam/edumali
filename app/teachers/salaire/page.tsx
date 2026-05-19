"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  DollarSign, 
  Clock, 
  Calendar, 
  Download, 
  Search, 
  FileText,
  Users,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  } from "lucide-react"

// Mock Data
const MOCK_SALARIES = [
  {
    id: "s_1",
    first_name: "Fatoumata",
    last_name: "Diarra",
    type: "titulaire",
    contrat: "mensuel",
    salary: 150000,
    majoration: 10000,
    speciality_names: ["Mathématiques"],
    gender: "Féminin",
    photo: ""
  },
  {
    id: "s_2",
    first_name: "Moussa",
    last_name: "Koné",
    type: "titulaire",
    contrat: "horaire",
    salary: 5000, // taux horaire
    hours_worked: 20,
    majoration: 5000,
    speciality_names: ["Français"],
    gender: "Masculin",
    photo: ""
  },
  {
    id: "s_3",
    first_name: "Aïcha",
    last_name: "Traoré",
    type: "remplaçant",
    hourly_rate: 4500,
    hours_worked: 15,
    majoration: 0,
    subject_names: ["Sciences"],
    gender: "Féminin",
    photo: ""
  }
]

export default function SalairesPage() {
  const [salaries, setSalaries] = useState(MOCK_SALARIES)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSalary, setSelectedSalary] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const itemsPerPage = 10

  const calculateSalary = (salary: any) => {
    let base = 0
    let regularPay = 0
    let majoration = salary.majoration || 0

    if (salary.type === 'titulaire') {
      if (salary.contrat === 'mensuel') {
        base = salary.salary
        regularPay = base
      } else {
        base = salary.salary
        regularPay = base * (salary.hours_worked || 0)
      }
    } else {
      base = salary.hourly_rate
      regularPay = base * (salary.hours_worked || 0)
    }

    return {
      baseSalary: base,
      regularPay,
      majoration,
      total: regularPay + majoration
    }
  }

  const filteredSalaries = useMemo(() => {
    return salaries.filter(s => {
      const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || s.type === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [salaries, searchTerm, selectedStatus])

  const stats = useMemo(() => {
    const total = filteredSalaries.reduce((sum, s) => sum + calculateSalary(s).total, 0)
    const titulaires = filteredSalaries.filter(s => s.type === 'titulaire').length
    const remplacants = filteredSalaries.filter(s => s.type === 'remplaçant').length
    return { total, titulaires, remplacants, count: filteredSalaries.length }
  }, [filteredSalaries])

  const handleExport = () => alert("Export simulation (PDF)")

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Gestion des Salaires" description="Calcul et suivi des rémunérations">
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </PageHeader>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total Salaires" value={`${stats.total.toLocaleString()} FCFA`} icon={DollarSign} />
            <StatCard title="Titulaires" value={stats.titulaires} icon={Users} />
            <StatCard title="Remplaçants" value={stats.remplacants} icon={Clock} />
            <StatCard title="Total Effectif" value={stats.count} icon={Calendar} />
          </div>

          <Card>
            <CardHeader><CardTitle>Filtres</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="titulaire">Titulaires</SelectItem>
                  <SelectItem value="remplaçant">Remplaçants</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <TableLayout 
                data={filteredSalaries} 
                onView={(s) => { setSelectedSalary(s); setShowDetailsModal(true); }}
                calculate={calculateSalary}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {selectedSalary && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails - {selectedSalary.first_name} {selectedSalary.last_name}</DialogTitle>
            </DialogHeader>
            <SalaryDetailContent salary={selectedSalary} calc={calculateSalary(selectedSalary)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
    </Card>
  )
}

function TableLayout({ data, onView, calculate }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="text-left p-4">Enseignant</th>
            <th className="text-left p-4">Type</th>
            <th className="text-left p-4">Base</th>
            <th className="text-left p-4">Heures</th>
            <th className="text-left p-4">Total</th>
            <th className="text-right p-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s: any) => {
            const calc = calculate(s)
            return (
              <tr key={s.id} className="border-b hover:bg-muted/50">
                <td className="p-4 font-medium">{s.first_name} {s.last_name}</td>
                <td className="p-4 text-xs">
                  <Badge variant={s.type === "titulaire" ? "default" : "secondary"}>{s.type}</Badge>
                </td>
                <td className="p-4">{calc.baseSalary.toLocaleString()}</td>
                <td className="p-4">{s.hours_worked || "-"}</td>
                <td className="p-4 font-bold text-green-600">{calc.total.toLocaleString()} FCFA</td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => onView(s)}><Eye className="h-4 w-4" /></Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function SalaryDetailContent({ salary, calc }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
        <div>
          <h4 className="font-bold">Contrat</h4>
          <p className="text-sm capitalize">{salary.type} ({salary.contrat || "Horaire"})</p>
        </div>
        <div>
          <h4 className="font-bold">Matière</h4>
          <p className="text-sm">{(salary.speciality_names || salary.subject_names || []).join(", ")}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between"><span>Salaire de base</span><span>{calc.regularPay.toLocaleString()} FCFA</span></div>
        <div className="flex justify-between"><span>Majoration / Prime</span><span>{calc.majoration.toLocaleString()} FCFA</span></div>
        <div className="flex justify-between border-t pt-2 font-bold text-lg"><span>Total Net</span><span className="text-green-600">{calc.total.toLocaleString()} FCFA</span></div>
      </div>
    </div>
  )
}
