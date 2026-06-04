"use client"

import { useState, useCallback } from "react"

export interface SubjectBulletin {
  subjectId: string
  subjectName: string
  coefficient: number
  devoirScores: number[]
  trimestrielleScore: number | null
  devoirAverage: number | null
  finalAverage: number | null
  absent: boolean
  appreciation: string
}

export interface StudentBulletin {
  studentId: string
  firstName: string
  lastName: string
  subjects: SubjectBulletin[]
  generalAverage: number | null
  rank: number | null
  mention: string
  totalActiveCoeffs: number
  weightedSum: number
  absentCount: number
}

export interface BulletinData {
  className: string
  trimester: number
  students: StudentBulletin[]
  subjectCount: number
  studentCount: number
}

export function useBulletins() {
  const [data, setData] = useState<BulletinData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (filters: {
    classId: string
    trimester: string
    academicYearId: string
    includeAbsentCoeff?: boolean
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        classId: filters.classId,
        trimester: filters.trimester,
        academicYearId: filters.academicYearId,
      })
      if (filters.includeAbsentCoeff) params.set("includeAbsentCoeff", "true")
      const res = await window.fetch(`/api/bulletins?${params}`)
      const json = await res.json()
      if (json.ok) setData(json.data)
      else setError(json.message)
    } catch (e: any) {
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { data, isLoading, error, generate }
}
