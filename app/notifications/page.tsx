"use client"

import { useState, useMemo, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  GraduationCap,
  Calendar,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  Loader2
} from "lucide-react"
import { useNotifications, Notification } from "@/hooks/use-notifications"
import Link from "next/link"

export default function NotificationsPage() {
  const { notifications, isLoading, error, unreadCount, markAsRead, markAllAsRead, refresh } = useNotifications()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [showRead, setShowRead] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case "absence":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case "payment":
        return <DollarSign className="h-5 w-5 text-red-500" />
      case "exam":
        return <GraduationCap className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
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

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleRefresh = async () => {
    await refresh()
  }

  // Fonctions de pagination
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "À l'instant"
    if (diffInHours === 1) return "Il y a 1 heure"
    if (diffInHours < 24) return `Il y a ${diffInHours} heures`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "Hier"
    return `Il y a ${diffInDays} jours`
  }

  const filteredNotifications = useMemo(() => {
  return notifications.filter(notification => {
    const categoryMatch = selectedCategory === "all" || notification.category === selectedCategory
    const priorityMatch = selectedPriority === "all" || notification.priority === selectedPriority
    const readMatch = showRead || !notification.is_read
    return categoryMatch && priorityMatch && readMatch
  })
}, [notifications, selectedCategory, selectedPriority, showRead])

  // Calcul de la pagination
  const totalItems = filteredNotifications.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentNotifications = filteredNotifications.slice(startIndex, endIndex)

  // Réinitialiser la page courante si elle dépasse le nombre total de pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  const categories = [
    { value: "all", label: "Toutes", count: notifications.length },
    { value: "absence", label: "Absences", count: notifications.filter(n => n.category === "absence").length },
    { value: "payment", label: "Paiements", count: notifications.filter(n => n.category === "payment").length },
    { value: "exam", label: "Examens", count: notifications.filter(n => n.category === "exam").length },
    { value: "general", label: "Général", count: notifications.filter(n => n.category === "general").length }
  ]

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <PageHeader
              title="Notifications"
              description="Gérez toutes vos notifications et alertes"
              className=""
              children=""
            />
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Afficher:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">par page</span>
              </div>
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || isLoading}
              >
                <Eye className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : notifications.length}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : unreadCount}</p>
                    <p className="text-sm text-muted-foreground">Non lues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {isLoading ? "-" : notifications.filter(n => n.category === "payment").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Paiements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {isLoading ? "-" : notifications.filter(n => n.category === "exam").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Examens</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtres</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Catégorie:</span>
                  <div className="flex space-x-1">
                    {categories.map((category) => (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.value)}
                        disabled={isLoading}
                      >
                        {category.label}
                        <Badge variant="secondary" className="ml-1">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Priorité:</span>
                  <div className="flex space-x-1">
                    {["all", "high", "medium", "low"].map((priority) => (
                      <Button
                        key={priority}
                        variant={selectedPriority === priority ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPriority(priority)}
                        disabled={isLoading}
                      >
                        {priority === "all" ? "Toutes" : 
                         priority === "high" ? "Haute" :
                         priority === "medium" ? "Moyenne" : "Basse"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Afficher:</span>
                  <Button
                    variant={showRead ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowRead(!showRead)}
                    disabled={isLoading}
                  >
                    {showRead ? "Toutes" : "Non lues uniquement"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des notifications */}
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Chargement des notifications...</p>
                </CardContent>
              </Card>
            ) : currentNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
                  <p className="text-gray-500">Aucune notification ne correspond à vos filtres.</p>
                </CardContent>
              </Card>
            ) : (
              currentNotifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${
                    notification.is_read ? "opacity-75" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`text-sm font-medium ${
                                notification.is_read ? "text-gray-700" : "text-gray-900"
                              }`}>
                                {notification.title}
                              </h3>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {notification.priority === "high" ? "Haute" :
                                 notification.priority === "medium" ? "Moyenne" : "Basse"}
                              </Badge>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(notification.created)}</span>
                              </span>
                              <span className="capitalize">{notification.category}</span>
                              {notification.expand?.target_class_id && (
                                <span>Classe: {notification.expand.target_class_id.name}</span>
                              )}
                              {notification.expand?.target_student_id && (
                                <span>Élève: {notification.expand.target_student_id.first_name}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Contrôles de pagination */}
            {totalPages > 1 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Affichage de {startIndex + 1} à {Math.min(endIndex, totalItems)} sur {totalItems} notifications
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                      >
                        Précédent
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber
                          if (totalPages <= 5) {
                            pageNumber = i + 1
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i
                          } else {
                            pageNumber = currentPage - 2 + i
                          }
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(pageNumber)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNumber}
                            </Button>
                          )
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}