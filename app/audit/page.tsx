"use client"

import { useState, useEffect, useCallback, Fragment } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ClipboardList, Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

const TABLE_LABELS: Record<string, string> = {
  students: "Élèves",
  classes: "Classes",
  teachers: "Professeurs",
  teacher_attendance: "Présence profs",
  payroll: "Paies",
  enrollments: "Inscriptions",
  evaluations: "Évaluations",
  grades: "Notes",
  attendance: "Présence élèves",
  class_subjects: "Matières-classe",
  family_infos: "Famille",
  medical_infos: "Médical",
  fee_types: "Types frais",
  payments: "Paiements",
  expenses: "Dépenses",
  school_events: "Calendrier",
  academic_years: "Années scolaires",
  subjects: "Matières",
  teacher_subjects: "Profs-matières",
  school_info: "École",
  academic_histories: "Historique académique",
  closed_periods: "Périodes",
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  create: { label: "Création", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  update: { label: "Modification", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  delete: { label: "Suppression", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
}

interface AuditEntry {
  id: number
  tableName: string
  recordId: number
  action: string
  userId: number | null
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  createdAt: string
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const [filterTable, setFilterTable] = useState("")
  const [filterAction, setFilterAction] = useState("")
  const [filterFrom, setFilterFrom] = useState("")
  const [filterTo, setFilterTo] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterTable) params.set("tableName", filterTable)
      if (filterAction) params.set("action", filterAction)
      if (filterFrom) params.set("from", filterFrom)
      if (filterTo) params.set("to", filterTo)
      params.set("page", String(page))
      params.set("limit", String(limit))

      const res = await fetch(`/api/audit?${params.toString()}`)
      const json = await res.json()
      if (json.ok) {
        setLogs(json.data ?? [])
        setTotal(json.total ?? 0)
      }
    } catch {
      setLogs([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [filterTable, filterAction, filterFrom, filterTo, page, limit])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const handleFilter = () => { setPage(1); fetchLogs() }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Journal d'activité"
          description="Consultez l'historique de toutes les actions réalisées dans l'application."
        >
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Table</label>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={filterTable}
                  onChange={(e) => setFilterTable(e.target.value)}
                >
                  <option value="">Toutes les tables</option>
                  {Object.entries(TABLE_LABELS).sort(([, a], [, b]) => a.localeCompare(b)).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Action</label>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                >
                  <option value="">Toutes les actions</option>
                  <option value="create">Création</option>
                  <option value="update">Modification</option>
                  <option value="delete">Suppression</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Du</label>
                <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Au</label>
                <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="h-9" />
              </div>
              <Button size="sm" onClick={handleFilter}>
                <Search className="h-4 w-4 mr-1" />
                Filtrer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                Chargement...
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mb-3 opacity-40" />
                <p>Aucune activité enregistrée</p>
                <p className="text-sm">Essayez de modifier les filtres</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Date / Heure</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right w-24">ID</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((entry) => (
                    <Fragment key={entry.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleExpand(entry.id)}
                      >
                        <TableCell className="font-mono text-sm">
                          {new Date(entry.createdAt).toLocaleString("fr-FR", {
                            day: "2-digit", month: "2-digit", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          {TABLE_LABELS[entry.tableName] ?? entry.tableName}
                        </TableCell>
                        <TableCell>
                          <Badge className={ACTION_LABELS[entry.action]?.color ?? ""} variant="outline">
                            {ACTION_LABELS[entry.action]?.label ?? entry.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {entry.recordId === 0 ? "–" : entry.recordId}
                        </TableCell>
                        <TableCell className="text-right">
                          {(entry.oldValues || entry.newValues) && (
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              {expandedId === entry.id ? "Masquer" : "Détails"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedId === entry.id && (
                        <TableRow key={`${entry.id}-details`}>
                          <TableCell colSpan={5} className="bg-muted/30 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {entry.oldValues && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Anciennes valeurs</p>
                                  <pre className="text-xs bg-background border rounded p-2 overflow-auto max-h-40 font-mono">
                                    {JSON.stringify(entry.oldValues, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {entry.newValues && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Nouvelles valeurs</p>
                                  <pre className="text-xs bg-background border rounded p-2 overflow-auto max-h-40 font-mono">
                                    {JSON.stringify(entry.newValues, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {total > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} entrée{total > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
              >
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
