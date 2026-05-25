"use client"

import { useState, useMemo } from "react"
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
import {
  DollarSign,
  Search,
  CheckCircle,
  Clock,
  ArrowLeft,
  PlusCircle,
  Trash2,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useStudents } from "@/hooks/use-students"
import { usePayments, useFeeTypes } from "@/hooks/use-payments"
import { format } from "date-fns"

export default function StudentPaymentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("espèces")
  const [paymentFeeType, setPaymentFeeType] = useState("")

  const { students, isLoading: studentsLoading } = useStudents()
  const { payments, isLoading: paymentsLoading, create: createPayment, remove: removePayment, refetch: refetchPayments } = usePayments(
    selectedStudent ? { studentId: selectedStudent.id } : undefined
  )
  const { feeTypes } = useFeeTypes()

  const filtered = useMemo(() => {
    return students.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [students, searchTerm])

  const handleAddPayment = async () => {
    if (!selectedStudent || !paymentAmount) return
    await createPayment({
      studentId: Number(selectedStudent.id),
      feeTypeId: paymentFeeType ? Number(paymentFeeType) : undefined,
      amount: Number(paymentAmount),
      method: paymentMethod as any,
      date: format(new Date(), "yyyy-MM-dd"),
    })
    setPaymentAmount("")
    setShowAddPayment(false)
    refetchPayments()
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (confirm("Supprimer ce paiement ?")) {
      await removePayment(paymentId)
    }
  }

  const totalPaid = useMemo(() => {
    if (!payments.length) return 0
    return payments.reduce((sum, p) => sum + p.amount, 0)
  }, [payments])

  if (selectedStudent) {
    return (
      <AppLayout>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSelectedStudent(null)}><ArrowLeft /></Button>
              <PageHeader title={`Paiements: ${selectedStudent.firstName} ${selectedStudent.lastName}`} description={selectedStudent.className} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StatCard title="Total Frais" value="--- FCFA" icon={DollarSign} color="text-foreground" />
              <StatCard title="Déjà Payé" value={`${totalPaid.toLocaleString()} FCFA`} icon={CheckCircle} color="text-green-600" />
              <StatCard title="Reste à Payer" value="--- FCFA" icon={Clock} color="text-red-600" />
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
          </AppLayout>
    )
  }

  return (
    <AppLayout>
          <PageHeader title="Paiements Scolarité" description="Suivi financier des élèves" />

          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un élève..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {studentsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(s => (
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
                      <Badge variant="secondary">---</Badge>
                    </div>
                    <div className="mt-4 text-sm flex justify-between">
                      <span className="text-muted-foreground">Payé:</span>
                      <span className="font-bold">--- FCFA</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
