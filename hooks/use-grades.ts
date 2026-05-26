"use client"

import { useState, useEffect, useCallback } from "react"

export interface Grade {
  id: string
  evaluationId: string
  studentId: string
  score: number
  remarks: string
  isAbsent: boolean
  studentFirstName: string
  studentLastName: string
}

export interface GradeStats {
  count: number
  average: number
  min: number
  max: number
  successRate: number
  absentCount: number
  totalStudents: number
  missingCount: number
}

export function useGrades(evaluationId: string | undefined) {
  const [grades, setGrades] = useState<Grade[]>([])
  const [stats, setStats] = useState<GradeStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!evaluationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const res = await window.fetch(`/api/grades?evaluationId=${evaluationId}`)
      const json = await res.json()
      if (json.ok) {
        setGrades(json.data.grades)
        setStats(json.data.stats)
      }
    } finally {
      setIsLoading(false)
    }
  }, [evaluationId])

  useEffect(() => { load() }, [load])

  const save = async (gradeInputs: { studentId: number; score: number; remarks?: string; isAbsent?: boolean }[]) => {
    const res = await window.fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evaluationId, grades: gradeInputs }),
    })
    const json = await res.json()
    if (json.ok) await load()
    return json
  }

  return { grades, stats, isLoading, save, refetch: load }
}
