"use client"

import { useState, useEffect, useCallback } from "react"

export interface AcademicHistoryData {
  id: string
  studentId: string
  schoolName: string
  className: string
  academicYear: string
  reason: string
  remarks: string
}

export function useAcademicHistory(studentId: string | undefined) {
  const [records, setRecords] = useState<AcademicHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!studentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const res = await window.fetch(`/api/students/academic-history?studentId=${studentId}`)
      const json = await res.json()
      if (json.ok) setRecords(json.data)
    } finally {
      setIsLoading(false)
    }
  }, [studentId])

  useEffect(() => { load() }, [load])

  const add = async (input: { schoolName: string; className?: string; academicYear?: string; reason?: string; remarks?: string }) => {
    const res = await window.fetch("/api/students/academic-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, ...input }),
    })
    const json = await res.json()
    if (json.ok) await load()
    return json
  }

  const update = async (id: string, input: Partial<AcademicHistoryData>) => {
    const res = await window.fetch(`/api/students/academic-history/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.ok) await load()
    return json
  }

  const remove = async (id: string) => {
    const res = await window.fetch(`/api/students/academic-history/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.ok) await load()
    return json
  }

  return { records, isLoading, add, update, remove, refetch: load }
}
