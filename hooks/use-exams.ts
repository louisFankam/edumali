"use client"

import { useState, useEffect, useCallback } from "react"

export interface ExamData {
  id: number
  classId: number
  academicYearId: number
  subjectId: number
  teacherId: number | null
  trimester: number
  date: string
  startTime: string
  endTime: string
  room: string
  status: string
}

export function useExams(classId: string | null, yearId: string | null, trimester: string | null) {
  const [exams, setExams] = useState<ExamData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!classId || !yearId || !trimester) return
    setIsLoading(true)
    setError(null)
    window.fetch(`/api/exams?classId=${classId}&academicYearId=${yearId}&trimester=${trimester}`, { cache: "no-store" })
      .then(r => r.json())
      .then(json => { if (json.ok) setExams(json.data) })
      .catch((e) => { console.error("useExams.load", e); setError(String(e)) })
      .finally(() => setIsLoading(false))
  }, [classId, yearId, trimester])

  useEffect(() => { load() }, [load])

  const create = async (data: {
    classId: number
    academicYearId: number
    subjectId: number
    teacherId?: number | null
    trimester: number
    date: string
    startTime: string
    endTime: string
    room?: string
    status?: string
  }) => {
    const res = await window.fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (json.ok) { setExams(prev => [...prev, json.data]); load() }
    return json
  }

  const update = async (id: number, data: {
    subjectId?: number
    teacherId?: number | null
    trimester?: number
    date?: string
    startTime?: string
    endTime?: string
    room?: string
    status?: string
  }) => {
    const res = await window.fetch(`/api/exams/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  const remove = async (id: number) => {
    const res = await window.fetch(`/api/exams/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.ok) { setExams(prev => prev.filter(e => e.id !== id)); load() }
    return json
  }

  return { exams, isLoading, error, create, update, remove, refetch: load }
}
