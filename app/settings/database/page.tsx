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
import { Database, Download, Upload, Trash2, HardDrive, RefreshCw, AlertTriangle, Server, CheckCircle2, X } from "lucide-react"

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

const PROTECTED_TABLES = ["users", "academic_years", "school_info"]

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
    </AppLayout>
  )
}
