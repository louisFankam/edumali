"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import Link from "next/link"

interface Notification {
  id: string
  read: boolean
}

const mockNotifications: Notification[] = [
  { id: "1", read: false },
  { id: "2", read: false },
  { id: "3", read: true },
  { id: "4", read: true },
  { id: "5", read: false }
]

export function NotificationBellMain() {
  const [notifications] = useState<Notification[]>(mockNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Link href="/notifications">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>
    </Link>
  )
}

