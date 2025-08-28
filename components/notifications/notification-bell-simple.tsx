"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

export function NotificationBellSimple() {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = 3

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => {
          console.log("NotificationBell clicked, isOpen:", !isOpen)
          setIsOpen(!isOpen)
        }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] p-4">
          <h3 className="font-semibold mb-2">Notifications</h3>
          <p className="text-sm text-gray-600">Test notification</p>
          <p className="text-sm text-gray-600">Test notification 2</p>
          <p className="text-sm text-gray-600">Test notification 3</p>
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}


