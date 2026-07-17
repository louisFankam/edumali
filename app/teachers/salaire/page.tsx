"use client"

import { useState, useMemo, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DollarSign,
  Clock,
  Calendar,
  Download,
  Search,
  Users,
  Eye,
  Plus,
  Trash2,
} from "lucide-react"
import { useTeachers, usePayroll, PayrollRecord } from "@/hooks/use-teachers"
import { useAcademicYears } from "@/hooks/use-settings"
import { toast } from "sonner"

export default function SalairesPage() {
  const { teachers, isLoading: teachersLoading } = useTeachers()
  const { currentYear } = useAcademicYears()
  const { records: payrolls, isLoading: payrollLoading, addPayroll, deletePayroll, refetch } = usePayroll(
    currentYear ? { from: currentYear.startDate, to: currentYear.endDate } : undefined
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [selectedSalary, setSelectedSalary] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [hoursInput, setHoursInput] = useState<Record<string, number>>({})
  const [attendanceLoading, setAttendanceLoading] = useState(true)

  useEffect(() => {
    if (currentYear) {
      setSelectedMonth(currentYear.startDate.substring(0, 7))
    }
  }, [currentYear])

  const [year, month] = selectedMonth.split("-").map(Number)

  useEffect(() => {
    if (teachers.length === 0) return
    const from = `${year}-${String(month).padStart(2, "0")}-01`
    const toDate = new Date(year, month, 0)
    const to = toDate.toISOString().slice(0, 10)
    setAttendanceLoading(true)
    window.fetch(`/api/teachers/attendance?from=${from}&to=${to}`, { cache: "no-store" })
      .then(r => r.json())
      .then(json => {
        if (!json.ok) return
        const counts: Record<string, number> = {}
        for (const rec of json.data) {
          if (rec.status === "present" || rec.status === "retard") {
            counts[rec.teacher_id] = (counts[rec.teacher_id] || 0) + 1
          }
        }
        const hours: Record<string, number> = {}
        for (const t of teachers) {
          if (t.contrat === "horaire") {
            const presentDays = counts[t.id] || 0
            const hpd = (t as any).hours_per_day || 4
            hours[t.id] = presentDays * hpd
          }
        }
        setHoursInput(prev => {
          const merged = { ...hours }
          for (const k of Object.keys(prev)) {
            if (prev[k] !== undefined) merged[k] = prev[k]
          }
          return merged
        })
        setAttendanceLoading(false)
      })
      .catch(() => setAttendanceLoading(false))
  }, [year, month, teachers])

  const payrollMap = useMemo(() => {
    const map: Record<string, PayrollRecord> = {}
    payrolls.filter(p => p.month === month && p.year === year).forEach(p => {
      map[p.teacher_id] = p
    })
    return map
  }, [payrolls, month, year])

  const salaryData = useMemo(() => {
    return teachers.map(t => {
      const pr = payrollMap[t.id]
      return {
        id: t.id,
        first_name: t.first_name,
        last_name: t.last_name,
        type: t.status === "on_leave" ? "remplaçant" : "titulaire",
        contrat: t.contrat,
        salary: t.salary,
        hours_per_day: (t as any).hours_per_day ?? 4,
        majoration: pr?.bonus ?? 0,
        hours_worked: t.contrat === "horaire" ? (hoursInput[t.id] ?? 0) : undefined,
        speciality_names: t.speciality_names,
        gender: t.gender,
        paid: !!pr,
        payroll_id: pr?.id ?? null,
      }
    })
  }, [teachers, payrollMap, hoursInput])

  const calculateSalary = (s: any) => {
    let base = 0
    let regularPay = 0
    let majoration = s.majoration || 0

    if (s.contrat === "mensuel") {
      base = s.salary
      regularPay = base
    } else {
      base = s.salary
      regularPay = base * (s.hours_worked || 0)
    }

    return { baseSalary: base, regularPay, majoration, total: regularPay + majoration }
  }

  const filteredSalaries = useMemo(() => {
    return salaryData.filter(s => {
      const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || s.type === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [salaryData, searchTerm, selectedStatus])

  const stats = useMemo(() => {
    const total = filteredSalaries.reduce((sum, s) => sum + calculateSalary(s).total, 0)
    const paid = filteredSalaries.filter(s => s.paid).length
    const unpaid = filteredSalaries.length - paid
    return { total, paid, unpaid, count: filteredSalaries.length }
  }, [filteredSalaries])

  const handleMarkPaid = async (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId)
    if (!teacher) return
    try {
      const calc = calculateSalary(salaryData.find(s => s.id === teacherId))
      await addPayroll({
        teacher_id: teacherId,
        month,
        year,
        amount: calc.total,
        bonus: 0,
        deductions: 0,
        paid_at: new Date().toISOString(),
        notes: "",
      } as any)
      toast.success(`${teacher.first_name} ${teacher.last_name} marqué comme payé`)
    } catch (e) {
      toast.error(String(e) || "Erreur lors du paiement")
    }
  }

  const handleUnmarkPaid = async (payrollId: string) => {
    try {
      await deletePayroll(payrollId)
      toast.success("Paiement annulé")
    } catch (e) {
      toast.error(String(e) || "Erreur lors de l'annulation")
    }
  }

  const handleExportCSV = () => {
    const headers = ["Enseignant", "Type", "Base", "Heures", "Total", "Payé"]
    const rows = filteredSalaries.map(s => {
      const calc = calculateSalary(s)
      return [ `${s.first_name} ${s.last_name}`, s.type, calc.baseSalary, s.hours_worked || "-", calc.total, s.paid ? "Oui" : "Non" ]
    })
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `salaires-${selectedMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isLoading = teachersLoading || payrollLoading || attendanceLoading

  return (
    <AppLayout>
          <PageHeader title="Gestion des Salaires" description="Calcul et suivi des rémunérations">
            <HelpButton section="professeurs" />
            <Button onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </PageHeader>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total Salaires" value={`${stats.total.toLocaleString()} FCFA`} icon={DollarSign} />
            <StatCard title="Payés" value={stats.paid} icon={Calendar} />
            <StatCard title="Impayés" value={stats.unpaid} icon={Clock} />
            <StatCard title="Total Effectif" value={stats.count} icon={Users} />
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

          {!currentYear && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg text-sm">
              Aucune année académique active. Définissez une année scolaire courante pour afficher les salaires.
            </div>
          )}

          <Card>
            <CardContent className="p-0">
              {currentYear ? (
                <TableLayout
                  data={filteredSalaries}
                  onView={(s) => { setSelectedSalary(s); setShowDetailsModal(true); }}
                  calculate={calculateSalary}
                  onMarkPaid={handleMarkPaid}
                  onUnmarkPaid={handleUnmarkPaid}
                  hoursInput={hoursInput}
                  onHoursChange={(id: string, value: number) => setHoursInput(prev => ({ ...prev, [id]: value }))}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Calendar className="h-10 w-10" />
                  <p>Année scolaire non définie</p>
                  <p className="text-sm">Rendez-vous dans Paramètres &gt; Années scolaires pour en créer une.</p>
                </div>
              )}
            </CardContent>
          </Card>
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
        </AppLayout>
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

function TableLayout({ data, onView, calculate, onMarkPaid, onUnmarkPaid, hoursInput, onHoursChange }: any) {
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
            <th className="text-left p-4">Payé</th>
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
                <td className="p-4">
                  {s.contrat === "horaire" ? `${s.salary.toLocaleString()} FCFA/h` : calc.baseSalary.toLocaleString()}
                </td>
                <td className="p-4">
                  {s.contrat === "horaire" ? (
                    <Input
                      type="number"
                      min="0"
                      className="w-20 h-8 text-sm"
                      value={hoursInput?.[s.id] ?? 0}
                      onChange={(e) => onHoursChange?.(s.id, Number(e.target.value))}
                    />
                  ) : "-"}
                </td>
                <td className="p-4 font-bold text-green-600">{calc.total.toLocaleString()} FCFA</td>
                <td className="p-4">
                  {s.paid ? (
                    <Badge variant="default" className="bg-green-600">Payé</Badge>
                  ) : (
                    <Badge variant="secondary">Impayé</Badge>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(s)}><Eye className="h-4 w-4" /></Button>
                    {s.paid ? (
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onUnmarkPaid(s.payroll_id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-green-600" onClick={() => onMarkPaid(s.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
          <p className="text-sm">{salary.speciality_names?.join(", ") || "Non spécifiée"}</p>
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
