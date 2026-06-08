"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Loader2, GraduationCap, X, Plus, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Teacher {
  id: string
  firstName: string
  lastName: string
  fullName: string
}

interface SubjectDetail {
  id: string
  name: string
  code: string
  coefficient: number
  hoursPerWeek: number
  description: string
  color: string
  status: string
  teachers: Teacher[]
  teacherNumber: number
}

export default function SubjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.id as string

  const [subject, setSubject] = useState<SubjectDetail | null>(null)
  const [allTeachers, setAllTeachers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const [subRes, teachRes] = await Promise.all([
        fetch(`/api/subjects/${subjectId}`),
        fetch(`/api/subjects/${subjectId}/teachers`),
      ])
      const subJson = await subRes.json()
      const teachJson = await teachRes.json()
      if (subJson.ok) setSubject(subJson.data)
      if (teachJson.ok) setAllTeachers(teachJson.data)
    } catch (e) {
      console.error("Erreur chargement:", e)
    } finally {
      setIsLoading(false)
    }
  }, [subjectId])

  useEffect(() => { load() }, [load])

  const assignedTeacherIds = new Set(subject?.teachers.map(t => t.id) ?? [])

  const availableTeachers = allTeachers.filter(t => !assignedTeacherIds.has(t.id))

  const addTeacher = async (teacherId: string) => {
    setIsSaving(true)
    try {
      const ids = [...(subject?.teachers.map(t => t.id) ?? []), teacherId]
      const res = await fetch(`/api/subjects/${subjectId}/teachers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherIds: ids }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.message || "Erreur")
      toast.success("Enseignant ajouté")
      await load()
    } catch (e: any) {
      toast.error(e.message ?? "Erreur lors de l'ajout")
    } finally {
      setIsSaving(false)
    }
  }

  const removeTeacher = async (teacherId: string) => {
    setIsSaving(true)
    try {
      const ids = (subject?.teachers.map(t => t.id) ?? []).filter(id => id !== teacherId)
      const res = await fetch(`/api/subjects/${subjectId}/teachers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherIds: ids }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.message || "Erreur")
      toast.success("Enseignant retiré")
      await load()
    } catch (e: any) {
      toast.error(e.message ?? "Erreur lors du retrait")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (!subject) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-muted-foreground">Matière introuvable</div>
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
          <div className="w-4 h-8 rounded" style={{ backgroundColor: subject.color || "#6366f1" }} />
          <PageHeader title={subject.name} description={`Code: ${subject.code || "—"}`}>
            <HelpButton section="parametres" />
          </PageHeader>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Coefficient" value={String(subject.coefficient)} />
              <InfoRow label="Heures/semaine" value={`${subject.hoursPerWeek}h`} />
              <InfoRow
                label="Statut"
                value={
                  <Badge variant={subject.status === "Actif" ? "default" : "secondary"}>
                    {subject.status === "Actif" ? "Active" : "Inactive"}
                  </Badge>
                }
              />
              <InfoRow label="Enseignants" value={`${subject.teacherNumber} professeur${subject.teacherNumber > 1 ? "s" : ""}`} />
              {subject.description && (
                <div className="text-sm text-muted-foreground pt-2 border-t">
                  {subject.description}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Enseignants assignés
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subject.teachers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun enseignant assigné</p>
              ) : (
                <div className="space-y-2">
                  {subject.teachers.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                      <span className="text-sm font-medium">{t.fullName}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                        onClick={() => removeTeacher(t.id)}
                        disabled={isSaving}
                        title="Retirer"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Tous les enseignants
              </CardTitle>
              <CardDescription>Sélectionnez un enseignant pour l&apos;assigner à cette matière</CardDescription>
            </CardHeader>
            <CardContent>
              {availableTeachers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {allTeachers.length === 0
                    ? "Aucun enseignant dans l'établissement"
                    : "Tous les enseignants sont déjà assignés à cette matière"}
                </p>
              ) : (
                <div className="space-y-2">
                  {availableTeachers.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div>
                        <span className="text-sm font-medium">{t.full_name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {t.email}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7"
                        onClick={() => addTeacher(t.id)}
                        disabled={isSaving}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
