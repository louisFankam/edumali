"use client"

import { useState, useEffect, useCallback } from "react"

export interface ClassFeeTypeData {
  id: string
  feeTypeId: string
  feeTypeName: string
  feeTypeAmount: number
  feeTypePeriod: string
  amount: number | null
}

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
  feeTypes?: ClassFeeTypeData[]
}

export function useClasses() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setIsLoading(true)
    setError(null)
    window.fetch("/api/classes", { cache: "no-store" })
      .then(r => r.json())
      .then(json => { if (json.ok) setClasses(json.data) })
      .catch((e) => { console.error("useClasses.load", e); setError(String(e)) })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (input: {
    name: string; level?: number | null; capacity?: number | null;
    totalFee?: number | null; teacherId?: number | null; color?: string;
    academicYear?: string; status?: string;
    feeTypeItems?: { feeTypeId: number; amount: number | null }[];
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
    feeTypeItems?: { feeTypeId: number; amount: number | null }[];
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

  return { classes, isLoading, error, create, update, remove }
}
