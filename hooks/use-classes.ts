"use client"

import { useState, useEffect } from "react"

export interface ClassData {
  id: string
  name: string
}

export function useClasses() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/classes", { cache: "no-store" })
      .then(r => r.json())
      .then(json => { if (json.ok) setClasses(json.data) })
      .finally(() => setIsLoading(false))
  }, [])

  return { classes, isLoading }
}
