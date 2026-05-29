"use client"

import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ScrollToTop() {
  return (
    <div className="flex justify-center pt-4">
      <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <ArrowUp className="h-4 w-4 mr-2" />
        Retour en haut
      </Button>
    </div>
  )
}
