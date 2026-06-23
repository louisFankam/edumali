"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface StudentData {
  id: string
  firstName: string
  lastName: string
  gender: string
  birthDate: string
  nationality?: string
  address?: string
  photo?: string
  parentName: string
  parentPhone: string
  classId: string
  className: string
  registrationDate: string
  status: string
  discountType?: string
  discountValue?: number
  discountReason?: string
}

export interface ClassData {
  id: string
  name: string
}

interface StudentFilters {
  search?: string
  classId?: string
  academicYearId?: string
  page?: number
  limit?: number
}

export function useStudents(filters?: StudentFilters) {
  const [students, setStudents] = useState<StudentData[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestIdRef.current
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.set("search", filters.search)
      if (filters?.classId) params.set("classId", filters.classId)
      if (filters?.academicYearId) params.set("academicYearId", filters.academicYearId)
      if (filters?.page) params.set("page", String(filters.page))
      if (filters?.limit) params.set("limit", String(filters.limit))
      const res = await window.fetch(`/api/students?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (id !== requestIdRef.current) return
      if (!json.ok) throw new Error(json.message)
      setStudents(json.data)
      if (json.pagination) setTotal(json.pagination.total)
    } catch (e) {
      if (id !== requestIdRef.current) return
      setError(String(e))
    } finally {
      if (id === requestIdRef.current) setIsLoading(false)
    }
  }, [filters?.search, filters?.classId, filters?.academicYearId, filters?.page, filters?.limit])

  useEffect(() => { load() }, [load])

  const addStudent = async (input: Omit<StudentData, "id" | "registrationDate" | "className">) => {
    const res = await window.fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
    return json.data as StudentData
  }

  const editStudent = async (id: string, input: Partial<StudentData>) => {
    const res = await window.fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
    return json.data as StudentData
  }

  const deleteStudent = async (id: string) => {
    const res = await window.fetch(`/api/students/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
  }

  return { students, total, isLoading, error, refetch: load, addStudent, editStudent, deleteStudent }
}

export function useStudent(id: string | undefined) {
  const [student, setStudent] = useState<StudentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) { setIsLoading(false); return }
    setIsLoading(true)
    setError(null)
    try {
      const res = await window.fetch(`/api/students/${id}`, { cache: "no-store" })
      const json = await res.json()
      if (!json.ok) throw new Error(json.message)
      setStudent(json.data)
    } catch (e) {
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  return { student, isLoading, error, refetch: load }
}

export function useStudentStats(academicYearId?: string) {
  const [stats, setStats] = useState<{ total: number; girls: number; boys: number; girlsPercentage: number; boysPercentage: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams({ stats: "true" })
    if (academicYearId) params.set("academicYearId", academicYearId)
    setIsLoading(true)
    setError(null)
    window.fetch(`/api/students?${params.toString()}`, { cache: "no-store" })
      .then(r => r.json())
      .then(json => { if (json.ok) setStats(json.data) })
      .catch((e) => { console.error("useStudentStats", e); setError(String(e)) })
      .finally(() => setIsLoading(false))
  }, [academicYearId])

  return { stats, isLoading, error }
}
