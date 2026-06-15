"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, DollarSign, Users, GraduationCap, BookOpen, Loader2, UserCheck, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useClasses } from "@/hooks/use-classes"
import { useClassSubjects } from "@/hooks/use-class-subjects"
import { useTeachers } from "@/hooks/use-teachers"
import { toast } from "sonner"

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string

  const { classes, isLoading: classesLoading } = useClasses()
  const { subjects, isLoading: subjectsLoading, assignTeacher } = useClassSubjects(classId)
  const { teachers, isLoading: teachersLoading } = useTeachers()
  const [updatingSubject, setUpdatingSubject] = useState<string | null>(null)

  const classData = useMemo(() => classes.find(c => c.id === classId), [classes, classId])

  const mainTeacher = useMemo(() => {
    if (!classData?.teacherId || !teachers.length) return null
    return teachers.find(t => t.id === classData.teacherId) || null
  }, [classData, teachers])

  const isLoading = classesLoading || subjectsLoading || teachersLoading

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (!classData) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-muted-foreground">Classe introuvable</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
          <ArrowLeft />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-4 h-8 rounded" style={{ backgroundColor: classData.color || "#6366f1" }} />
          <PageHeader title={classData.name} description={`Niveau ${classData.level || "—"}`}>
  <HelpButton section="parametres" />
</PageHeader>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Frais de scolarité"
          value={`${(classData.totalFee || 0).toLocaleString()} FCFA`}
          subtitle={classData.feeTypes?.length ? `+${classData.feeTypes.reduce((s, ft) => s + (ft.amount ?? ft.feeTypeAmount), 0).toLocaleString()}F supp.` : undefined}
          icon={DollarSign}
          color="text-green-600"
        />
        <StatCard
          title="Capacité"
          value={`${classData.capacity || 0} élèves`}
          icon={Users}
          color="text-blue-600"
        />
        <StatCard
          title="Élèves inscrits"
          value={`${classData.studentCount || 0} élèves`}
          icon={GraduationCap}
          color="text-purple-600"
        />
        <StatCard
          title="Matières"
          value={`${subjects.length} matière${subjects.length > 1 ? "s" : ""}`}
          icon={BookOpen}
          color="text-amber-600"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Professeur principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mainTeacher ? (
                <div className="space-y-2">
                  <p className="font-bold text-lg">{mainTeacher.full_name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <GraduationCap className="h-3 w-3" />
                    {mainTeacher.speciality_names?.join(", ") || "Aucune spécialité"}
                  </p>
                  {mainTeacher.phone && (
                    <p className="text-sm text-muted-foreground">{mainTeacher.phone}</p>
                  )}
                  {mainTeacher.email && (
                    <p className="text-sm text-muted-foreground">{mainTeacher.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Non assigné</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Niveau" value={classData.level?.toString() || "—"} />
              <InfoRow label="Capacité" value={`${classData.capacity || 0} places`} />
              <InfoRow label="Frais de base" value={`${(classData.totalFee || 0).toLocaleString()} FCFA`} />
              {classData.feeTypes && classData.feeTypes.length > 0 && (
                <>
                  <div className="border-t pt-2 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Frais supplémentaires</p>
                    {classData.feeTypes.map(ft => (
                      <InfoRow
                        key={ft.id}
                        label={ft.feeTypeName}
                        value={`${(ft.amount ?? ft.feeTypeAmount).toLocaleString()} FCFA`}
                      />
                    ))}
                  </div>
                  <div className="border-t pt-2 font-medium">
                    <InfoRow
                      label="Total"
                      value={`${((classData.totalFee || 0) + classData.feeTypes.reduce((s, ft) => s + (ft.amount ?? ft.feeTypeAmount), 0)).toLocaleString()} FCFA`}
                    />
                  </div>
                </>
              )}
              <InfoRow label="Statut" value={classData.status === "active" ? "Active" : "Inactive"} />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Matières assignées
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {subjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Aucune matière assignée à cette classe
                </div>
              ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matière</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Coefficient</TableHead>
                        <TableHead>Enseignant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.subjectName}</TableCell>
                          <TableCell>{s.subjectCode || "—"}</TableCell>
                          <TableCell>{s.coefficient}</TableCell>
                          <TableCell>
                            <Select
                              value={s.teacherId ?? ""}
                              onValueChange={async (val) => {
                                setUpdatingSubject(s.id)
                                try {
                                  await assignTeacher(s.subjectId, val || null)
                                } catch {
                                  toast.error("Erreur lors de l'assignation")
                                } finally {
                                  setUpdatingSubject(null)
                                }
                              }}
                              disabled={updatingSubject === s.id}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Non assigné" />
                              </SelectTrigger>
                              <SelectContent>
                                {teachers.map(t => (
                                  <SelectItem key={t.id} value={t.id}>
                                    {t.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, color }: { title: string; value: string; subtitle?: string; icon: any; color: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", color)} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", color)}>{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
