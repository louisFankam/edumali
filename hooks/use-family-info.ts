"use client"

import { useState, useEffect, useCallback } from "react"

export interface FamilyInfo {
  id: string
  studentId: string
  fatherName: string
  fatherPhone: string
  fatherProfession: string
  motherName: string
  motherPhone: string
  motherProfession: string
  guardianName: string
  guardianRelation: string
  guardianPhone: string
}

export function useFamilyInfo(studentId: string | undefined) {
  const [data, setData] = useState<FamilyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!studentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const res = await window.fetch(`/api/students/family?studentId=${studentId}`)
      const json = await res.json()
      if (json.ok) setData(json.data)
    } finally {
      setIsLoading(false)
    }
  }, [studentId])

  useEffect(() => { load() }, [load])

  const save = async (input: Partial<FamilyInfo>) => {
    const res = await window.fetch("/api/students/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, ...input }),
    })
    const json = await res.json()
    if (json.ok) await load()
    return json
  }

  return { data, isLoading, save, refetch: load }
}
