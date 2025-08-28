import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Clock, CheckCircle } from "lucide-react"

export function SalaryStats({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Masse salariale totale</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-serif font-bold">{stats.totalAmount.toLocaleString()} F</div>
          <p className="text-xs text-muted-foreground">{stats.totalSalaries} professeurs</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Salaires payés</CardTitle>
          <CheckCircle className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-serif font-bold text-accent">{stats.paidAmount.toLocaleString()} F</div>
          <p className="text-xs text-muted-foreground">{stats.paidCount} paiements effectués</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En attente</CardTitle>
          <Clock className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-serif font-bold text-secondary">{stats.pendingAmount.toLocaleString()} F</div>
          <p className="text-xs text-muted-foreground">{stats.pendingCount} paiements en attente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En traitement</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-serif font-bold">{stats.processingCount}</div>
          <p className="text-xs text-muted-foreground">Paiements en cours</p>
        </CardContent>
      </Card>
    </div>
  )
}
