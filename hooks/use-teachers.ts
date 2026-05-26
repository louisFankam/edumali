"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface TeacherData {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  address: string
  hire_date: string
  salary: number
  status: "active" | "inactive" | "on_leave"
  photo: string
  user_id: string
  gender: "Masculin" | "Féminin"
  contrat: "horaire" | "mensuel"
  speciality: string[]
  speciality_names: string[]
  created: string
  updated: string
}

export interface SubjectData {
  id: string
  name: string
  code: string
}

interface TeacherFilters {
  search?: string
  status?: string
  contrat?: string
  page?: number
  limit?: number
}

export function useTeachers(filters?: TeacherFilters) {
  const [teachers, setTeachers] = useState<TeacherData[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.set("search", filters.search)
      if (filters?.status) params.set("status", filters.status)
      if (filters?.contrat) params.set("contrat", filters.contrat)
      if (filters?.page) params.set("page", String(filters.page))
      if (filters?.limit) params.set("limit", String(filters.limit))
      const res = await window.fetch(`/api/teachers?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (!json.ok) throw new Error(json.message)
      setTeachers(json.data)
      if (json.pagination) setTotal(json.pagination.total)
    } catch (e) {
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }, [filters?.search, filters?.status, filters?.contrat, filters?.page, filters?.limit])

  useEffect(() => { load() }, [load])

  const addTeacher = async (input: Partial<TeacherData>) => {
    const res = await window.fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
    return json.data as TeacherData
  }

  const editTeacher = async (id: string, input: Partial<TeacherData>) => {
    const res = await window.fetch(`/api/teachers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
    return json.data as TeacherData
  }

  const deleteTeacher = async (id: string) => {
    const res = await window.fetch(`/api/teachers/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
  }

  return { teachers, total, isLoading, error, refetch: load, addTeacher, editTeacher, deleteTeacher }
}

export function useTeacher(id: string | undefined) {
  const [teacher, setTeacher] = useState<TeacherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setIsLoading(false); return }
    setIsLoading(true)
    setError(null)
    window.fetch(`/api/teachers/${id}`, { cache: "no-store" })
      .then(r => r.json())
      .then(json => {
        if (!json.ok) throw new Error(json.message)
        setTeacher(json.data)
      })
      .catch(e => setError(String(e)))
      .finally(() => setIsLoading(false))
  }, [id])

  return { teacher, isLoading, error }
}

export interface TeacherAttendanceRecord {
  id: string
  teacher_id: string
  date: string
  status: string
  justification: string
  teacher?: TeacherData | null
}

export function useTeacherAttendance(filters?: { teacherId?: string; date?: string; from?: string; to?: string }) {
  const [records, setRecords] = useState<TeacherAttendanceRecord[]>([])
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
      if (filters?.teacherId) params.set("teacherId", filters.teacherId)
      if (filters?.date) params.set("date", filters.date)
      if (filters?.from) params.set("from", filters.from)
      if (filters?.to) params.set("to", filters.to)
      const res = await window.fetch(`/api/teachers/attendance?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (id !== requestId.current) return
      if (!json.ok) throw new Error(json.message)
      setRecords(json.data)
    } catch (e) {
      if (id !== requestId.current) return
      setError(String(e))
    } finally {
      if (id === requestId.current) setIsLoading(false)
    }
  }, [filters?.teacherId, filters?.date, filters?.from, filters?.to])

  useEffect(() => { load() }, [load])

  const saveAttendance = async (records: { teacher_id: string; date: string; status: string; justification?: string }[]) => {
    const res = await window.fetch("/api/teachers/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records }),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
  }

  return { records, isLoading, error, refetch: load, saveAttendance }
}

export interface PayrollRecord {
  id: string
  teacher_id: string
  first_name: string
  last_name: string
  month: number
  year: number
  amount: number
  bonus: number
  deductions: number
  paid_at: string
  notes: string
}

export function usePayroll(filters?: { teacherId?: string; month?: number; year?: number; from?: string; to?: string }) {
  const [records, setRecords] = useState<PayrollRecord[]>([])
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
      if (filters?.teacherId) params.set("teacherId", filters.teacherId)
      if (filters?.month !== undefined) params.set("month", String(filters.month))
      if (filters?.year !== undefined) params.set("year", String(filters.year))
      if (filters?.from) params.set("from", filters.from)
      if (filters?.to) params.set("to", filters.to)
      const res = await window.fetch(`/api/teachers/payroll?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (id !== requestId.current) return
      if (!json.ok) throw new Error(json.message)
      setRecords(json.data)
    } catch (e) {
      if (id !== requestId.current) return
      setError(String(e))
    } finally {
      if (id === requestId.current) setIsLoading(false)
    }
  }, [filters?.teacherId, filters?.month, filters?.year, filters?.from, filters?.to])

  useEffect(() => { load() }, [load])

  const addPayroll = async (input: Partial<PayrollRecord>) => {
    const res = await window.fetch("/api/teachers/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
    return json.data as PayrollRecord
  }

  const editPayroll = async (id: string, input: Partial<PayrollRecord>) => {
    const res = await window.fetch(`/api/teachers/payroll/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
  }

  const deletePayroll = async (id: string) => {
    const res = await window.fetch(`/api/teachers/payroll/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
  }

  return { records, isLoading, error, refetch: load, addPayroll, editPayroll, deletePayroll }
}

export function useSubjectsList() {
  const [subjects, setSubjects] = useState<SubjectData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.fetch("/api/subjects", { cache: "no-store" })
      .then(r => r.json())
      .then(json => {
        if (!json.ok) throw new Error(json.message)
        setSubjects(json.data)
      })
      .catch(e => setError(String(e)))
      .finally(() => setIsLoading(false))
  }, [])

  return { subjects, isLoading, error }
}
