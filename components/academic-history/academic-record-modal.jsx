"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, TrendingUp, Award, Loader2 } from "lucide-react"

export function AcademicRecordModal({ open, onOpenChange, student }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || !student) return
    setLoading(true)
    setError(null)
    window.fetch(`/api/academic-history/student/${student.id}`, { cache: "no-store" })
      .then(r => r.json())
      .then(json => {
        if (json.ok) setData(json.data)
        else setError(json.message)
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [open, student])

  if (!student) return null

  const academicHistory = data?.academicHistory || []
  const yearProgression = data?.yearProgression || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Dossier académique complet - {student.studentName}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : error ? (
          <p className="text-red-600 text-center py-8">{error}</p>
        ) : (
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="progression">Progression</TabsTrigger>
              <TabsTrigger value="achievements">Distinctions</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Parcours scolaire</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {academicHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucun historique trouvé</p>
                  ) : (
                    <div className="space-y-4">
                      {academicHistory.map((record, index) => (
                        <div key={index} className="border-l-4 border-primary pl-4 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-lg">{record.year} — {record.trimester}e Trimestre</h4>
                            <Badge
                              className={
                                record.status === "En cours" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                              }
                            >
                              {record.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Classe:</span>
                              <p>{record.class}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Moyenne:</span>
                              <p className="font-semibold text-primary">{record.average}</p>
                            </div>
                          </div>
                          {record.subjects && record.subjects.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm font-medium text-gray-600">Matières:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {record.subjects.map((s, i) => (
                                  <Badge key={i} variant="outline">
                                    {s.name}: {s.grade}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progression" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Évolution des moyennes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {yearProgression.length === 0 ? (
                      <p className="text-gray-500">Aucune donnée</p>
                    ) : (
                      <div className="space-y-3">
                        {yearProgression.map((item, i) => {
                          const isLatest = i === 0
                          return (
                            <div
                              key={i}
                              className={`flex items-center justify-between p-3 rounded-lg ${isLatest ? "bg-primary/10" : "bg-gray-50"}`}
                            >
                              <span>{item.year} — T{item.trimester}</span>
                              <span className={`font-semibold ${isLatest ? "text-primary" : ""}`}>
                                {item.average.toFixed(2)}/20
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Analyse de progression</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {yearProgression.length < 2 ? (
                      <p className="text-gray-500">Pas assez de données pour analyser la progression</p>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Tendance générale:</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-green-600 font-semibold">
                              {yearProgression[0].average > yearProgression[yearProgression.length - 1].average
                                ? "En progression" : "En baisse"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Évolution:</span>
                          <p className={`font-semibold ${yearProgression[0].average >= yearProgression[yearProgression.length - 1].average ? "text-green-600" : "text-red-600"}`}>
                            {(yearProgression[0].average - yearProgression[yearProgression.length - 1].average).toFixed(2)} pts
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>Distinctions et récompenses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.subjectProgression?.length > 0 ? (
                    <div className="space-y-4">
                      {data.subjectProgression
                        .filter(s => s.trend === "up" && s.current !== null && s.current >= 14)
                        .slice(0, 5)
                        .map((s, i) => (
                          <div key={i} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{s.subject}</h4>
                                <p className="text-sm text-gray-600">
                                  Note: {s.current}/20
                                </p>
                              </div>
                              <Badge variant="outline">Point fort</Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <p className="text-sm text-gray-500">Aucune distinction enregistrée dans le système.</p>
                        <p className="text-sm text-gray-500 mt-1">Les distinctions sont gérées manuellement par l'administration.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start bg-transparent" disabled>
                      <FileText className="h-4 w-4 mr-2" />
                      Bulletins trimestriels
                    </Button>
                    <Button variant="outline" className="justify-start bg-transparent" disabled>
                      <FileText className="h-4 w-4 mr-2" />
                      Certificats de scolarité
                    </Button>
                    <Button variant="outline" className="justify-start bg-transparent" disabled>
                      <FileText className="h-4 w-4 mr-2" />
                      Relevés de notes
                    </Button>
                    <Button variant="outline" className="justify-start bg-transparent" disabled>
                      <FileText className="h-4 w-4 mr-2" />
                      Rapports de progression
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
