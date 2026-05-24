"use client"

import { useState, useMemo } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  DollarSign, 
  Search, 
  CheckCircle, 
  Clock, 
  ArrowLeft, 
  PlusCircle, 
  Trash2 
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock Data
const MOCK_STUDENTS_PAYMENTS = [
  { 
    id: "sp_1", 
    firstName: "Amadou", 
    lastName: "Diallo", 
    class: "1ère Année", 
    totalFee: 150000, 
    totalPaid: 100000, 
    status: "Partiel",
    payments: [
      { id: "p1", date: "2024-01-10", amount: 50000, type: "Scolarité", method: "Espèces", payer: "Moussa Diallo" },
      { id: "p2", date: "2024-03-05", amount: 50000, type: "Scolarité", method: "Mobile Money", payer: "Moussa Diallo" },
    ]
  },
  { 
    id: "sp_2", 
    firstName: "Fatoumata", 
    lastName: "Traoré", 
    class: "1ère Année", 
    totalFee: 150000, 
    totalPaid: 150000, 
    status: "Payé",
    payments: [
      { id: "p3", date: "2024-01-01", amount: 150000, type: "Scolarité", method: "Chèque", payer: "Oumar Traoré" },
    ]
  },
]

export default function StudentPaymentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = useMemo(() => {
    return MOCK_STUDENTS_PAYMENTS.filter(s => 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  if (selectedStudent) {
    return (
      <AppLayout>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSelectedStudent(null)}><ArrowLeft /></Button>
              <PageHeader title={`Paiements: ${selectedStudent.firstName} ${selectedStudent.lastName}`} description={selectedStudent.class} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StatCard title="Total Frais" value={`${selectedStudent.totalFee.toLocaleString()} FCFA`} icon={DollarSign} color="text-foreground" />
              <StatCard title="Déjà Payé" value={`${selectedStudent.totalPaid.toLocaleString()} FCFA`} icon={CheckCircle} color="text-green-600" />
              <StatCard title="Reste à Payer" value={`${(selectedStudent.totalFee - selectedStudent.totalPaid).toLocaleString()} FCFA`} icon={Clock} color="text-red-600" />
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Historique</CardTitle>
                <Button size="sm"><PlusCircle className="h-4 w-4 mr-2" />Nouveau Paiement</Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Payeur</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedStudent.payments.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.date}</TableCell>
                        <TableCell className="font-bold">{p.amount.toLocaleString()} FCFA</TableCell>
                        <TableCell>{p.method}</TableCell>
                        <TableCell>{p.payer}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
                      <div className="text-xs text-muted-foreground">{s.class}</div>
                    </div>
                    <Badge variant={s.status === "Payé" ? "default" : s.status === "Partiel" ? "secondary" : "destructive"}>
                      {s.status}
                    </Badge>
                  </div>
                  <div className="mt-4 text-sm flex justify-between">
                    <span className="text-muted-foreground">Payé:</span>
                    <span className="font-bold">{s.totalPaid.toLocaleString()} / {s.totalFee.toLocaleString()} FCFA</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
