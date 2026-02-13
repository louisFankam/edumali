"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSalaryExport } from "@/hooks/use-salary-export"
import { COLLECTIONS, getFileUrl, getAuthToken } from "@/lib/pocketbase"
import {
  Download,
  Calendar,
  FileText,
  Eye,
  Clock,
  FolderOpen,
  RefreshCw
} from "lucide-react"

interface SalaryHistoryRecord {
  id: string
  date: string
  file: string
  created: string
  updated: string
}

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const [year, month] = dateString.split('-')
  const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  return `${monthNames[parseInt(month) - 1]} ${year}`
}

// Fonction pour formater la date de création
const formatCreatedDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Composant pour afficher un fichier d'historique
function HistoryFileCard({ record, onDownload }: { 
  record: SalaryHistoryRecord, 
  onDownload: (record: SalaryHistoryRecord) => void 
}) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await onDownload(record)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg">
              Salaires {formatDate(record.date)}
            </CardTitle>
          </div>
          <Badge variant="secondary">
            PDF
          </Badge>
        </div>
        <CardDescription>
          Exporté le {formatCreatedDate(record.created)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Période: {formatDate(record.date)}</span>
          </div>
          <Button 
            onClick={handleDownload}
            disabled={isDownloading}
            size="sm"
          >
            {isDownloading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="ml-2">
              {isDownloading ? 'Téléchargement...' : 'Télécharger'}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HistoriqueSalairePage() {
  const { salaryHistory, isLoading, fetchSalaryHistory } = useSalaryExport()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    fetchSalaryHistory()
  }, [fetchSalaryHistory])

  const handleDownload = async (record: SalaryHistoryRecord) => {
    try {
      setDownloadingId(record.id)

      const authToken = getAuthToken()
      if (!authToken) {
        throw new Error('Non authentifié')
      }

      // Télécharger le fichier
      const response = await fetch(
        getFileUrl(COLLECTIONS.SALARY_HISTORY, record.id, record.file, authToken)
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erreur de téléchargement:', response.status, errorText)
        throw new Error(`Erreur lors du téléchargement (${response.status}): ${errorText}`)
      }
      
      // Créer un blob et déclencher le téléchargement
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `salaires_${record.date}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      alert('Erreur lors du téléchargement du fichier')
    } finally {
      setDownloadingId(null)
    }
  }

  // Statistiques
  const totalFiles = salaryHistory.length
  const latestFile = salaryHistory.length > 0 ? salaryHistory[0] : null
  const oldestFile = salaryHistory.length > 0 ? salaryHistory[salaryHistory.length - 1] : null

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Historique des Salaires"
            description="Consultez et téléchargez les rapports de salaires exportés automatiquement à la fin de chaque mois"
            className=""
          >
            <Button onClick={fetchSalaryHistory} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </PageHeader>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total des exports</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalFiles}</div>
                <p className="text-xs text-muted-foreground">Fichiers PDF</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dernier export</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {latestFile ? formatDate(latestFile.date) : 'Aucun'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {latestFile ? formatCreatedDate(latestFile.created) : 'Jamais exporté'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Premier export</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {oldestFile ? formatDate(oldestFile.date) : 'Aucun'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {oldestFile ? formatCreatedDate(oldestFile.created) : 'Jamais exporté'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Liste des fichiers */}
          <Card>
            <CardHeader>
              <CardTitle>Fichiers d'export</CardTitle>
              <CardDescription>
                Tous les rapports de salaires exportés automatiquement à la fin de chaque mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Chargement...</span>
                </div>
              ) : salaryHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Aucun fichier d'export
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Les fichiers d'export apparaîtront ici à la fin de chaque mois
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {salaryHistory.map((record) => (
                    <HistoryFileCard
                      key={record.id}
                      record={record}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}