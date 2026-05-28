"use client"

import { useState, useMemo, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  Search, DollarSign, TrendingUp,
  Plus, Eye, CreditCard, Download, Trash2, Loader2, ArrowUpRight, ArrowDownRight, Pencil, Lock,
} from "lucide-react"
import { useAcademicYears } from "@/hooks/use-settings"
import { useStudents } from "@/hooks/use-students"
import { usePayments, useFeeTypes } from "@/hooks/use-payments"
import { useExpenses } from "@/hooks/use-expenses"
import { usePayroll } from "@/hooks/use-teachers"
import { useClasses } from "@/hooks/use-classes"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { usePeriods } from "@/hooks/use-periods"
import { format } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const CATEGORIES = [
  { value: "eau", label: "Eau" },
  { value: "electricite", label: "Électricité" },
  { value: "fournitures", label: "Fournitures" },
  { value: "entretien", label: "Entretien" },
  { value: "transport", label: "Transport" },
  { value: "equipement", label: "Équipement" },
  { value: "salaires", label: "Salaires" },
  { value: "autres", label: "Autres" },
]

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#a3e635"]

export default function FinancesPage() {
  const today = format(new Date(), "yyyy-MM-dd")

  // Date range filter
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const { currentYear } = useAcademicYears()

  // Auto-set date range from current academic year (when dates are empty)
  useEffect(() => {
    if (currentYear && !dateFrom && !dateTo) {
      setDateFrom(currentYear.startDate)
      setDateTo(currentYear.endDate)
    }
  }, [currentYear, dateFrom, dateTo])

  // Revenus
  const [searchTerm, setSearchTerm] = useState("")
  const { students, isLoading: studentsLoading } = useStudents()
  const { payments, isLoading: paymentsLoading, create: createPayment, update: updatePayment, remove: removePayment, refetch: refetchPayments } = usePayments({ from: dateFrom || undefined, to: dateTo || undefined })
  const { classes } = useClasses()
  const { feeTypes } = useFeeTypes()

  const LIMIT = 20

  // Dépenses
  const [expSearch, setExpSearch] = useState("")
  const [expCatFilter, setExpCatFilter] = useState("all")
  const [expPage, setExpPage] = useState(1)
  const [showSalaries, setShowSalaries] = useState(true)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [expDesc, setExpDesc] = useState("")
  const [expAmount, setExpAmount] = useState("")
  const [expCategory, setExpCategory] = useState("autres")
  const [expCategoryCustom, setExpCategoryCustom] = useState("")
  const [expDate, setExpDate] = useState(today)
  const [expNotes, setExpNotes] = useState("")
  const { expenses, isLoading: expLoading, create: createExpense, update: updateExpense, remove: removeExpense } = useExpenses({ from: dateFrom || undefined, to: dateTo || undefined })
  const { records: payrollRecords } = usePayroll(currentYear ? { from: currentYear.startDate, to: currentYear.endDate } : undefined)

  // Edit expense
  const [showEditExpense, setShowEditExpense] = useState(false)
  const [editExpenseId, setEditExpenseId] = useState(null)
  const [editExpDesc, setEditExpDesc] = useState("")
  const [editExpAmount, setEditExpAmount] = useState("")
  const [editExpCategory, setEditExpCategory] = useState("autres")
  const [editExpCategoryCustom, setEditExpCategoryCustom] = useState("")
  const [editExpDate, setEditExpDate] = useState(today)
  const [editExpNotes, setEditExpNotes] = useState("")

  // Edit payment
  const [showEditPayment, setShowEditPayment] = useState(false)
  const [editPaymentId, setEditPaymentId] = useState(null)
  const [editPayAmount, setEditPayAmount] = useState("")
  const [editPayMethod, setEditPayMethod] = useState("espèces")
  const [editPayFeeType, setEditPayFeeType] = useState("")

  // Flux
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [payAmount, setPayAmount] = useState("")
  const [payMethod, setPayMethod] = useState("espèces")
  const [payFeeType, setPayFeeType] = useState("")

  // Dashboard data (server-side aggregated)
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData({ from: dateFrom || undefined, to: dateTo || undefined })

  // Period management
  const { periods, close: closePeriod, open: openPeriod, isClosed } = usePeriods()
  const [showPeriodDialog, setShowPeriodDialog] = useState(false)
  const [closeMonth, setCloseMonth] = useState(new Date().getMonth() + 1)
  const [closeYear, setCloseYear] = useState(new Date().getFullYear())
  const [periodMsg, setPeriodMsg] = useState("")

  // Payroll → expense-like items
  const payrollAsExpenses = useMemo(() => {
    return (payrollRecords || []).map(r => ({
      id: `payroll-${r.id}`,
      description: r.teacher ? `Salaire: ${r.first_name || r.teacher?.first_name} ${r.last_name || r.teacher?.last_name}` : `Salaire #${r.id}`,
      amount: (r.amount || 0) + (r.bonus || 0) - (r.deductions || 0),
      category: "salaires",
      categoryLabel: "Salaires",
      categoryCustom: null,
      date: r.paid_at || `${r.year}-${String(r.month).padStart(2, "0")}-01`,
      notes: r.notes || null,
      _payroll: true,
    }))
  }, [payrollRecords])

  // Computed
  const paymentsByStudent = useMemo(() => {
    const map = {}
    payments.forEach(p => { map[p.studentId] = (map[p.studentId] || 0) + p.amount })
    return map
  }, [payments])

  const displayExpenses = useMemo(() => {
    return showSalaries ? [...expenses, ...payrollAsExpenses] : expenses
  }, [expenses, payrollAsExpenses, showSalaries])

  const totalRevenue = dashboardData?.totals?.totalRevenue ?? 0
  const totalExpenses = dashboardData?.totals?.totalExpenses ?? 0
  const netBalance = dashboardData?.totals?.netBalance ?? 0
  const monthlyChartData = dashboardData?.monthly ?? []
  const pieData = dashboardData?.pieData ?? []

  // Flux du mois (from the last month in chart data)
  const lastMonth = monthlyChartData.length > 0 ? monthlyChartData[monthlyChartData.length - 1] : null
  const monthPayTotal = lastMonth?.Revenus ?? 0
  const monthExpTotal = lastMonth?.Dépenses ?? 0

  // Payments tab
  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments
    const term = searchTerm.toLowerCase()
    return payments.filter(p => (p.studentName || "").toLowerCase().includes(term))
  }, [payments, searchTerm])

  const filteredExpenses = useMemo(() => {
    return displayExpenses.filter(e => {
      const ms = e.description.toLowerCase().includes(expSearch.toLowerCase())
      const mc = expCatFilter === "all" || e.category === expCatFilter
      return ms && mc
    })
  }, [displayExpenses, expSearch, expCatFilter])

  // Reset page when filters change
  useEffect(() => { setExpPage(1) }, [expSearch, expCatFilter])

  const paginatedExpenses = useMemo(() => {
    const start = (expPage - 1) * LIMIT
    return filteredExpenses.slice(start, start + LIMIT)
  }, [filteredExpenses, expPage])
  const expTotalPages = Math.max(1, Math.ceil(filteredExpenses.length / LIMIT))

  // Paiements récents pagination
  const [payPage, setPayPage] = useState(1)
  useEffect(() => { setPayPage(1) }, [searchTerm])
  const paginatedPayments = useMemo(() => {
    const start = (payPage - 1) * LIMIT
    return filteredPayments.slice(start, start + LIMIT)
  }, [filteredPayments, payPage])
  const payTotalPages = Math.max(1, Math.ceil(filteredPayments.length / LIMIT))

  // Flux
  const [fluxShowAll, setFluxShowAll] = useState(false)
  const cashFlow = useMemo(() => {
    const rows = []
    payments.forEach(p => {
      rows.push({ date: p.date, desc: `Paiement: ${p.studentName || "Élève"}`, type: "revenu", amount: p.amount, id: `pay-${p.id}` })
    })
    expenses.forEach(e => {
      const catLabel = CATEGORIES.find(c => c.value === e.category)?.label || e.categoryCustom || e.category
      rows.push({ date: e.date, desc: `${catLabel}: ${e.description}`, type: "depense", amount: -e.amount, id: `exp-${e.id}` })
    })
    payrollAsExpenses.forEach(r => {
      rows.push({ date: r.date, desc: r.description, type: "depense", amount: -r.amount, id: r.id })
    })
    rows.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
    let balance = 0
    return rows.map(r => {
      balance += r.amount
      return { ...r, balance }
    })
  }, [payments, expenses, payrollAsExpenses])

  const handleRecordPayment = async () => {
    if (!selectedStudent || !payAmount) return
    await createPayment({
      studentId: Number(selectedStudent.id),
      feeTypeId: payFeeType ? Number(payFeeType) : undefined,
      amount: Number(payAmount),
      method: payMethod,
      date: today,
    })
    setPayAmount(""); setPayFeeType(""); setShowPaymentModal(false); refetchPayments()
  }

  const handleAddExpense = async () => {
    if (!expDesc || !expAmount) return
    await createExpense({
      description: expDesc,
      amount: Number(expAmount),
      category: expCategory,
      categoryCustom: expCategory === "autres" ? expCategoryCustom : undefined,
      date: expDate,
      notes: expNotes || undefined,
    })
    setExpDesc(""); setExpAmount(""); setExpCategory("autres"); setExpCategoryCustom("")
    setExpDate(today); setExpNotes(""); setShowAddExpense(false)
  }

  const openEditExpense = (e) => {
    setEditExpenseId(e.id)
    setEditExpDesc(e.description)
    setEditExpAmount(String(e.amount))
    setEditExpCategory(e.category === "salaires" ? "autres" : e.category)
    setEditExpCategoryCustom(e.categoryCustom || "")
    setEditExpDate(e.date)
    setEditExpNotes(e.notes || "")
    setShowEditExpense(true)
  }

  const handleEditExpense = async () => {
    if (!editExpenseId || !editExpDesc || !editExpAmount) return
    await updateExpense(editExpenseId, {
      description: editExpDesc,
      amount: Number(editExpAmount),
      category: editExpCategory,
      categoryCustom: editExpCategory === "autres" ? editExpCategoryCustom : undefined,
      date: editExpDate,
      notes: editExpNotes || undefined,
    })
    setShowEditExpense(false)
  }

  const openEditPayment = (p) => {
    setEditPaymentId(p.id)
    setEditPayAmount(String(p.amount))
    setEditPayMethod(p.method)
    setEditPayFeeType(p.feeTypeId || "")
    setShowEditPayment(true)
  }

  const handleEditPayment = async () => {
    if (!editPaymentId || !editPayAmount) return
    await updatePayment(editPaymentId, {
      amount: Number(editPayAmount),
      method: editPayMethod,
      feeTypeId: editPayFeeType ? Number(editPayFeeType) : undefined,
    })
    setShowEditPayment(false)
  }

  const exportPaymentsCSV = () => {
    const h = ["Date", "Élève", "Montant", "Mode", "Type"]
    const r = filteredPayments.map(p => [p.date, p.studentName || "N/A", p.amount, p.method, p.feeTypeName || "-"])
    const csv = [h.join(","), ...r.map(r => r.join(","))].join("\n")
    const b = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(b)
    a.download = `paiements-${today}.csv`; a.click(); URL.revokeObjectURL(a.href)
  }

  const exportExpensesCSV = () => {
    const h = ["Date", "Description", "Catégorie", "Montant", "Notes"]
    const r = filteredExpenses.map(e => [e.date, e.description, e.categoryLabel, e.amount, e.notes || ""])
    const csv = [h.join(","), ...r.map(r => r.join(","))].join("\n")
    const b = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(b)
    a.download = `depenses-${today}.csv`; a.click(); URL.revokeObjectURL(a.href)
  }

  const exportCashFlowCSV = () => {
    const h = ["Date", "Description", "Type", "Montant", "Solde"]
    const r = cashFlow.map(f => [f.date, f.desc, f.type, Math.abs(f.amount), f.balance])
    const csv = [h.join(","), ...r.map(r => r.join(","))].join("\n")
    const b = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(b)
    a.download = `flux-tresorerie-${today}.csv`; a.click(); URL.revokeObjectURL(a.href)
  }

  const exportMonthlyReportCSV = () => {
    const rows = [
      ["Rapport Mensuel - " + today],
      [""],
      ["COMPTE DE RÉSULTAT"],
      ["Revenus totaux", totalRevenue],
      ["Dépenses totales", totalExpenses],
      ["Résultat net", netBalance],
      [""],
      ["RÉPARTITION DÉPENSES PAR CATÉGORIE"],
      ...pieData.map(d => [d.name, d.value]),
      [""],
      ["ÉVOLUTION (6 MOIS)"],
      ["Mois", "Revenus", "Dépenses"],
      ...monthlyChartData.map(m => [m.month, m.Revenus, m.Dépenses]),
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const b = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(b)
    a.download = `rapport-mensuel-${today}.csv`; a.click(); URL.revokeObjectURL(a.href)
  }

  const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA"

  const isLoading = studentsLoading || paymentsLoading

  return (
    <AppLayout>
      <PageHeader title="Trésorerie" description="Revenus, dépenses et flux de trésorerie">
  <HelpButton section="tresorerie" />
</PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Global date filter */}
          <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-muted/30 rounded-lg">
            <Label className="text-sm font-medium">Période</Label>
            <Input type="date" className="w-auto" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <span className="text-muted-foreground">—</span>
            <Input type="date" className="w-auto" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={() => { setDateFrom(""); setDateTo("") }}>
                Réinitialiser
              </Button>
            )}
            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={() => setShowPeriodDialog(true)}>
                <Lock className="h-4 w-4 mr-1" />Clôtures
              </Button>
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
              <TabsTrigger value="fees">Revenus</TabsTrigger>
              <TabsTrigger value="expenses">Dépenses</TabsTrigger>
              <TabsTrigger value="cashflow">Flux</TabsTrigger>
            </TabsList>

            {/* === DASHBOARD === */}
            <TabsContent value="dashboard" className="space-y-4">
              {dashboardLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenus</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{fmt(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">{dashboardData?.totals?.revenueCount || 0} paiements</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Dépenses</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{fmt(totalExpenses)}</div>
                        <p className="text-xs text-muted-foreground">{dashboardData?.totals?.expenseCount || 0} dépenses</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Solde Net</CardTitle>
                        <DollarSign className={`h-4 w-4 ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`} />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {fmt(netBalance)}
                        </div>
                        <p className="text-xs text-muted-foreground">revenus - dépenses</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Flux (dernier mois)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{fmt(monthPayTotal - monthExpTotal)}</div>
                        <p className="text-xs text-muted-foreground">
                          +{fmt(monthPayTotal)} / -{fmt(monthExpTotal)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader><CardTitle>Revenus vs Dépenses (6 mois)</CardTitle></CardHeader>
                      <CardContent>
                        {monthlyChartData.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">Aucune donnée</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyChartData}>
                              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} />
                              <Tooltip formatter={(v) => fmt(v)} />
                              <Legend />
                              <Bar dataKey="Revenus" fill="#22c55e" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Répartition des dépenses</CardTitle></CardHeader>
                      <CardContent>
                        {pieData.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">Aucune dépense</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                              </Pie>
                              <Tooltip formatter={(v) => fmt(v)} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* === REVENUS (paiements) === */}
            <TabsContent value="fees" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Filtres</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input placeholder="Rechercher par élève..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Button variant="outline" onClick={exportPaymentsCSV}><Download className="h-4 w-4 mr-2" />CSV</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Paiements</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>Date</TableHead><TableHead>Élève</TableHead><TableHead>Montant</TableHead><TableHead>Mode</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun paiement</TableCell></TableRow>
                      ) : (
                        paginatedPayments.map(p => {
                          const closed = isClosed(p.date)
                          return (
                            <TableRow key={p.id} className={closed ? "opacity-60" : ""}>
                              <TableCell>{p.date}{closed && <Lock className="h-3 w-3 inline ml-1 text-muted-foreground" />}</TableCell>
                              <TableCell className="font-medium">{p.studentName || "N/A"}</TableCell>
                              <TableCell className="font-bold">{fmt(p.amount)}</TableCell>
                              <TableCell>{p.method}</TableCell>
                              <TableCell>{p.feeTypeName || "-"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  {!closed && (
                                    <Button variant="ghost" size="sm" onClick={() => openEditPayment(p)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {!closed && (
                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => { if (confirm("Supprimer ?")) await removePayment(p.id) }}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                {filteredPayments.length > LIMIT && (
                  <CardContent className="border-t py-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{filteredPayments.length} résultat(s) · Page {payPage}/{payTotalPages}</span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled={payPage <= 1} onClick={() => setPayPage(p => p - 1)}>Précédent</Button>
                        <Button variant="outline" size="sm" disabled={payPage >= payTotalPages} onClick={() => setPayPage(p => p + 1)}>Suivant</Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            {/* === DÉPENSES === */}
            <TabsContent value="expenses" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Filtres</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input placeholder="Rechercher une dépense..." className="pl-10" value={expSearch} onChange={e => setExpSearch(e.target.value)} />
                    </div>
                    <Select value={expCatFilter} onValueChange={setExpCatFilter}>
                      <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Switch id="show-salaries" checked={showSalaries} onCheckedChange={setShowSalaries} />
                      <Label htmlFor="show-salaries" className="text-sm whitespace-nowrap">Salaires</Label>
                    </div>
                    <Button onClick={() => setShowAddExpense(true)}><Plus className="h-4 w-4 mr-2" />Nouvelle dépense</Button>
                    <Button variant="outline" onClick={exportExpensesCSV}><Download className="h-4 w-4 mr-2" />CSV</Button>
                    <Button variant="outline" onClick={exportMonthlyReportCSV}><Download className="h-4 w-4 mr-2" />Rapport mensuel</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Montant</TableHead><TableHead>Notes</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune dépense</TableCell></TableRow>
                      ) : (
                        paginatedExpenses.map(e => {
                          const closed = !e._payroll && isClosed(e.date)
                          return (
                            <TableRow key={e.id} className={closed ? "opacity-60" : ""}>
                              <TableCell>{e.date}{closed && <Lock className="h-3 w-3 inline ml-1 text-muted-foreground" />}</TableCell>
                              <TableCell className="font-medium">{e.description}</TableCell>
                              <TableCell><Badge variant="secondary">{e.categoryLabel}</Badge></TableCell>
                              <TableCell className="text-right text-red-600 font-semibold">{fmt(e.amount)}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">{e.notes || "-"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  {!e._payroll && !closed && (
                                    <Button variant="ghost" size="sm" onClick={() => openEditExpense(e)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {!closed && (
                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => { if (confirm("Supprimer cette dépense ?")) await removeExpense(e.id) }}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                {filteredExpenses.length > LIMIT && (
                  <CardContent className="border-t py-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{filteredExpenses.length} résultat(s) · Page {expPage}/{expTotalPages}</span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled={expPage <= 1} onClick={() => setExpPage(p => p - 1)}>Précédent</Button>
                        <Button variant="outline" size="sm" disabled={expPage >= expTotalPages} onClick={() => setExpPage(p => p + 1)}>Suivant</Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nouvelle dépense</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Description *</Label><Input value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Facture d'électricité" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Montant (FCFA) *</Label><Input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="50000" /></div>
                      <div><Label>Date</Label><Input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} /></div>
                    </div>
                    <div><Label>Catégorie</Label>
                      <Select value={expCategory} onValueChange={setExpCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {expCategory === "autres" && (
                      <div><Label>Catégorie personnalisée</Label><Input value={expCategoryCustom} onChange={e => setExpCategoryCustom(e.target.value)} placeholder="Ex: Communication" /></div>
                    )}
                    <div><Label>Notes</Label><Textarea value={expNotes} onChange={e => setExpNotes(e.target.value)} /></div>
                    <Button onClick={handleAddExpense} className="w-full" disabled={!expDesc || !expAmount}>Ajouter</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showEditExpense} onOpenChange={setShowEditExpense}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Modifier la dépense</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Description *</Label><Input value={editExpDesc} onChange={e => setEditExpDesc(e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Montant (FCFA) *</Label><Input type="number" value={editExpAmount} onChange={e => setEditExpAmount(e.target.value)} /></div>
                      <div><Label>Date</Label><Input type="date" value={editExpDate} onChange={e => setEditExpDate(e.target.value)} /></div>
                    </div>
                    <div><Label>Catégorie</Label>
                      <Select value={editExpCategory} onValueChange={setEditExpCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {editExpCategory === "autres" && (
                      <div><Label>Catégorie personnalisée</Label><Input value={editExpCategoryCustom} onChange={e => setEditExpCategoryCustom(e.target.value)} /></div>
                    )}
                    <div><Label>Notes</Label><Textarea value={editExpNotes} onChange={e => setEditExpNotes(e.target.value)} /></div>
                    <Button onClick={handleEditExpense} className="w-full" disabled={!editExpDesc || !editExpAmount}>Enregistrer</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* === FLUX DE TRÉSORERIE === */}
            <TabsContent value="cashflow" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {cashFlow.length} transactions · Solde final : <span className={`font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(netBalance)}</span>
                </p>
                <div className="flex gap-2">
                  {!fluxShowAll && cashFlow.length > 200 && (
                    <Button variant="outline" size="sm" onClick={() => setFluxShowAll(true)}>Tout afficher ({cashFlow.length})</Button>
                  )}
                  <Button variant="outline" size="sm" onClick={exportCashFlowCSV}><Download className="h-4 w-4 mr-2" />CSV</Button>
                </div>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto" style={{ maxHeight: fluxShowAll ? "none" : "70vh" }}>
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Type</TableHead>
                          <TableHead className="text-right">Montant</TableHead><TableHead className="text-right">Solde</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cashFlow.length === 0 ? (
                          <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucune transaction</TableCell></TableRow>
                        ) : (
                          (fluxShowAll ? cashFlow : cashFlow.slice(-200)).map((r, i) => (
                            <TableRow key={i}>
                              <TableCell>{r.date}</TableCell>
                              <TableCell className="font-medium">{r.desc}</TableCell>
                              <TableCell>
                                {r.type === "revenu" ? (
                                  <Badge variant="default" className="bg-green-600">Revenu</Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">Dépense</Badge>
                                )}
                              </TableCell>
                              <TableCell className={`text-right font-semibold ${r.type === "revenu" ? "text-green-600" : "text-red-600"}`}>
                                {r.type === "revenu" ? "+" : ""}{fmt(Math.abs(r.amount))}
                              </TableCell>
                              <TableCell className={`text-right font-bold ${r.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {fmt(r.balance)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Payment modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedStudent.firstName} {selectedStudent.lastName} · {selectedStudent.className}</p>
              <div><Label>Montant (FCFA)</Label><Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="50000" /></div>
              <div><Label>Type de frais</Label>
                <Select value={payFeeType} onValueChange={setPayFeeType}>
                  <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                  <SelectContent>{feeTypes.map(ft => <SelectItem key={ft.id} value={ft.id}>{ft.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Mode</Label>
                <Select value={payMethod} onValueChange={setPayMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="espèces">Espèces</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="chèque">Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleRecordPayment} className="w-full" disabled={!payAmount}>Enregistrer</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit payment modal */}
      <Dialog open={showEditPayment} onOpenChange={setShowEditPayment}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier le paiement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Montant (FCFA) *</Label><Input type="number" value={editPayAmount} onChange={e => setEditPayAmount(e.target.value)} /></div>
            <div><Label>Type de frais</Label>
              <Select value={editPayFeeType} onValueChange={setEditPayFeeType}>
                <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                <SelectContent>{feeTypes.map(ft => <SelectItem key={ft.id} value={ft.id}>{ft.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Mode</Label>
              <Select value={editPayMethod} onValueChange={setEditPayMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="espèces">Espèces</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="virement">Virement</SelectItem>
                  <SelectItem value="chèque">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleEditPayment} className="w-full" disabled={!editPayAmount}>Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Facture</DialogTitle></DialogHeader>
          {selectedStudent && (() => {
            const s = selectedStudent; const cls = classes.find(c => c.id === s.classId)
            const totalFee = cls?.totalFee ?? 0; const paid = paymentsByStudent[s.id] || 0
            const remaining = Math.max(0, totalFee - paid)
            const sp = payments.filter(p => p.studentId === s.id)
            return (
              <div className="space-y-6">
                <Card><CardHeader className="text-center"><CardTitle className="text-xl">FACTURE SCOLAIRE</CardTitle><p className="text-sm text-muted-foreground">{s.firstName} {s.lastName} · {s.className} · {today}</p></CardHeader></Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card><CardHeader><CardTitle>Élève</CardTitle></CardHeader><CardContent className="text-sm"><p><span className="text-muted-foreground">Nom:</span> {s.firstName} {s.lastName}</p><p><span className="text-muted-foreground">Classe:</span> {s.className}</p></CardContent></Card>
                  <Card><CardHeader><CardTitle>Parent</CardTitle></CardHeader><CardContent className="text-sm"><p><span className="text-muted-foreground">Nom:</span> {s.parentName}</p><p><span className="text-muted-foreground">Tél:</span> {s.parentPhone}</p></CardContent></Card>
                </div>
                <Card><CardHeader><CardTitle>Résumé</CardTitle></CardHeader><CardContent><div className="space-y-2"><div className="flex justify-between"><span>Total des frais</span><span className="font-bold">{fmt(totalFee)}</span></div><div className="flex justify-between"><span>Payé</span><span className="font-bold text-green-600">{fmt(paid)}</span></div><hr /><div className="flex justify-between text-xl"><span className="font-bold">Solde</span><span className={`font-bold ${remaining > 0 ? "text-red-600" : "text-green-600"}`}>{fmt(remaining)}</span></div></div></CardContent></Card>
                {sp.length > 0 && (
                  <Card><CardHeader><CardTitle>Historique</CardTitle></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Montant</TableHead><TableHead>Mode</TableHead></TableRow></TableHeader><TableBody>{sp.map(p => <TableRow key={p.id}><TableCell>{p.date}</TableCell><TableCell className="font-semibold text-green-600">{fmt(p.amount)}</TableCell><TableCell>{p.method}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
                )}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Period management dialog */}
      <Dialog open={showPeriodDialog} onOpenChange={setShowPeriodDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Gestion des clôtures</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {periods.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground">Périodes clôturées</Label>
                <div className="space-y-1 mt-1">
                  {periods.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-muted/50 rounded px-3 py-1.5 text-sm">
                      <span>{p.month}/{p.year}</span>
                      <Button variant="ghost" size="sm" onClick={async () => { await openPeriod(p.month, p.year); setPeriodMsg("") }}>
                        Rouvrir
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="border-t pt-3">
              <Label>Clôturer un mois</Label>
              <div className="flex gap-2 mt-1">
                <Input type="number" placeholder="Mois" min={1} max={12} value={closeMonth} onChange={e => setCloseMonth(Number(e.target.value))} className="w-20" />
                <Input type="number" placeholder="Année" min={2020} max={2100} value={closeYear} onChange={e => setCloseYear(Number(e.target.value))} className="w-24" />
                <Button size="sm" onClick={async () => {
                  const res = await closePeriod(closeMonth, closeYear)
                  if (res.ok) setPeriodMsg("Période clôturée")
                  else setPeriodMsg(res.message || "Erreur")
                }}>Clôturer</Button>
              </div>
              {periodMsg && <p className="text-xs text-muted-foreground mt-1">{periodMsg}</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
