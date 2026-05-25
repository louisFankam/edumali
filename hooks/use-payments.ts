"use client"

import { useState, useEffect, useCallback } from "react"

export interface FeeTypeData {
  id: string
  name: string
  amount: number
  period: string
  description?: string
}

export interface PaymentData {
  id: string
  studentId: string
  feeTypeId?: string
  amount: number
  method: string
  reference?: string
  date: string
  status: string
  notes?: string
  studentName?: string
  feeTypeName?: string
}

export function useFeeTypes() {
  const [feeTypes, setFeeTypes] = useState<FeeTypeData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await window.fetch("/api/fees", { cache: "no-store" })
      const json = await res.json()
      if (json.ok) setFeeTypes(json.data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (input: { name: string; amount: number; period: string; description?: string }) => {
    const res = await window.fetch("/api/fees", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  const update = async (id: string, input: Partial<FeeTypeData>) => {
    const res = await window.fetch(`/api/fees/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  const remove = async (id: string) => {
    const res = await window.fetch(`/api/fees/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  return { feeTypes, isLoading, create, update, remove }
}

export function usePayments(filters?: { studentId?: string; from?: string; to?: string }) {
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.studentId) params.set("studentId", filters.studentId)
      if (filters?.from) params.set("from", filters.from)
      if (filters?.to) params.set("to", filters.to)
      const res = await window.fetch(`/api/payments?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (json.ok) setPayments(json.data)
    } finally {
      setIsLoading(false)
    }
  }, [filters?.studentId, filters?.from, filters?.to])

  useEffect(() => { load() }, [load])

  const create = async (input: { studentId: number; feeTypeId?: number; amount: number; method: string; date: string; notes?: string }) => {
    const res = await window.fetch("/api/payments", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  const remove = async (id: string) => {
    const res = await window.fetch(`/api/payments/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  return { payments, isLoading, create, remove, refetch: load }
}

export function usePaymentStats() {
  const [stats, setStats] = useState<{ totalRevenue: number; totalPayments: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async (from?: string, to?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ stats: "true" })
      if (from) params.set("from", from)
      if (to) params.set("to", to)
      const res = await window.fetch(`/api/payments?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (json.ok) setStats(json.data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { stats, isLoading, load }
}
