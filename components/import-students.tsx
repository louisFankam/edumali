"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download, Info } from "lucide-react"
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

const TEMPLATE_HEADERS = [
  "Prénom", "Nom", "Date de naissance", "Sexe", "Classe",
  "Parent", "Téléphone", "Adresse",
  "Réduction type", "Réduction valeur", "Raison réduction",
]

async function downloadTemplate() {
  const XLSX = await import("xlsx")
  const wb = XLSX.utils.book_new()

  const headers = TEMPLATE_HEADERS
  const example1 = ["Fatoumata", "Diallo", "2018-05-12", "F", "1ère Année", "Moussa Diallo", "76123456", "Bamako", "", "", ""]
  const example2 = ["Mamadou", "Traoré", "2017-09-03", "M", "2ème Année", "Aminata Traoré", "76234567", "Bamako", "pourcentage", "10", "Famille nombreuse"]

  const blankRow = Array(11).fill("")
  const blankRows = Array.from({ length: 20 }, () => [...blankRow])

  const data = [headers, example1, example2, ...blankRows]
  const ws = XLSX.utils.aoa_to_sheet(data)

  ws["!cols"] = [
    { wch: 16 },  // Prénom
    { wch: 14 },  // Nom
    { wch: 16 },  // Date de naissance
    { wch: 6 },   // Sexe
    { wch: 16 },  // Classe
    { wch: 20 },  // Parent
    { wch: 14 },  // Téléphone
    { wch: 14 },  // Adresse
    { wch: 18 },  // Réduction type
    { wch: 18 },  // Réduction valeur
    { wch: 20 },  // Raison réduction
  ]

  ws["!freeze"] = { xSplit: 0, ySplit: 1 }

  XLSX.utils.book_append_sheet(wb, ws, "Modèle")
  XLSX.writeFile(wb, "modele-import-eleves.xlsx")
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
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={importing}>
              <Upload className="h-4 w-4 mr-2" />
              Choisir un fichier
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger le modèle Excel
            </Button>
            <span className="text-sm text-muted-foreground">
              {file ? file.name : "CSV ou Excel (.csv, .xlsx, .xls)"}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <Alert className="border-muted-foreground/20">
            <Info className="h-4 w-4" />
            <AlertTitle>Colonnes reconnues</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              <span className="font-medium">Prénom, Nom, Date de naissance</span> (AAAA-MM-JJ),
              <span className="font-medium"> Sexe</span> (M/F),
              <span className="font-medium"> Classe</span> (ex: 1ère Année),
              <span className="font-medium"> Parent, Téléphone</span>.
              Optionnel : Adresse, Réduction type (pourcentage/fixe), Réduction valeur, Raison.
              Les noms de colonnes peuvent être en français ou en anglais.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {rows && rows.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Aperçu — {rows.length} ligne{rows.length > 1 ? "s" : ""}
              </CardTitle>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {validCount} valide{validCount > 1 ? "s" : ""}
                </span>
                {errorCount > 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errorCount} erreur{errorCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-80 overflow-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">N°</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="w-16">Sexe</TableHead>
                    <TableHead className="w-28">Date naiss.</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead className="w-28">Téléphone</TableHead>
                    <TableHead className="w-24">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 100).map((r) => (
                    <TableRow key={r.line} className={r.errors.length > 0 ? "bg-red-50/50" : undefined}>
                      <TableCell className="text-muted-foreground text-xs">{r.line}</TableCell>
                      <TableCell className="max-w-28 truncate" title={r.firstName}>{r.firstName}</TableCell>
                      <TableCell className="max-w-28 truncate" title={r.lastName}>{r.lastName}</TableCell>
                      <TableCell>{r.gender === "Masculin" ? "M" : r.gender === "Féminin" ? "F" : r.gender}</TableCell>
                      <TableCell className="text-xs">{r.birthDate}</TableCell>
                      <TableCell className="max-w-32 truncate" title={r.className}>{r.className}</TableCell>
                      <TableCell className="max-w-36 truncate" title={r.parentName}>{r.parentName}</TableCell>
                      <TableCell className="text-xs font-mono">{r.parentPhone}</TableCell>
                      <TableCell>
                        {r.errors.length > 0 ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Badge variant="destructive" className="text-xs cursor-pointer gap-1 whitespace-nowrap">
                                <AlertCircle className="h-3 w-3" />
                                Erreur
                              </Badge>
                            </PopoverTrigger>
                            <PopoverContent side="left" className="text-xs w-64 p-3 space-y-1">
                              <p className="font-medium text-red-600 mb-1">Erreur{r.errors.length > 1 ? "s" : ""} ligne {r.line}</p>
                              {r.errors.map((err, i) => (
                                <p key={i} className="text-red-600">• {err}</p>
                              ))}
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 hover:bg-green-100 whitespace-nowrap">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Valide
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {rows.length > 100 && (
                <p className="text-xs text-muted-foreground py-2 text-center border-t">
                  + {rows.length - 100} ligne{rows.length - 100 > 1 ? "s" : ""} non affichée{rows.length - 100 > 1 ? "s" : ""}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {errorCount > 0
                  ? `${errorCount} ligne${errorCount > 1 ? "s" : ""} avec des erreurs — survolez le badge "Erreur" pour voir le détail`
                  : "Toutes les lignes sont valides"}
              </div>
              <Button onClick={handleImport} disabled={validCount === 0 || importing} size="sm">
                {importing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Import en cours...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" />Importer {validCount} élève{validCount > 1 ? "s" : ""}</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Résultat de l'import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center py-4 px-2 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{result.total}</div>
                <div className="text-xs text-muted-foreground mt-1">Total lignes</div>
              </div>
              <div className="text-center py-4 px-2 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">{result.imported}</div>
                <div className="text-xs text-green-600 mt-1">Importé{result.imported > 1 ? "s" : ""}</div>
              </div>
              <div className="text-center py-4 px-2 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-700">{result.errors.length}</div>
                <div className="text-xs text-red-600 mt-1">Erreur{result.errors.length > 1 ? "s" : ""}</div>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="max-h-40 overflow-auto border rounded-md">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground w-16">Ligne</th>
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((e, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-3 py-1.5 text-red-600 font-mono">{e.line > 0 ? e.line : "—"}</td>
                        <td className="px-3 py-1.5 text-red-600">{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {result.imported > 0 && result.errors.length === 0 && (
              <p className="text-sm text-green-600 text-center">
                {result.imported} élève{result.imported > 1 ? "s" : ""} importé{result.imported > 1 ? "s" : ""} avec succès.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
