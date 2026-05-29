"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface DashboardData {
  students: {
    total: number
    growth: number
    newThisMonth: number
    byClass: { name: string; count: number; capacity: number; percentage: number }[]
  }
  attendance: {
    overall: number
    trend: number
    byClass: { class: string; rate: number }[]
  }
  financial: {
    totalRevenue: number
    growth: number
    monthlyAverage: number
    outstandingPayments: number
  }
  exams: {
    passRate: number
    averageScore: number
  }
  teachers: {
    total: number
    active: number
  }
}

export function useDashboard(filters?: { from?: string; to?: string; academicYearId?: string }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters?.from) params.set("from", filters.from)
      if (filters?.to) params.set("to", filters.to)
      if (filters?.academicYearId) params.set("academicYearId", filters.academicYearId)
      const qs = params.toString()
      const res = await window.fetch(`/api/dashboard${qs ? `?${qs}` : ""}`, { cache: "no-store" })
      const json = await res.json()
      if (id !== requestId.current) return
      if (!json.ok) throw new Error(json.message)
      setData(json.data)
    } catch (e) {
      if (id !== requestId.current) return
      setError(String(e))
    } finally {
      if (id === requestId.current) setIsLoading(false)
    }
  }, [filters?.from, filters?.to, filters?.academicYearId])

  useEffect(() => { load() }, [load])

  return { data, isLoading, error, refetch: load }
}
