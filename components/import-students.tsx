"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export interface ImportRow {
  line: number
  firstName: string
  lastName: string
  gender: string
  birthDate: string
  parentName: string
  parentPhone: string
  className: string
  errors: string[]
}

export interface ImportResult {
  total: number
  imported: number
  errors: { line: number; message: string }[]
}

export function ImportStudents() {
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<ImportRow[] | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importing, setImporting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", f)
      const res = await fetch("/api/students/import", { method: "POST", body: formData })
      const json = await res.json()
      if (!json.ok) throw new Error(json.message)
      setRows(json.data)
    } catch (err: any) {
      toast.error(err.message || "Erreur de lecture du fichier")
      setRows(null)
    }
  }

  const handleImport = async () => {
    if (!rows) return
    setImporting(true)
    try {
      const res = await fetch("/api/students/import?action=execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.message)
      setResult(json.data)
      toast.success(`${json.data.imported} élève(s) importé(s)`)
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'import")
    } finally {
      setImporting(false)
    }
  }

  const validCount = rows ? rows.filter(r => r.errors.length === 0).length : 0
  const errorCount = rows ? rows.filter(r => r.errors.length > 0).length : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Importer des élèves</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={importing}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choisir un fichier CSV ou Excel
            </Button>
            <span className="text-sm text-muted-foreground">
              {file ? file.name : "Aucun fichier sélectionné"}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertTitle>Format attendu</AlertTitle>
            <AlertDescription>
              Colonnes reconnues : Nom, Prénom, Date de naissance (AAAA-MM-JJ), Sexe (M/F),
              Classe, Parent, Téléphone, Adresse, Réduction type (pourcentage/fixe),
              Réduction valeur, Raison. Les colonnes peuvent être en français ou anglais.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {rows && rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Aperçu — {rows.length} ligne(s) détectée(s)
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({validCount} valide{validCount > 1 ? "s" : ""}
                {errorCount > 0 && `, ${errorCount} avec erreur${errorCount > 1 ? "s" : ""}`})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ligne</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Sexe</TableHead>
                    <TableHead>Date naiss.</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Tél.</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 100).map((r) => (
                    <TableRow key={r.line} className={r.errors.length > 0 ? "bg-red-50" : "bg-green-50"}>
                      <TableCell>{r.line}</TableCell>
                      <TableCell>{r.firstName}</TableCell>
                      <TableCell>{r.lastName}</TableCell>
                      <TableCell>{r.gender}</TableCell>
                      <TableCell>{r.birthDate}</TableCell>
                      <TableCell>{r.className}</TableCell>
                      <TableCell>{r.parentName}</TableCell>
                      <TableCell>{r.parentPhone}</TableCell>
                      <TableCell>
                        {r.errors.length > 0 ? (
                          <span className="text-red-600 text-xs" title={r.errors.join("; ")}>
                            <AlertCircle className="h-4 w-4 inline mr-1" />Erreur
                          </span>
                        ) : (
                          <span className="text-green-600 text-xs">
                            <CheckCircle2 className="h-4 w-4 inline mr-1" />Ok
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {rows.length > 100 && (
                <p className="text-sm text-muted-foreground p-2 text-center">
                  ... et {rows.length - 100} ligne(s) supplémentaire(s)
                </p>
              )}
            </div>

            {errorCount > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-600">Détail des erreurs :</p>
                {rows.filter(r => r.errors.length > 0).slice(0, 20).map(r => (
                  <p key={r.line} className="text-xs text-red-600">
                    Ligne {r.line} : {r.errors.join("; ")}
                  </p>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleImport}
                disabled={validCount === 0 || importing}
              >
                {importing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Import en cours...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" />Importer {validCount} élève(s)</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Résultat de l'import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{result.total}</div>
                <div className="text-sm text-muted-foreground">Total lignes</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                <div className="text-sm text-muted-foreground">Importés</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                <div className="text-sm text-muted-foreground">Erreurs</div>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-600">Erreurs :</p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600">
                    {e.line > 0 ? `Ligne ${e.line}` : "Général"} : {e.message}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}