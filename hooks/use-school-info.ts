"use client"

import { useState } from "react"

interface SchoolInfo {
  id: string
  name: string
  address: string
  phone: string
  email: string
  logo?: string
}

export function useSchoolInfo() {
  const [schoolInfo] = useState<SchoolInfo>({
    id: "school_1",
    name: "École Primaire de Bamako",
    address: "Bamako, Mali",
    phone: "+223 20 00 00 00",
    email: "contact@bamako-school.ml",
    logo: "/placeholder-logo.png"
  })

  return {
    schoolInfo,
    isLoading: false,
    updateSchoolInfo: async (data: any) => console.log("Update mocked", data)
  }
}
