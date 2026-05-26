"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, BarChart3, Loader2 } from "lucide-react"

export function ProgressionModal({ open, onOpenChange, student }) {
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

  const subjectProgression = data?.subjectProgression || []
  const currentAverage = data?.currentAverage
  const yearProgression = data?.yearProgression || []

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down": return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case "up": return "text-green-600"
      case "down": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const improvement = yearProgression.length >= 2
    ? (yearProgression[0].average - yearProgression[yearProgression.length - 1].average).toFixed(1)
    : null

  const topSubjects = subjectProgression.filter(s => s.trend === "up" && s.current !== null)
  const weakSubjects = subjectProgression.filter(s => s.trend === "down" && s.current !== null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Analyse de progression - {student.studentName}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : error ? (
          <p className="text-red-600 text-center py-8">{error}</p>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progression générale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentAverage !== null ? `${currentAverage.toFixed(2)}/20` : "—"}
                    </div>
                    <div className="text-sm text-gray-600">Moyenne actuelle</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {improvement !== null ? (improvement.startsWith("-") ? improvement : `+${improvement}`) : "—"}
                    </div>
                    <div className="text-sm text-gray-600">Amélioration</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{student.rank || "—"}</div>
                    <div className="text-sm text-gray-600">Rang actuel</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progression par matière</CardTitle>
              </CardHeader>
              <CardContent>
                {subjectProgression.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Pas assez de données pour comparer les périodes
                  </p>
                ) : (
                  <div className="space-y-4">
                    {subjectProgression.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          {getTrendIcon(subject.trend)}
                          <div>
                            <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                            <p className="text-sm text-gray-600">
                              {subject.previous !== null ? `${subject.previous.toFixed(2)}/20` : "—"} → {subject.current !== null ? `${subject.current.toFixed(2)}/20` : "—"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">{subject.current !== null ? `${subject.current.toFixed(2)}/20` : "—"}</div>
                          {subject.current !== null && subject.previous !== null && (
                            <div className={`text-sm font-medium ${getTrendColor(subject.trend)}`}>
                              {(subject.current - subject.previous) > 0 ? "+" : ""}{(subject.current - subject.previous).toFixed(1)} pts
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSubjects.length > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Points forts</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        {topSubjects.slice(0, 3).map((s, i) => (
                          <li key={i}>• {s.subject} ({s.current.toFixed(2)}/20)</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {weakSubjects.length > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Axes d'amélioration</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {weakSubjects.slice(0, 3).map((s, i) => (
                          <li key={i}>• {s.subject} ({s.current.toFixed(2)}/20)</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topSubjects.length === 0 && weakSubjects.length === 0 && (
                    <p className="text-gray-500 text-sm">Générer des bulletins pour voir les recommandations.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicateurs de performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-3">Synthèse</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Moyenne</span>
                        <Badge className={currentAverage !== null && currentAverage >= 14 ? "bg-green-100 text-green-800" : currentAverage !== null && currentAverage >= 10 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                          {currentAverage !== null ? `${currentAverage.toFixed(2)}/20` : "—"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Statut</span>
                        <Badge className={student.status === "Admis" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {student.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Matières suivies</span>
                        <Badge className="bg-blue-100 text-blue-800">{subjectProgression.length}</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Progression</h4>
                    <div className="space-y-2">
                      {yearProgression.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>T{item.trimester} {item.year}</span>
                          <span className="font-medium">{item.average.toFixed(2)}/20</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
