"use client"

import { useState, useEffect, useCallback } from "react"

export interface SchoolInfoData {
  id: string
  name: string
  address: string
  phone: string
  email: string
  website: string
  director: string
  logoUrl: string
  foundedYear: number | null
}

export interface AcademicYearData {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

export interface SubjectData {
  id: string
  name: string
  code: string
  coefficient: number
  hoursPerWeek: number
  description: string
  color: string
  status: string
  teacherNumber: number
}

export function useSchoolInfo() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfoData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await window.fetch("/api/settings/school")
      const json = await res.json()
      if (json.ok) setSchoolInfo(json.data)
    } catch {} finally { setIsLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async (input: Partial<SchoolInfoData>) => {
    const res = await window.fetch("/api/settings/school", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    setSchoolInfo(json.data)
    return json.data as SchoolInfoData
  }

  return { schoolInfo, isLoading, save, refetch: load }
}

export function useAcademicYears() {
  const [years, setYears] = useState<AcademicYearData[]>([])
  const [currentYear, setCurrentYear] = useState<AcademicYearData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [allRes, curRes] = await Promise.all([
        window.fetch("/api/academic-years"),
        window.fetch("/api/academic-years?current=true"),
      ])
      const allJson = await allRes.json()
      const curJson = await curRes.json()
      if (allJson.ok) setYears(allJson.data)
      if (curJson.ok) setCurrentYear(curJson.data)
    } catch {} finally { setIsLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (input: { name: string; startDate: string; endDate: string; isCurrent?: boolean }) => {
    const res = await window.fetch("/api/academic-years", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
    return json.data as AcademicYearData
  }

  const update = async (id: string, input: Partial<AcademicYearData>) => {
    const res = await window.fetch(`/api/academic-years/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
    return json.data as AcademicYearData
  }

  const remove = async (id: string) => {
    const res = await window.fetch(`/api/academic-years/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
  }

  return { years, currentYear, isLoading, create, update, remove, refetch: load }
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<SubjectData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await window.fetch("/api/subjects")
      const json = await res.json()
      if (json.ok) setSubjects(json.data)
    } catch {} finally { setIsLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (input: Omit<SubjectData, "id">) => {
    const res = await window.fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
    return json.data as SubjectData
  }

  const update = async (id: string, input: Partial<SubjectData>) => {
    const res = await window.fetch(`/api/subjects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
    return json.data as SubjectData
  }

  const remove = async (id: string) => {
    const res = await window.fetch(`/api/subjects/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    await load()
  }

  return { subjects, isLoading, create, update, remove, refetch: load }
}
