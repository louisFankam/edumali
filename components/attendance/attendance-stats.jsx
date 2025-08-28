import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCheck, UserX, Clock, Users } from "lucide-react"

export function AttendanceStats({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Élèves</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-serif font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Dans la classe</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Présents</CardTitle>
          <UserCheck className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-serif font-bold text-accent">{stats.present}</div>
          <p className="text-xs text-muted-foreground">{Math.round((stats.present / stats.total) * 100)}% du total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Retards</CardTitle>
          <Clock className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-serif font-bold text-secondary">{stats.late}</div>
          <p className="text-xs text-muted-foreground">{Math.round((stats.late / stats.total) * 100)}% du total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Absents</CardTitle>
          <UserX className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-serif font-bold text-destructive">{stats.absent}</div>
          <p className="text-xs text-muted-foreground">{Math.round((stats.absent / stats.total) * 100)}% du total</p>
        </CardContent>
      </Card>
    </div>
  )
}
