"use client"

import { useState, useEffect, useCallback } from "react"

export interface AcademicRecordSubject {
  name: string
  grade: string
  coefficient: number
  finalAverage: number | null
  teacher: string
}

export interface AcademicRecordStudent {
  id: number
  studentName: string
  studentId: string
  class: string
  trimester: string
  averageGrade: string
  numericAverage: number | null
  rank: string
  status: string
  subjects: AcademicRecordSubject[]
  attendance: string
  behavior: string
  teacherComments: string
}

export interface AcademicOverviewData {
  stats: {
    totalStudents: number
    averageGrade: string
    numericAverage: number | null
    passRate: number
    studentsFollowed: number
  }
  students: AcademicRecordStudent[]
  distribution: {
    excellent: number
    bien: number
    assezBien: number
    passable: number
    insuffisant: number
  }
  topSubjects: { name: string; average: number }[]
  weakSubjects: { name: string; average: number }[]
  trimesterAverages: (number | null)[]
}

export function useAcademicOverview(filters?: {
  classId?: number
  academicYearId?: number
  trimester?: number
}) {
  const [data, setData] = useState<AcademicOverviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const classId = filters?.classId
  const academicYearId = filters?.academicYearId

  const load = useCallback(async (overrides?: {
    classId?: number
    academicYearId?: number
    trimester?: number
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      const f = overrides ?? filters
      if (f?.classId) params.set("classId", String(f.classId))
      if (f?.academicYearId) params.set("academicYearId", String(f.academicYearId))
      if (f?.trimester) params.set("trimester", String(f.trimester))
      const res = await window.fetch(`/api/academic-history/overview?${params}`, { cache: "no-store" })
      const json = await res.json()
      if (json.ok) setData(json.data)
      else setError(json.message)
    } catch (e) {
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (classId && academicYearId) {
      load()
    } else {
      setIsLoading(false)
    }
  }, [load, classId, academicYearId])

  return { data, isLoading, error, refetch: load }
}
