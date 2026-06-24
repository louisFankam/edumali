"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Database, Download, Upload, Trash2, HardDrive, Save, RefreshCw, AlertTriangle, Server, CheckCircle2, X, RotateCcw } from "lucide-react"

interface TableInfo {
  name: string
  rowCount: number
}

interface DbInfo {
  path: string
  sizeBytes: number
  lastModified: string
  tables: TableInfo[]
}

interface BackupInfo {
  filename: string
  sizeBytes: number
  createdAt: string
}

const PROTECTED_TABLES = ["users", "academic_years", "school_info"]
const BACKUPS_PER_PAGE = 10

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR")
}

export default function DatabasePage() {
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [excludeAudit, setExcludeAudit] = useState(false)
  const [deleteTable, setDeleteTable] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [backupsLoading, setBackupsLoading] = useState(false)
  const [creatingBackup, setCreatingBackup] = useState(false)
  const [restoreFilename, setRestoreFilename] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [backupMessage, setBackupMessage] = useState<{ ok: boolean; message: string } | null>(null)
  const [backupPage, setBackupPage] = useState(1)

  const loadInfo = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/database/info")
      const json = await res.json()
      if (json.ok) setDbInfo(json.data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadInfo() }, [loadInfo])

  const handleExport = async () => {
    const params = new URLSearchParams()
    if (excludeAudit) params.set("excludeAudit", "true")
    const res = await fetch(`/api/database/export?${params.toString()}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `edumali-data-${new Date().toISOString().slice(0, 10)}.db`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    setImportResult(null)
    try {
      const formData = new FormData()
      formData.append("file", importFile)
      const res = await fetch("/api/database/import", { method: "POST", body: formData })
      const json = await res.json()
      setImportResult(json)
      if (json.ok) setImportFile(null)
    } catch (e) {
      setImportResult({ ok: false, message: String(e) })
    } finally {
      setImporting(false)
      setShowImportConfirm(false)
    }
  }

  const handleDeleteTable = async () => {
    if (!deleteTable || deletePassword.length < 4) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/database/table/${deleteTable}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      })
      const json = await res.json()
      if (json.ok) {
        await loadInfo()
        setDeleteTable(null)
        setDeletePassword("")
        setDeleteConfirmText("")
      } else {
        alert(json.message)
      }
    } catch (e) {
      alert(String(e))
    } finally {
      setDeleting(false)
    }
  }

  const loadBackups = useCallback(async () => {
    setBackupsLoading(true)
    try {
      const res = await fetch("/api/database/backups")
      const json = await res.json()
      if (json.ok) { setBackups(json.data); setBackupPage(1) }
    } finally {
      setBackupsLoading(false)
    }
  }, [])

  useEffect(() => { loadBackups() }, [loadBackups])

  const handleCreateBackup = async () => {
    setCreatingBackup(true)
    try {
      const res = await fetch("/api/database/backups", { method: "POST" })
      const json = await res.json()
      if (json.ok) {
        await loadBackups()
        setBackupMessage({ ok: true, message: `Sauvegarde créée : ${json.data.filename}` })
      } else {
        setBackupMessage({ ok: false, message: json.message })
      }
    } catch (e) {
      setBackupMessage({ ok: false, message: String(e) })
    } finally {
      setCreatingBackup(false)
    }
  }

  const handleDeleteBackup = async (filename: string) => {
    try {
      const res = await fetch(`/api/database/backups/${encodeURIComponent(filename)}`, { method: "DELETE" })
      const json = await res.json()
      if (json.ok) {
        await loadBackups()
      } else {
        alert(json.message)
      }
    } catch (e) {
      alert(String(e))
    }
  }

  const handleRestoreBackup = async () => {
    if (!restoreFilename) return
    setRestoring(true)
    try {
      const res = await fetch(`/api/database/backups/${encodeURIComponent(restoreFilename)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      })
      const json = await res.json()
      setBackupMessage(json)
      if (json.ok) setRestoreFilename(null)
    } catch (e) {
      setBackupMessage({ ok: false, message: String(e) })
    } finally {
      setRestoring(false)
    }
  }

  const backupStartIndex = (backupPage - 1) * BACKUPS_PER_PAGE
  const backupEndIndex = backupStartIndex + BACKUPS_PER_PAGE
  const pagedBackups = backups.slice(backupStartIndex, backupEndIndex)
  const backupTotalPages = Math.ceil(backups.length / BACKUPS_PER_PAGE)

  return (
    <AppLayout>
      <PageHeader title="Base de Données" description="Gestion, sauvegarde et maintenance">
        <HelpButton section="base-de-donnees" />
        <Button variant="outline" onClick={loadInfo} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </PageHeader>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Chargement...
              </div>
            ) : dbInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Taille</p>
                  <p className="text-2xl font-bold">{formatSize(dbInfo.sizeBytes)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dernière modification</p>
                  <p className="text-lg font-medium">{formatDate(dbInfo.lastModified)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tables</p>
                  <p className="text-2xl font-bold">{dbInfo.tables.length}</p>
                </div>
              </div>
            ) : (
              <p className="text-destructive">Impossible de charger les informations</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Tables
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead className="text-right">Enregistrements</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dbInfo?.tables.map(t => (
                  <TableRow key={t.name}>
                    <TableCell className="font-mono text-sm">{t.name}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{t.rowCount.toLocaleString("fr-FR")}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {PROTECTED_TABLES.includes(t.name) ? (
                        <Badge variant="outline" className="text-muted-foreground">Protégée</Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => { setDeleteTable(t.name); setDeletePassword(""); setDeleteConfirmText("") }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exporter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Téléchargez une copie complète de la base de données pour sauvegarde ou transfert.
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={excludeAudit} onChange={e => setExcludeAudit(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300" />
                Exclure les logs d'audit
              </label>
              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Télécharger la base
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Remplacez la base actuelle par un fichier précédemment exporté.
              </p>
              <Input
                type="file"
                accept=".db"
                onChange={e => setImportFile(e.target.files?.[0] || null)}
              />
              <Button
                onClick={() => setShowImportConfirm(true)}
                disabled={!importFile}
                variant="destructive"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importer et remplacer
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Sauvegardes automatiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Une sauvegarde est créée automatiquement chaque jour au démarrage ou à 18h.
              Les {backups.length} plus récentes sont conservées.
            </p>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateBackup} disabled={creatingBackup}>
                {creatingBackup ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Créer une sauvegarde
              </Button>
              <Button variant="outline" onClick={loadBackups} disabled={backupsLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${backupsLoading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
            {backups.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fichier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Taille</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedBackups.map(b => (
                      <TableRow key={b.filename}>
                        <TableCell className="font-mono text-sm">{b.filename}</TableCell>
                        <TableCell className="text-sm">{formatDate(b.createdAt)}</TableCell>
                        <TableCell className="text-sm">{formatSize(b.sizeBytes)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRestoreFilename(b.filename)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restaurer
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteBackup(b.filename)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {backupTotalPages > 1 && (
                  <div className="flex items-center justify-between space-x-2 py-2">
                    <div className="text-sm text-muted-foreground">
                      Affichage de {backupStartIndex + 1} à {Math.min(backupEndIndex, backups.length)} sur {backups.length} sauvegardes
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBackupPage(backupPage - 1)}
                        disabled={backupPage === 1}
                        className="bg-transparent"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(backupTotalPages, 5) }, (_, i) => {
                          let page
                          if (backupTotalPages <= 5) {
                            page = i + 1
                          } else if (backupPage <= 3) {
                            page = i + 1
                          } else if (backupPage >= backupTotalPages - 2) {
                            page = backupTotalPages - 4 + i
                          } else {
                            page = backupPage - 2 + i
                          }
                          return (
                            <Button
                              key={page}
                              variant={backupPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setBackupPage(page)}
                              className={backupPage === page ? "" : "bg-transparent"}
                            >
                              {page}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBackupPage(backupPage + 1)}
                        disabled={backupPage === backupTotalPages}
                        className="bg-transparent"
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {backupsLoading ? "Chargement..." : "Aucune sauvegarde pour le moment"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmer l'importation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Cette action va <strong>remplacer</strong> la base de données actuelle par le fichier sélectionné.
              Une sauvegarde automatique sera créée avant le remplacement.
            </p>
            {importFile && (
              <p className="text-sm text-muted-foreground">
                Fichier : <strong>{importFile.name}</strong> ({(importFile.size / 1024).toFixed(1)} Ko)
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImportConfirm(false)}>Annuler</Button>
              <Button variant="destructive" onClick={handleImport} disabled={importing}>
                {importing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                Confirmer l'importation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!importResult} onOpenChange={() => setImportResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {importResult?.ok ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-destructive" />
              )}
              {importResult?.ok ? "Importation réussie" : "Erreur"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">{importResult?.message}</p>
            {importResult?.ok && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <strong>Important :</strong> Veuillez redémarrer l'application pour que les changements prennent effet.
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setImportResult(null)}>Fermer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTable} onOpenChange={o => { if (!o) { setDeleteTable(null); setDeletePassword(""); setDeleteConfirmText("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Vider la table
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Vous êtes sur le point de <strong>vider</strong> la table <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{deleteTable}</code>.
              Toutes les données seront supprimées définitivement. Le schéma de la table sera conservé.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tapez <code className="bg-muted px-1 py-0.5 rounded font-mono">{deleteTable}</code> pour confirmer
              </label>
              <Input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder={deleteTable || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mot de passe administrateur</label>
              <Input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                placeholder="Votre mot de passe" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setDeleteTable(null); setDeletePassword(""); setDeleteConfirmText("") }}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTable}
                disabled={deleteConfirmText !== deleteTable || deletePassword.length < 4 || deleting}
              >
                {deleting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                Vider la table
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!restoreFilename} onOpenChange={o => { if (!o) setRestoreFilename(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Restaurer une sauvegarde
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Vous êtes sur le point de <strong>remplacer</strong> la base de données actuelle par la sauvegarde :
            </p>
            {restoreFilename && (
              <p className="text-sm font-mono bg-muted p-2 rounded">{restoreFilename}</p>
            )}
            <p className="text-sm text-destructive font-medium">
              Cette action est irréversible. L'application devra être redémarrée.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRestoreFilename(null)}>Annuler</Button>
              <Button variant="destructive" onClick={handleRestoreBackup} disabled={restoring}>
                {restoring ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                Restaurer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!backupMessage} onOpenChange={() => setBackupMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {backupMessage?.ok ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-destructive" />
              )}
              {backupMessage?.ok ? "Succès" : "Erreur"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">{backupMessage?.message}</p>
            {backupMessage?.ok && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                Si vous avez restauré une sauvegarde, veuillez redémarrer l'application.
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setBackupMessage(null)}>Fermer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
