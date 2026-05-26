"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface DashboardData {
  totals: {
    totalRevenue: number
    totalExpenses: number
    netBalance: number
    revenueCount: number
    expenseCount: number
  }
  monthly: { month: string; Revenus: number; Dépenses: number }[]
  pieData: { name: string; value: number }[]
}

export function useDashboardData(filters?: { from?: string; to?: string }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    if (!filters) { setIsLoading(false); return }
    const id = ++requestId.current
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.from) params.set("from", filters.from)
      if (filters?.to) params.set("to", filters.to)
      const res = await window.fetch(`/api/finances/dashboard-data?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (id !== requestId.current) return
      if (json.ok) setData(json.data)
    } finally {
      if (id === requestId.current) setIsLoading(false)
    }
  }, [filters?.from, filters?.to])

  useEffect(() => { load() }, [load])

  return { data, isLoading, refetch: load }
}
