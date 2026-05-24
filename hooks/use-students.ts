"use client"

import { useState, useEffect, useCallback } from "react"

export interface StudentData {
  id: string
  firstName: string
  lastName: string
  gender: string
  birthDate: string
  nationality?: string
  photo?: string
  parentName: string
  parentPhone: string
  classId: string
  className: string
  registrationDate: string
  status: string
}

export interface ClassData {
  id: string
  name: string
}

interface StudentFilters {
  search?: string
  classId?: string
}

export function useStudents(filters?: StudentFilters) {
  const [students, setStudents] = useState<StudentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.set("search", filters.search)
      if (filters?.classId) params.set("classId", filters.classId)
      const res = await fetch(`/api/students?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (!json.ok) throw new Error(json.message)
      setStudents(json.data)
    } catch (e) {
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }, [filters?.search, filters?.classId])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const addStudent = async (input: Omit<StudentData, "id" | "registrationDate" | "className">) => {
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await fetchStudents()
    return json.data as StudentData
  }

  const editStudent = async (id: string, input: Partial<StudentData>) => {
    const res = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await fetchStudents()
    return json.data as StudentData
  }

  const deleteStudent = async (id: string) => {
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await fetchStudents()
  }

  return { students, isLoading, error, refetch: fetchStudents, addStudent, editStudent, deleteStudent }
}

export function useStudent(id: string | undefined) {
  const [student, setStudent] = useState<StudentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setIsLoading(false); return }
    setIsLoading(true)
    setError(null)
    fetch(`/api/students/${id}`, { cache: "no-store" })
      .then(r => r.json())
      .then(json => {
        if (!json.ok) throw new Error(json.message)
        setStudent(json.data)
      })
      .catch(e => setError(String(e)))
      .finally(() => setIsLoading(false))
  }, [id])

  return { student, isLoading, error }
}

export function useStudentStats() {
  const [stats, setStats] = useState<{ total: number; girls: number; boys: number; girlsPercentage: number; boysPercentage: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/students?stats=true", { cache: "no-store" })
      .then(r => r.json())
      .then(json => { if (json.ok) setStats(json.data) })
      .finally(() => setIsLoading(false))
  }, [])

  return { stats, isLoading }
}
