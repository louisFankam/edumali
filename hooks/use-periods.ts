"use client"

import { useState, useEffect, useCallback } from "react"
import { cachedFetch } from "./use-cached-fetch"

export interface ClosedPeriod {
  id: string
  month: number
  year: number
  closedAt: string | Date
}

export function usePeriods() {
  const [periods, setPeriods] = useState<ClosedPeriod[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const json = await cachedFetch<any>("/api/periods")
      if (json.ok) setPeriods(json.data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const close = async (month: number, year: number) => {
    const res = await window.fetch("/api/periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year }),
    })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  const open = async (month: number, year: number) => {
    const res = await window.fetch(`/api/periods?month=${month}&year=${year}`, { method: "DELETE" })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  const isClosed = useCallback((date: string) => {
    const [year, month] = date.split("-").map(Number)
    return periods.some(p => p.month === month && p.year === year)
  }, [periods])

  return { periods, isLoading, close, open, isClosed, refetch: load }
}
