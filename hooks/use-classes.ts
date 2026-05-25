"use client"

import { useState, useEffect, useCallback } from "react"

export interface ClassData {
  id: string
  name: string
  level: number | null
  capacity?: number | null
  totalFee?: number | null
  teacherId?: string | null
  color?: string
  academicYear?: string
  status?: string
  studentCount?: number
}

export function useClasses() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(() => {
    setIsLoading(true)
    window.fetch("/api/classes", { cache: "no-store" })
      .then(r => r.json())
      .then(json => { if (json.ok) setClasses(json.data) })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (input: {
    name: string; level?: number | null; capacity?: number | null;
    totalFee?: number | null; teacherId?: number | null; color?: string;
    academicYear?: string; status?: string;
  }) => {
    const res = await window.fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  const update = async (id: string, input: {
    name?: string; level?: number | null; capacity?: number | null;
    totalFee?: number | null; teacherId?: number | null; color?: string;
    academicYear?: string; status?: string;
  }) => {
    const res = await window.fetch(`/api/classes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  const remove = async (id: string) => {
    const res = await window.fetch(`/api/classes/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.ok) load()
    return json
  }

  return { classes, isLoading, create, update, remove }
}
