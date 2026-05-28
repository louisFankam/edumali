"use client"

import { useState, useCallback } from "react"

export interface AttendanceRecord {
  id: string
  studentId: string
  classId: string
  date: string
  status: string
  justification?: string
  studentName?: string
  className?: string
}

export function useAttendanceByDateClass() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async (date: string, classId?: string, from?: string, to?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ date })
      if (classId) params.set("classId", classId)
      if (from) params.set("from", from)
      if (to) params.set("to", to)
      const res = await window.fetch(`/api/attendance?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (json.ok) setRecords(json.data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const save = async (records: { studentId: number; classId: number; date: string; status: string }[]) => {
    const res = await window.fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records }),
    })
    return res.json()
  }

  return { records, isLoading, load, save }
}

export function useAttendanceStats() {
  const [stats, setStats] = useState<{ total: number; présent: number; absent: number; retard: number; congé: number; rate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async (opts?: { studentId?: string; classId?: string; from?: string; to?: string }) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ stats: "true" })
      if (opts?.studentId) params.set("studentId", opts.studentId)
      if (opts?.classId) params.set("classId", opts.classId)
      if (opts?.from) params.set("from", opts.from)
      if (opts?.to) params.set("to", opts.to)
      const res = await window.fetch(`/api/attendance?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (json.ok) setStats(json.data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { stats, isLoading, load }
}
