"use client"

import { useState, useEffect, useCallback } from "react"

export interface SubjectGrade {
  name: string
  grade: string
  coefficient: number
  finalAverage: number | null
  devoirScores: number[]
  trimestrielleScore: number | null
}

export interface TrimesterResult {
  year: string
  class: string
  trimester: number
  average: string
  numericAverage: number | null
  status: string
  subjects: SubjectGrade[]
}

export interface StudentGradesData {
  student: { id: number; firstName: string; lastName: string }
  academicHistory: TrimesterResult[]
  subjectProgression: { subject: string; current: number | null; previous: number | null; trend: string }[]
  yearProgression: { year: string; trimester: number; average: number }[]
  currentAverage: number | null
}

export function useStudentGrades(studentId: string | undefined) {
  const [data, setData] = useState<StudentGradesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!studentId) { setIsLoading(false); return }
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/academic-history/student/${studentId}`)
      const json = await res.json()
      if (json.ok) setData(json.data)
      else setError(json.message || "Erreur lors du chargement des notes")
    } catch {
      setError("Erreur réseau")
    } finally {
      setIsLoading(false)
    }
  }, [studentId])

  useEffect(() => { load() }, [load])

  const currentYearResults = data?.academicHistory?.filter(h => {
    const latest = data.academicHistory[0]
    return latest ? h.year === latest.year : true
  }) ?? []

  const annualAverage = (() => {
    const valid = currentYearResults.filter(r => r.numericAverage !== null).map(r => r.numericAverage!)
    if (valid.length === 0) return null
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length * 100) / 100
  })()

  return { data, isLoading, error, currentYearResults, annualAverage, refetch: load }
}
