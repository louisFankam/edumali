"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  RefreshCw
} from "lucide-react"

interface Notification {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  timestamp: Date
  read: boolean
  category: "absence" | "payment" | "exam" | "general"
  priority: "low" | "medium" | "high"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "warning",
    title: "Absence non justifiée",
    message: "Aminata Koné (CP) absente depuis 3 jours sans justification. Veuillez contacter les parents.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
    read: false,
    category: "absence",
    priority: "high"
  },
  {
    id: "2",
    type: "error",
    title: "Paiements en retard",
    message: "5 familles ont des paiements en retard pour ce mois. Montant total: 450,000 FCFA",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h ago
    read: false,
    category: "payment",
    priority: "high"
  },
  {
    id: "3",
    type: "info",
    title: "Examen à venir",
    message: "Contrôle de Mathématiques CM2 prévu pour demain à 10h00. Préparer les salles d'examen.",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h ago
    read: true,
    category: "exam",
    priority: "medium"
  },
  {
    id: "4",
    type: "success",
    title: "Inscription réussie",
    message: "Nouvel élève inscrit en CE1 : Fatoumata Diarra. Dossier complet reçu.",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8h ago
    read: true,
    category: "general",
    priority: "low"
  },
  {
    id: "5",
    type: "warning",
    title: "Professeur absent",
    message: "M. Koné absent aujourd'hui pour raisons médicales. Remplacement nécessaire pour les cours de Français CE2.",
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10h ago
    read: false,
    category: "absence",
    priority: "medium"
  },
  {
    id: "6",
    type: "info",
    title: "Réunion parents-professeurs",
    message: "Réunion parents-professeurs prévue vendredi à 16h00. Préparer les bulletins.",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12h ago
    read: true,
    category: "general",
    priority: "medium"
  },
  {
    id: "7",
    type: "success",
    title: "Maintenance terminée",
    message: "La maintenance du système informatique est terminée. Tous les services sont opérationnels.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    category: "general",
    priority: "low"
  },
  {
    id: "8",
    type: "error",
    title: "Problème de chauffage",
    message: "Problème de chauffage détecté dans la salle CM1. Intervention technique nécessaire.",
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
    read: false,
    category: "general",
    priority: "high"
  },
  {
    id: "9",
    type: "info",
    title: "Nouveau matériel informatique",
    message: "Livraison de 10 nouveaux ordinateurs pour la salle informatique. Installation prévue demain.",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    read: true,
    category: "general",
    priority: "medium"
  },
  {
    id: "10",
    type: "success",
    title: "Réussite aux examens",
    message: "Taux de réussite de 95% aux examens de fin d'année. Félicitations à tous les élèves !",
    timestamp: new Date(Date.now() - 60 * 60 * 60 * 1000), // 2.5 days ago
    read: true,
    category: "exam",
    priority: "medium"
  },
  {
    id: "11",
    type: "warning",
    title: "Absence prolongée",
    message: "Mariam Coulibaly (CE2) absente depuis 5 jours. Contacter immédiatement la famille.",
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
    read: false,
    category: "absence",
    priority: "high"
  },
  {
    id: "12",
    type: "info",
    title: "Réunion du conseil d'école",
    message: "Réunion du conseil d'école prévue vendredi prochain à 18h00. Ordre du jour à préparer.",
    timestamp: new Date(Date.now() - 84 * 60 * 60 * 1000), // 3.5 days ago
    read: true,
    category: "general",
    priority: "medium"
  },
  {
    id: "13",
    type: "error",
    title: "Panne électrique",
    message: "Panne électrique dans le bâtiment B. Intervention d'urgence nécessaire.",
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000), // 4 days ago
    read: false,
    category: "general",
    priority: "high"
  },
  {
    id: "14",
    type: "success",
    title: "Don de livres",
    message: "Don de 200 livres reçu de la bibliothèque municipale. Merci pour ce généreux don !",
    timestamp: new Date(Date.now() - 108 * 60 * 60 * 1000), // 4.5 days ago
    read: true,
    category: "general",
    priority: "low"
  },
  {
    id: "15",
    type: "warning",
    title: "Retard de paiement",
    message: "3 familles en retard de paiement pour les frais de cantine. Relance nécessaire.",
    timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000), // 5 days ago
    read: false,
    category: "payment",
    priority: "medium"
  }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [showRead, setShowRead] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const unreadCount = notifications.filter(n => !n.read).length

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

  const getPriorityColor = (priority: string) => {
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
    setCurrentPage(1) // Retour à la première page
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

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const categoryMatch = selectedCategory === "all" || notification.category === selectedCategory
      const priorityMatch = selectedPriority === "all" || notification.priority === selectedPriority
      const readMatch = showRead || !notification.read
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
  useMemo(() => {
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <PageHeader
              title="Notifications"
              description="Gérez toutes vos notifications et alertes"
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
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <Eye className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
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
                    <p className="text-2xl font-bold">{notifications.length}</p>
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
                    <p className="text-2xl font-bold">{unreadCount}</p>
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
                    <p className="text-2xl font-bold">{notifications.filter(n => n.category === "payment").length}</p>
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
                    <p className="text-2xl font-bold">{notifications.filter(n => n.category === "exam").length}</p>
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
                  >
                    {showRead ? "Toutes" : "Non lues uniquement"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des notifications */}
          <div className="space-y-4">
            {currentNotifications.length === 0 ? (
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
                    notification.read ? "opacity-75" : ""
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
                                notification.read ? "text-gray-700" : "text-gray-900"
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
                              {!notification.read && (
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(notification.timestamp)}</span>
                              </span>
                              <span className="capitalize">{notification.category}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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


