"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import Link from "next/link"
import { useNotifications } from "@/hooks/use-notifications"

export function NotificationBellMain() {
  const { unreadCount, isLoading } = useNotifications()

  return (
    <Link href="/notifications">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-red-50 hover:text-red-600 transition-colors"
        disabled={isLoading}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium min-w-5"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
        {isLoading && (
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-muted flex items-center justify-center">
            <div className="animate-pulse h-3 w-3 bg-gray-400 rounded-full" />
          </div>
        )}
      </Button>
    </Link>
  )
}