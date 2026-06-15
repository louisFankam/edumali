"use client"

import { useState, useEffect, useCallback } from "react"

export interface ClassSubject {
  id: string
  classId: string
  subjectId: string
  coefficient: number
  subjectName: string
  subjectCode: string
  teacherId?: string | null
  teacherName?: string | null
}

export function useClassSubjects(classId: string | undefined) {
  const [subjects, setSubjects] = useState<ClassSubject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!classId) { setSubjects([]); setIsLoading(false); return }
    setIsLoading(true)
    setError(null)
    try {
      const res = await window.fetch(`/api/class-subjects?classId=${classId}`)
      const json = await res.json()
      if (json.ok) setSubjects(json.data)
    } catch (e) {
      console.error("useClassSubjects.load", e)
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }, [classId])

  useEffect(() => { load() }, [load])

  const save = async (assignments: { subjectId: number; coefficient: number; teacherId?: number | null }[]) => {
    const res = await window.fetch("/api/class-subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, assignments }),
    })
    const json = await res.json()
    if (json.ok) await load()
    return json
  }

  const assignTeacher = async (subjectId: string, teacherId: string | null) => {
    const res = await window.fetch(`/api/class-subjects/${subjectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, teacherId }),
    })
    const json = await res.json()
    if (json.ok) await load()
    return json
  }

  return { subjects, isLoading, error, save, assignTeacher, refetch: load }
}
