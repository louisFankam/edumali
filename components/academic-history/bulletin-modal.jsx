"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Printer, FileText } from "lucide-react"
import { useSchoolInfo, useAcademicYears } from "@/hooks/use-settings"
import { downloadBulletinPDF } from "@/lib/reports/bulletin"

export function BulletinModal({ open, onOpenChange, student }) {
  const { schoolInfo } = useSchoolInfo()
  const { currentYear } = useAcademicYears()
  const [bulletin, setBulletin] = useState(null)

  const schoolName = schoolInfo?.name || "Établissement scolaire"
  const schoolAddress = schoolInfo?.address || ""
  const schoolPhone = schoolInfo?.phone || ""
  const directorName = schoolInfo?.director || "Le Directeur"
  const logoUrl = schoolInfo?.logoUrl || ""
  const academicYearName = currentYear?.name || ""

  useEffect(() => {
    if (!open || !student) return
    setBulletin(null)
  }, [open, student])

  if (!student) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    const subjects = (student.subjects || []).map(s => {
      const grade = typeof s.grade === "string" ? Number.parseFloat(s.grade.split("/")[0]) : (s.finalAverage ?? 0)
      const gradeNum = isNaN(grade) ? 0 : grade
      return {
        subjectName: s.name,
        coefficient: s.coefficient,
        devoirAverage: gradeNum,
        trimestrielleScore: gradeNum,
        finalAverage: gradeNum,
        absent: false,
      }
    })
    const totalCoeffs = subjects.reduce((sum, s) => sum + s.coefficient, 0)
    const weightedSum = subjects.reduce((sum, s) => sum + (s.finalAverage || 0) * s.coefficient, 0)
    const generalAvg = totalCoeffs > 0 ? weightedSum / totalCoeffs : null
    const nameParts = (student.studentName || "").split(" ")
    const firstName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""
    const lastName = nameParts[0] || ""
    const studentData = {
      lastName,
      firstName,
      subjects,
      generalAverage: generalAvg,
      rank: student.rank || null,
      totalStudents: 1,
      mention: student.status || "",
      totalActiveCoeffs: totalCoeffs,
    }
    await downloadBulletinPDF(
      [studentData],
      schoolName,
      schoolAddress,
      schoolPhone,
      directorName,
      academicYearName,
      student.class,
      student.trimesterNum || 1,
      logoUrl,
    )
  }

  const subjects = student.subjects || []

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
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">BULLETIN SCOLAIRE</CardTitle>
              <div className="text-sm text-gray-600">
                <p>{student.trimester}</p>
                <p>Classe: {student.class}</p>
              </div>
            </CardHeader>
          </Card>

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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes par matière</CardTitle>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune note disponible</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Matière</th>
                        <th className="text-center p-3 font-medium">Note</th>
                        <th className="text-center p-3 font-medium">Coefficient</th>
                        <th className="text-center p-3 font-medium">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject, index) => {
                        const grade = typeof subject.grade === "string"
                          ? Number.parseFloat(subject.grade.split("/")[0])
                          : (subject.finalAverage ?? 0)
                        const points = grade * subject.coefficient
                        const gradeStr = typeof subject.grade === "string" ? subject.grade : `${subject.finalAverage?.toFixed(2) ?? "—"}/20`
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
                                {gradeStr}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">{subject.coefficient}</td>
                            <td className="p-3 text-center font-semibold">{points.toFixed(1)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

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
          </div>

          {student.teacherComments && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{student.teacherComments}</p>
              </CardContent>
            </Card>
          )}

          <Separator />

          <div className="text-center text-sm text-gray-500 print:text-xs">
            <p>Bulletin généré le {new Date().toLocaleDateString("fr-FR")}</p>
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
