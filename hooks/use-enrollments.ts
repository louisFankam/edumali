"use client"

import { useState, useEffect, useCallback } from "react"

export interface EnrollmentData {
  id: string
  studentId: string
  classId: string
  academicYearId: string
  enrollmentDate: string
  status: string
  notes?: string
  studentName?: string
  className?: string
  academicYearName?: string
}

export function useEnrollments(filters?: { studentId?: string; academicYearId?: string }) {
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.studentId) params.set("studentId", filters.studentId)
      if (filters?.academicYearId) params.set("academicYearId", filters.academicYearId)
      const res = await window.fetch(`/api/enrollments?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (json.ok) setEnrollments(json.data)
    } finally {
      setIsLoading(false)
    }
  }, [filters?.studentId, filters?.academicYearId])

  useEffect(() => { load() }, [load])

  const create = async (input: { studentId: number; classId: number; academicYearId: number; enrollmentDate: string; status: string; notes?: string }) => {
    const res = await window.fetch("/api/enrollments", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  const update = async (id: string, input: Partial<{ classId: number; status: string; notes: string }>) => {
    const res = await window.fetch(`/api/enrollments/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  const remove = async (id: string) => {
    const res = await window.fetch(`/api/enrollments/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  return { enrollments, isLoading, create, update, remove, refetch: load }
}

export function useEnrollmentStats() {
  const [stats, setStats] = useState<{ total: number } & Record<string, number> | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async (academicYearId?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ stats: "true" })
      if (academicYearId) params.set("academicYearId", academicYearId)
      const res = await window.fetch(`/api/enrollments?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (json.ok) setStats(json.data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { stats, isLoading, load }
}
