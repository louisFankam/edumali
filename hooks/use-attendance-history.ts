"use client"

import { useState, useCallback, useRef } from "react"

export interface HistoryRecord {
  id: string
  studentId: string
  studentName: string
  date: string
  status: string
}

export interface StudentSummary {
  studentId: string
  studentName: string
  present: number
  absent: number
  late: number
  excused: number
  total: number
  rate: number
  details: { date: string; status: string }[]
}

export function useAttendanceHistory() {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [summary, setSummary] = useState<StudentSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const requestId = useRef(0)

  const load = useCallback(async (classId: string, from: string, to: string) => {
    const id = ++requestId.current
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ classId, from, to })
      const res = await window.fetch(`/api/attendance?${params.toString()}`, { cache: "no-store" })
      if (id !== requestId.current) return
      const json = await res.json()
      if (!json.ok) return
      if (id !== requestId.current) return

      const data: HistoryRecord[] = json.data.map((r: any) => ({
        id: r.id,
        studentId: r.studentId,
        studentName: r.studentName ?? `Élève #${r.studentId}`,
        date: r.date,
        status: r.status,
      }))

      setRecords(data)

      const grouped: Record<string, StudentSummary> = {}
      for (const r of data) {
        if (!grouped[r.studentId]) {
          grouped[r.studentId] = {
            studentId: r.studentId,
            studentName: r.studentName,
            present: 0, absent: 0, late: 0, excused: 0, total: 0, rate: 0,
            details: [],
          }
        }
        const s = grouped[r.studentId]
        s.total++
        if (r.status === "présent") s.present++
        else if (r.status === "absent") s.absent++
        else if (r.status === "retard") s.late++
        else if (r.status === "congé") s.excused++
        s.details.push({ date: r.date, status: r.status })
      }

      for (const s of Object.values(grouped)) {
        s.rate = s.total > 0 ? Math.round(((s.present + s.excused) / s.total) * 100) : 0
      }

      if (id === requestId.current) {
        setSummary(Object.values(grouped).sort((a, b) => a.studentName.localeCompare(b.studentName)))
      }
    } finally {
      if (id === requestId.current) setIsLoading(false)
    }
  }, [])

  return { records, summary, isLoading, load }
}
