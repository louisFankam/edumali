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

export interface AnnualSubjectRow {
  subjectId: string
  subjectName: string
  coefficient: number
  trimesterAverages: Record<number, number | null>
  annualAverage: number | null
  points: number | null
}

export interface AnnualStudentResult {
  studentId: string
  firstName: string
  lastName: string
  subjects: AnnualSubjectRow[]
  annualGeneralAverage: number | null
  annualRank: number | null
  totalStudents: number
  totalPoints: number
  totalCoeffs: number
  admis: boolean
}

export interface AnnualBulletinData {
  className: string
  academicYearId: number
  trimesters: number[]
  students: AnnualStudentResult[]
  subjectCount: number
  studentCount: number
}

export function useBulletins() {
  const [data, setData] = useState<BulletinData | null>(null)
  const [annualData, setAnnualData] = useState<AnnualBulletinData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (filters: {
    classId: string
    trimester: string
    academicYearId: string
    includeAbsentCoeff?: boolean
    annual?: boolean
    trimesters?: number[]
  }) => {
    setIsLoading(true)
    setError(null)
    setData(null)
    setAnnualData(null)
    try {
      const params = new URLSearchParams({
        classId: filters.classId,
        academicYearId: filters.academicYearId,
      })
      if (filters.annual) {
        params.set("annual", "true")
        if (filters.trimesters) params.set("trimesters", filters.trimesters.join(","))
      } else {
        params.set("trimester", filters.trimester)
      }
      if (filters.includeAbsentCoeff) params.set("includeAbsentCoeff", "true")
      const res = await window.fetch(`/api/bulletins?${params}`)
      const json = await res.json()
      if (json.ok) {
        if (filters.annual) setAnnualData(json.data)
        else setData(json.data)
      } else setError(json.message)
    } catch (e: any) {
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { data, annualData, isLoading, error, generate }
}
