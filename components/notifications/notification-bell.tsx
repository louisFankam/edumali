"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  GraduationCap,
  Calendar,
  Trash2
} from "lucide-react"

interface Notification {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  timestamp: Date
  read: boolean
  category: "absence" | "payment" | "exam" | "general"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "warning",
    title: "Absence non justifiée",
    message: "Aminata Koné (CP) absente depuis 3 jours",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
    read: false,
    category: "absence"
  },
  {
    id: "2",
    type: "error",
    title: "Paiement en retard",
    message: "5 familles ont des paiements en retard",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h ago
    read: false,
    category: "payment"
  },
  {
    id: "3",
    type: "info",
    title: "Examen à venir",
    message: "Contrôle de Mathématiques CM2 demain",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h ago
    read: true,
    category: "exam"
  },
  {
    id: "4",
    type: "success",
    title: "Inscription réussie",
    message: "Nouvel élève inscrit en CE1",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8h ago
    read: true,
    category: "general"
  },
  {
    id: "5",
    type: "warning",
    title: "Professeur absent",
    message: "M. Koné absent aujourd'hui - remplacement nécessaire",
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10h ago
    read: false,
    category: "absence"
  }
]

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case "absence":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "payment":
        return <DollarSign className="h-4 w-4 text-red-500" />
      case "exam":
        return <GraduationCap className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50"
      case "warning":
        return "border-orange-200 bg-orange-50"
      case "error":
        return "border-red-200 bg-red-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "À l'instant"
    if (diffInHours === 1) return "Il y a 1 heure"
    if (diffInHours < 24) return `Il y a ${diffInHours} heures`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "Hier"
    return `Il y a ${diffInDays} jours`
  }

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5)

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
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] max-h-96 overflow-hidden">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Tout marquer comme lu
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-64">
                    <div className="space-y-1 p-2">
                      {displayedNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                            notification.read 
                              ? "bg-gray-50 border-gray-100" 
                              : getNotificationColor(notification.type)
                          } hover:bg-gray-100`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              {getNotificationIcon(notification.category)}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${
                                  notification.read ? "text-gray-700" : "text-gray-900"
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTimeAgo(notification.timestamp)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-400 hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {notifications.length > 5 && (
                    <div className="p-3 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAll(!showAll)}
                        className="w-full text-blue-600 hover:text-blue-700"
                      >
                        {showAll ? "Voir moins" : `Voir toutes (${notifications.length})`}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
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
