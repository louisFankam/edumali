"use client"

import { useState, useEffect, useCallback } from "react"
import { cachedFetch, clearCache } from "./use-cached-fetch"

export interface ExpenseData {
  id: string
  description: string
  amount: number
  category: string
  categoryLabel: string
  categoryCustom?: string | null
  date: string
  notes?: string | null
}

export function useExpenses(filters?: { from?: string; to?: string; category?: string; page?: number; limit?: number }) {
  const [expenses, setExpenses] = useState<ExpenseData[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.from) params.set("from", filters.from)
      if (filters?.to) params.set("to", filters.to)
      if (filters?.category) params.set("category", filters.category)
      if (filters?.page) params.set("page", String(filters.page))
      if (filters?.limit) params.set("limit", String(filters.limit))
      const json = await cachedFetch<any>(`/api/expenses?${params.toString()}`)
      if (json.ok) { setExpenses(json.data); setTotal(json.pagination?.total ?? 0) }
    } finally {
      setIsLoading(false)
    }
  }, [filters?.from, filters?.to, filters?.category, filters?.page, filters?.limit])

  useEffect(() => { load() }, [load])

  const create = async (input: {
    description: string; amount: number; category: string; categoryCustom?: string; date: string; notes?: string;
  }) => {
    const res = await window.fetch("/api/expenses", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) { clearCache(); load() }
    return json
  }

  const update = async (id: string, input: Partial<ExpenseData>) => {
    const res = await window.fetch(`/api/expenses/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) { clearCache(); load() }
    return json
  }

  const remove = async (id: string) => {
    const res = await window.fetch(`/api/expenses/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.ok) { clearCache(); load() }
    return json
  }

  return { expenses, total, isLoading, create, update, remove, refetch: load }
}
