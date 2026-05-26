"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cachedFetch, clearCache } from "./use-cached-fetch"

export interface UnpaidStudentData {
  id: string
  firstName: string
  lastName: string
  classId: string
  className: string
  totalFee: number
  totalPaid: number
  remaining: number
}

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
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const json = await cachedFetch<any>("/api/fees")
      if (json.ok) setFeeTypes(json.data)
    } catch (e) {
      console.error("useFeeTypes.load", e)
      setError(String(e))
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
    if (json.ok) { clearCache(); load() }
    return json
  }

  const update = async (id: string, input: Partial<FeeTypeData>) => {
    const res = await window.fetch(`/api/fees/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) { clearCache(); load() }
    return json
  }

  const remove = async (id: string) => {
    const res = await window.fetch(`/api/fees/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.ok) { clearCache(); load() }
    return json
  }

  return { feeTypes, isLoading, error, create, update, remove }
}

export function usePayments(filters?: { studentId?: string; from?: string; to?: string; page?: number; limit?: number }) {
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    if (!filters) { setIsLoading(false); return }
    const id = ++requestId.current
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters?.studentId) params.set("studentId", filters.studentId)
      if (filters?.from) params.set("from", filters.from)
      if (filters?.to) params.set("to", filters.to)
      if (filters?.page) params.set("page", String(filters.page))
      if (filters?.limit) params.set("limit", String(filters.limit))
      const json = await cachedFetch<any>(`/api/payments?${params.toString()}`)
      if (id !== requestId.current) return
      if (json.ok) { setPayments(json.data); setTotal(json.pagination?.total ?? 0) }
    } catch (e) {
      console.error("usePayments.load", e)
      setError(String(e))
    } finally {
      if (id === requestId.current) setIsLoading(false)
    }
  }, [filters?.studentId, filters?.from, filters?.to, filters?.page, filters?.limit])

  useEffect(() => { load() }, [load])

  const create = async (input: { studentId: number; feeTypeId?: number; amount: number; method: string; date: string; notes?: string }) => {
    const res = await window.fetch("/api/payments", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) { clearCache(); load() }
    return json
  }

  const update = async (id: string, input: { amount?: number; method?: string; feeTypeId?: number; notes?: string }) => {
    const res = await window.fetch(`/api/payments/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) { clearCache(); load() }
    return json
  }

  const remove = async (id: string) => {
    const res = await window.fetch(`/api/payments/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.ok) { clearCache(); load() }
    return json
  }

  return { payments, total, isLoading, error, create, update, remove, refetch: load }
}

export function usePaymentStats() {
  const [stats, setStats] = useState<{ totalRevenue: number; totalPayments: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (from?: string, to?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ stats: "true" })
      if (from) params.set("from", from)
      if (to) params.set("to", to)
      const json = await cachedFetch<any>(`/api/payments?${params.toString()}`)
      if (json.ok) setStats(json.data)
    } catch (e) {
      console.error("usePaymentStats.load", e)
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { stats, isLoading, error, load }
}

export function useUnpaidStudents(classId?: string, page?: number, limit: number = 20, academicYearId?: string) {
  const [data, setData] = useState<UnpaidStudentData[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (classId) params.set("classId", classId)
      if (page) params.set("page", String(page))
      params.set("limit", String(limit))
      if (academicYearId) params.set("academicYearId", academicYearId)
      const res = await window.fetch(`/api/payments/unpaid?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (id !== requestId.current) return
      if (json.ok) { setData(json.data); setTotal(json.pagination?.total ?? 0) }
    } catch (e) {
      console.error("useUnpaidStudents.load", e)
      setError(String(e))
    } finally { if (id === requestId.current) setIsLoading(false) }
  }, [classId, page, limit, academicYearId])

  useEffect(() => { load() }, [load])

  return { data, total, isLoading, error, refetch: load }
}
