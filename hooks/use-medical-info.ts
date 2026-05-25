"use client"

import { useState, useEffect, useCallback } from "react"

export interface MedicalInfo {
  id: string
  studentId: string
  bloodType: string
  allergies: string
  medicalConditions: string
  medications: string
  doctorName: string
  doctorPhone: string
  emergencyContact: string
  emergencyPhone: string
  vaccinationStatus: string
}

export function useMedicalInfo(studentId: string | undefined) {
  const [data, setData] = useState<MedicalInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!studentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const res = await window.fetch(`/api/students/medical?studentId=${studentId}`)
      const json = await res.json()
      if (json.ok) setData(json.data)
    } finally {
      setIsLoading(false)
    }
  }, [studentId])

  useEffect(() => { load() }, [load])

  const save = async (input: Partial<MedicalInfo>) => {
    const res = await window.fetch("/api/students/medical", {
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
