"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

interface HelpButtonProps {
  section: string
}

export function HelpButton({ section }: HelpButtonProps) {
  return (
    <Button variant="outline" size="icon" asChild className="rounded-full h-8 w-8 shrink-0">
      <Link href={`/aide#${section}`}>
        <HelpCircle className="h-4 w-4" />
        <span className="sr-only">Aide</span>
      </Link>
    </Button>
  )
}
