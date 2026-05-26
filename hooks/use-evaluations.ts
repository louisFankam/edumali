"use client"

import { useState, useEffect, useCallback } from "react"

export interface Evaluation {
  id: string
  name: string
  type: "devoir" | "trimestrielle"
  classId: string
  subjectId: string
  trimester: number
  academicYearId: string
  date: string
  status: "draft" | "published"
  className: string
  subjectName: string
  createdAt: string
  updatedAt: string
}

export interface EvaluationFilters {
  classId?: string
  subjectId?: string
  trimester?: string
  academicYearId?: string
  status?: string
  type?: string
}

export function useEvaluations(filters: EvaluationFilters = {}) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const params = new URLSearchParams()
  if (filters.classId) params.set("classId", filters.classId)
  if (filters.subjectId) params.set("subjectId", filters.subjectId)
  if (filters.trimester) params.set("trimester", filters.trimester)
  if (filters.academicYearId) params.set("academicYearId", filters.academicYearId)
  if (filters.status) params.set("status", filters.status)
  if (filters.type) params.set("type", filters.type)
  const qs = params.toString()

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await window.fetch(`/api/evaluations${qs ? `?${qs}` : ""}`)
      const json = await res.json()
      if (json.ok) setEvaluations(json.data)
    } catch (e) {
      console.error("useEvaluations.load", e)
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }, [qs])

  useEffect(() => { load() }, [load])

  const create = async (input: {
    name: string; type: string; classId: number; subjectId: number;
    trimester: number; academicYearId: number; date: string;
  }) => {
    const res = await window.fetch("/api/evaluations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) await load()
    return json
  }

  const update = async (id: string, input: Partial<{
    name: string; type: string; date: string; status: string;
  }>) => {
    const res = await window.fetch(`/api/evaluations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) await load()
    return json
  }

  const remove = async (id: string) => {
    const res = await window.fetch(`/api/evaluations/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.ok) await load()
    return json
  }

  return { evaluations, isLoading, error, create, update, remove, refetch: load }
}
