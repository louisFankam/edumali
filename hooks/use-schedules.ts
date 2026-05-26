"use client"

import { useState, useEffect, useCallback } from "react"

export interface ScheduleSlot {
  id: number
  classId: number
  academicYearId: number
  day: number
  startTime: string
  endTime: string
  subjectId: number | null
  teacherId: number | null
}

export function useSchedules(classId: string | null, yearId: string | null) {
  const [slots, setSlots] = useState<ScheduleSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!classId || !yearId) return
    setIsLoading(true)
    setError(null)
    window.fetch(`/api/schedules?classId=${classId}&academicYearId=${yearId}`, { cache: "no-store" })
      .then(r => r.json())
      .then(json => { if (json.ok) setSlots(json.data) })
      .catch((e) => { console.error("useSchedules.load", e); setError(String(e)) })
      .finally(() => setIsLoading(false))
  }, [classId, yearId])

  useEffect(() => { load() }, [load])

  const create = async (data: {
    classId: number
    academicYearId: number
    day: number
    startTime: string
    endTime: string
    subjectId?: number | null
    teacherId?: number | null
  }) => {
    const res = await window.fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (json.ok) { setSlots(prev => [...prev, json.data]); load() }
    return json
  }

  const update = async (id: number, data: {
    day?: number
    startTime?: string
    endTime?: string
    subjectId?: number | null
    teacherId?: number | null
  }) => {
    const res = await window.fetch(`/api/schedules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  const remove = async (id: number) => {
    const res = await window.fetch(`/api/schedules/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.ok) { setSlots(prev => prev.filter(s => s.id !== id)); load() }
    return json
  }

  return { slots, isLoading, error, create, update, remove, refetch: load }
}
