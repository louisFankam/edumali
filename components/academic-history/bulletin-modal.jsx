"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Printer, FileText } from "lucide-react"

export function BulletinModal({ open, onOpenChange, student }) {
  if (!student) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    console.log("Télécharger bulletin:", student.studentName)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Bulletin de {student.studentName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4">
          {/* Header */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">BULLETIN SCOLAIRE</CardTitle>
              <div className="text-sm text-gray-600">
                <p>{student.school}</p>
                <p>Année scolaire: {student.schoolYear}</p>
                <p>{student.trimester}</p>
              </div>
            </CardHeader>
          </Card>

          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations de l'élève</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Nom complet:</span>
                  <p className="font-semibold">{student.studentName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Classe:</span>
                  <p className="font-semibold">{student.class}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">ID Élève:</span>
                  <p className="font-semibold">{student.studentId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes par matière</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Matière</th>
                      <th className="text-center p-3 font-medium">Note</th>
                      <th className="text-center p-3 font-medium">Coefficient</th>
                      <th className="text-center p-3 font-medium">Points</th>
                      <th className="text-left p-3 font-medium">Enseignant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.subjects.map((subject, index) => {
                      const grade = Number.parseFloat(subject.grade.split("/")[0])
                      const points = grade * subject.coefficient
                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{subject.name}</td>
                          <td className="p-3 text-center">
                            <Badge
                              className={
                                grade >= 16
                                  ? "bg-green-100 text-green-800"
                                  : grade >= 14
                                    ? "bg-blue-100 text-blue-800"
                                    : grade >= 12
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                              }
                            >
                              {subject.grade}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">{subject.coefficient}</td>
                          <td className="p-3 text-center font-semibold">{points.toFixed(1)}</td>
                          <td className="p-3">{subject.teacher}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Résultats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Moyenne générale:</span>
                  <span className="text-xl font-bold text-primary">{student.averageGrade}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Rang:</span>
                  <span className="font-semibold">{student.rank}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Statut:</span>
                  <Badge
                    className={
                      student.status === "Admis"
                        ? "bg-green-100 text-green-800"
                        : student.status === "Redoublant"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {student.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vie scolaire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Assiduité:</span>
                  <span className="font-semibold text-green-600">{student.attendance}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Comportement:</span>
                  <Badge className="bg-green-100 text-green-800">{student.behavior}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observations du conseil de classe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{student.teacherComments}</p>
            </CardContent>
          </Card>

          <Separator />

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 print:text-xs">
            <p>Bulletin généré le {new Date().toLocaleDateString("fr-FR")}</p>
            <p>{student.school} - Système de Gestion Scolaire EduMali</p>
          </div>
        </div>

        <div className="flex justify-end pt-4 print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
