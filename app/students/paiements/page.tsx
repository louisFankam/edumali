"use client"

import { useState, useMemo, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign, Search, CheckCircle, Clock, ArrowLeft, PlusCircle, Trash2, Pencil, Loader2, ChevronLeft, ChevronRight, AlertTriangle, Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useStudents } from "@/hooks/use-students"
import { usePayments, useFeeTypes, useUnpaidStudents } from "@/hooks/use-payments"
import { useClasses } from "@/hooks/use-classes"
import { useSchoolInfo, useAcademicYears } from "@/hooks/use-settings"
import { useEnrollments } from "@/hooks/use-enrollments"
import { format } from "date-fns"
import { toast } from "sonner"

const LIMIT = 20

export default function StudentPaymentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("espèces")
  const [paymentFeeType, setPaymentFeeType] = useState("")
  const [showEditPayment, setShowEditPayment] = useState(false)
  const [editPayment, setEditPayment] = useState<any>(null)
  const [editAmount, setEditAmount] = useState("")
  const [editMethod, setEditMethod] = useState("espèces")
  const [editFeeType, setEditFeeType] = useState("")

  // Unpaid section
  const [unpaidClassFilter, setUnpaidClassFilter] = useState("all")
  const [unpaidPage, setUnpaidPage] = useState(1)

  const { currentYear } = useAcademicYears()

  const { students, total: totalStudents, isLoading: studentsLoading } = useStudents({
    classId: classFilter !== "all" ? classFilter : undefined,
    search: searchTerm || undefined,
    academicYearId: currentYear?.id,
    page,
    limit: LIMIT,
  })
  const { enrollments } = useEnrollments(
    selectedStudent && currentYear ? { studentId: selectedStudent.id, academicYearId: currentYear.id } : undefined
  )
  const enrollmentFrom = useMemo(() => {
    if (enrollments.length === 0) return undefined
    return [...enrollments].sort((a, b) => a.enrollmentDate.localeCompare(b.enrollmentDate))[0].enrollmentDate
  }, [enrollments])
  const { payments, isLoading: paymentsLoading, create: createPayment, update: updatePayment, remove: removePayment, refetch: refetchPayments } = usePayments(
    selectedStudent ? { studentId: selectedStudent.id, from: enrollmentFrom } : undefined
  )
  const { data: unpaidData, total: unpaidTotal, isLoading: unpaidLoading } = useUnpaidStudents(
    unpaidClassFilter !== "all" ? unpaidClassFilter : undefined,
    unpaidPage,
    LIMIT,
    currentYear?.id,
  )
  const { classes } = useClasses()
  const { feeTypes } = useFeeTypes()
  const { schoolInfo } = useSchoolInfo()

  const totalPages = Math.ceil(totalStudents / LIMIT)
  const unpaidTotalPages = Math.ceil(unpaidTotal / LIMIT)

  const classFee = useMemo(() => {
    if (!selectedStudent) return 0
    const cls = classes.find(c => c.id === selectedStudent.classId)
    return cls?.totalFee ?? 0
  }, [selectedStudent, classes])

  const totalPaid = useMemo(() => {
    if (!payments.length) return 0
    return payments.reduce((sum, p) => sum + p.amount, 0)
  }, [payments])

  const remaining = classFee - totalPaid

  useEffect(() => { setPage(1) }, [classFilter, searchTerm])
  useEffect(() => { setUnpaidPage(1) }, [unpaidClassFilter])

  const handleAddPayment = async () => {
    if (!selectedStudent || !paymentAmount) return
    const amount = Number(paymentAmount)
    if (totalPaid + amount > classFee) {
      toast.error(`Le total payé (${(totalPaid + amount).toLocaleString()} FCFA) dépasserait les frais de classe (${classFee.toLocaleString()} FCFA)`)
      return
    }
    try {
      const result = await createPayment({
        studentId: Number(selectedStudent.id),
        feeTypeId: paymentFeeType ? Number(paymentFeeType) : undefined,
        amount,
        method: paymentMethod as any,
        date: format(new Date(), "yyyy-MM-dd"),
      })
      if (!result.ok) throw new Error(result.message || "Erreur lors du paiement")
      toast.success("Paiement enregistré")
      setPaymentAmount("")
      setShowAddPayment(false)
      refetchPayments()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors du paiement")
    }
  }

  const handleUpdatePayment = async () => {
    if (!editPayment) return
    try {
      const result = await updatePayment(editPayment.id, {
        amount: editAmount ? Number(editAmount) : undefined,
        method: editMethod,
        feeTypeId: editFeeType ? Number(editFeeType) : undefined,
      })
      if (!result.ok) throw new Error(result.message || "Erreur lors de la modification")
      toast.success("Paiement modifié")
      setShowEditPayment(false)
      setEditPayment(null)
      refetchPayments()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de la modification")
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (confirm("Supprimer ce paiement ?")) {
      await removePayment(paymentId)
    }
  }

  const handlePrintUnpaid = () => {
    const logo = schoolInfo?.logoUrl || ""
    const schoolName = schoolInfo?.name || "Établissement"
    const schoolAddr = schoolInfo?.address || ""
    const schoolPhone = schoolInfo?.phone || ""
    const filterLabel = unpaidClassFilter !== "all"
      ? `Classe : ${classes.find(c => c.id === unpaidClassFilter)?.name || ""}`
      : "Toutes les classes"

    const rows = unpaidData.map(u => `<tr>
      <td style="border:1px solid #000;padding:2mm;font-size:9pt">${u.firstName} ${u.lastName}</td>
      <td style="border:1px solid #000;padding:2mm;text-align:center;font-size:9pt">${u.className}</td>
      <td style="border:1px solid #000;padding:2mm;text-align:right;font-size:9pt">${u.totalFee.toLocaleString()} FCFA</td>
      <td style="border:1px solid #000;padding:2mm;text-align:right;font-size:9pt">${u.totalPaid.toLocaleString()} FCFA</td>
      <td style="border:1px solid #000;padding:2mm;text-align:right;font-size:9pt;font-weight:bold">${u.remaining.toLocaleString()} FCFA</td>
    </tr>`).join("")

    const w = window.open("", "_blank")
    if (!w) return
    w.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Impayés</title>
    <style>
      @page { size: A4 portrait; margin: 8mm; }
      body { font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; margin: 0; padding: 8mm; }
      .header { text-align: center; margin-bottom: 5mm; }
      .header .logo { text-align: center; margin-bottom: 2mm; }
      .header .logo img { max-height: 18mm; object-fit: contain; }
      .header .school { font-size: 12pt; font-weight: bold; text-transform: uppercase; }
      .header .detail { font-size: 9pt; color: #333; }
      .header .title { font-size: 14pt; font-weight: bold; text-decoration: underline; margin: 3mm 0; }
      .header .subtitle { font-size: 10pt; margin-bottom: 3mm; }
      table { width: 100%; border-collapse: collapse; }
      th { border: 1px solid #000; padding: 2mm; font-size: 10pt; background: #f0f0f0; }
      td { border: 1px solid #000; padding: 2mm; font-size: 9pt; }
      .footer { margin-top: 5mm; display: flex; justify-content: space-between; font-size: 9pt; }
    </style></head><body>
      <div class="header">
        ${logo ? `<div class="logo"><img src="${logo}" alt="Logo" /></div>` : ""}
        <div class="school">${schoolName}</div>
        <div class="detail">${schoolAddr}</div>
        <div class="detail">${schoolPhone}</div>
        <div class="title">LISTE DES ÉLÈVES AVEC IMPAYÉS</div>
        <div class="subtitle">${filterLabel} — ${unpaidTotal} élève${unpaidTotal > 1 ? "s" : ""}</div>
      </div>
      <table>
        <tr><th>Élève</th><th>Classe</th><th style="text-align:right">Frais totaux</th><th style="text-align:right">Déjà payé</th><th style="text-align:right">Reste</th></tr>
        ${rows}
      </table>
      <div class="footer">
        <div>Fait à Bamako, le ...............</div>
        <div>Le Directeur<br/>${schoolInfo?.director || ""}</div>
      </div>
    </body></html>`)
    w.document.close()
    w.print()
  }

  if (selectedStudent) {
    return (
      <AppLayout>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedStudent(null)}><ArrowLeft /></Button>
          <PageHeader title={`Paiements: ${selectedStudent.firstName} ${selectedStudent.lastName}`} description={selectedStudent.className} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total Frais" value={`${classFee.toLocaleString()} FCFA`} icon={DollarSign} color="text-foreground" />
          <StatCard title="Déjà Payé" value={`${totalPaid.toLocaleString()} FCFA`} icon={CheckCircle} color="text-green-600" />
          <StatCard title="Reste à Payer" value={`${remaining.toLocaleString()} FCFA`} icon={Clock} color={`${remaining > 0 ? "text-red-600" : "text-green-600"}`} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Historique des paiements</CardTitle>
            <Button size="sm" onClick={() => setShowAddPayment(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />Nouveau Paiement
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {paymentsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun paiement</TableCell></TableRow>
                  ) : (
                    payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.date}</TableCell>
                        <TableCell className="font-bold">{p.amount.toLocaleString()} FCFA</TableCell>
                        <TableCell>{p.method}</TableCell>
                        <TableCell>{p.feeTypeName || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => { setEditPayment(p); setEditAmount(String(p.amount)); setEditMethod(p.method); setEditFeeType(p.feeTypeId || ""); setShowEditPayment(true) }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeletePayment(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau Paiement</DialogTitle>
              <DialogDescription>{selectedStudent.firstName} {selectedStudent.lastName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Montant (FCFA)</Label>
                <Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="50000" />
              </div>
              <div>
                <Label>Type de frais</Label>
                <Select value={paymentFeeType} onValueChange={setPaymentFeeType}>
                  <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                  <SelectContent>
                    {feeTypes.map(ft => (
                      <SelectItem key={ft.id} value={ft.id}>{ft.name} - {ft.amount.toLocaleString()} FCFA</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mode de paiement</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="espèces">Espèces</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="chèque">Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddPayment} className="w-full" disabled={!paymentAmount}>
                Enregistrer le paiement
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditPayment} onOpenChange={(v) => { setShowEditPayment(v); if (!v) setEditPayment(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le paiement</DialogTitle>
              <DialogDescription>{selectedStudent.firstName} {selectedStudent.lastName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Montant (FCFA)</Label>
                <Input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} placeholder="50000" />
              </div>
              <div>
                <Label>Type de frais</Label>
                <Select value={editFeeType} onValueChange={setEditFeeType}>
                  <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                  <SelectContent>
                    {feeTypes.map(ft => (
                      <SelectItem key={ft.id} value={ft.id}>{ft.name} - {ft.amount.toLocaleString()} FCFA</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mode de paiement</Label>
                <Select value={editMethod} onValueChange={setEditMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="espèces">Espèces</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="chèque">Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdatePayment} className="w-full" disabled={!editAmount}>
                Enregistrer les modifications
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <PageHeader title="Paiements Scolarité" description="Suivi financier des élèves" />

      <Tabs defaultValue="paiements" className="mt-6">
        <TabsList>
          <TabsTrigger value="paiements" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Paiements
          </TabsTrigger>
          <TabsTrigger value="impayes" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Impayés
            {unpaidTotal > 0 && (
              <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">{unpaidTotal}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paiements">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher un élève..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-full md:w-56"><SelectValue placeholder="Toutes les classes" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les classes</SelectItem>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {studentsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {students.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">Aucun élève trouvé</div>
                ) : (
                  students.map(s => (
                    <Card key={s.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStudent(s)}>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{s.firstName[0]}{s.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-bold">{s.firstName} {s.lastName}</div>
                            <div className="text-xs text-muted-foreground">{s.className}</div>
                          </div>
                          <Badge variant="secondary">{s.className}</Badge>
                        </div>
                        <div className="mt-4 text-sm flex justify-between">
                          <span className="text-muted-foreground">Frais:</span>
                          <span className="font-bold">{(() => { const c = classes.find(cl => cl.id === s.classId); return c?.totalFee ? `${c.totalFee.toLocaleString()} FCFA` : "---"; })()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="impayes">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-end">
                <Select value={unpaidClassFilter} onValueChange={setUnpaidClassFilter}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Toutes les classes" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les classes</SelectItem>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-sm">
                    {unpaidTotal > 0 ? `${unpaidTotal} élève${unpaidTotal > 1 ? "s" : ""} avec impayés` : "Élèves avec impayés"}
                  </CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={handlePrintUnpaid} disabled={unpaidData.length === 0}>
                  <Download className="h-4 w-4 mr-2" /> Télécharger
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {unpaidLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : unpaidData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Aucun impayé pour cette sélection</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Élève</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead className="text-right">Frais totaux</TableHead>
                        <TableHead className="text-right">Déjà payé</TableHead>
                        <TableHead className="text-right">Reste</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unpaidData.map(u => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                          <TableCell>{u.className}</TableCell>
                          <TableCell className="text-right">{u.totalFee.toLocaleString()} FCFA</TableCell>
                          <TableCell className="text-right">{u.totalPaid.toLocaleString()} FCFA</TableCell>
                          <TableCell className="text-right font-bold text-red-600">{u.remaining.toLocaleString()} FCFA</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {unpaidTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 p-4 border-t">
                      <Button variant="outline" size="sm" disabled={unpaidPage <= 1} onClick={() => setUnpaidPage(p => p - 1)}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                      </Button>
                      <span className="text-sm text-muted-foreground">Page {unpaidPage} / {unpaidTotalPages}</span>
                      <Button variant="outline" size="sm" disabled={unpaidPage >= unpaidTotalPages} onClick={() => setUnpaidPage(p => p + 1)}>
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", color)} />
      </CardHeader>
      <CardContent><div className={cn("text-2xl font-bold", color)}>{value}</div></CardContent>
    </Card>
  )
}
