"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

export function NotificationBellTest() {
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Button clicked!")
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="p-2 rounded-md hover:bg-gray-100"
        onClick={handleClick}
      >
        <Bell className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <p className="font-semibold">Notifications</p>
          <p className="text-sm text-gray-600">Test notification</p>
        </div>
      )}
    </div>
  )
}


