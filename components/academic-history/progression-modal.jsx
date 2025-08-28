"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react"

export function ProgressionModal({ open, onOpenChange, student }) {
  if (!student) return null

  // Mock progression data
  const subjectProgression = [
    {
      subject: "Français",
      current: 17,
      previous: 15.5,
      trend: "up",
      improvement: "+1.5",
    },
    {
      subject: "Mathématiques",
      current: 16,
      previous: 16.2,
      trend: "down",
      improvement: "-0.2",
    },
    {
      subject: "Sciences",
      current: 15,
      previous: 14.8,
      trend: "up",
      improvement: "+0.2",
    },
    {
      subject: "Histoire-Géo",
      current: 18,
      previous: 17.5,
      trend: "up",
      improvement: "+0.5",
    },
    {
      subject: "Anglais",
      current: 14,
      previous: 14,
      trend: "stable",
      improvement: "0",
    },
  ]

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Analyse de progression - {student.studentName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Progression générale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{student.averageGrade}</div>
                  <div className="text-sm text-gray-600">Moyenne actuelle</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+0.7</div>
                  <div className="text-sm text-gray-600">Amélioration</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{student.rank}</div>
                  <div className="text-sm text-gray-600">Rang actuel</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject-wise Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Progression par matière</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectProgression.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {getTrendIcon(subject.trend)}
                      <div>
                        <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                        <p className="text-sm text-gray-600">
                          {subject.previous}/20 → {subject.current}/20
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{subject.current}/20</div>
                      <div className={`text-sm font-medium ${getTrendColor(subject.trend)}`}>
                        {subject.improvement !== "0" && (subject.improvement.startsWith("+") ? "" : "")}
                        {subject.improvement} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommandations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Points forts à maintenir</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Excellente progression en Français (+1.5 points)</li>
                    <li>• Très bon niveau en Histoire-Géographie</li>
                    <li>• Amélioration constante en Sciences</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Axes d'amélioration</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Renforcer le travail en Anglais (niveau stable)</li>
                    <li>• Attention particulière aux Mathématiques (légère baisse)</li>
                    <li>• Développer l'expression orale</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Conseils pédagogiques</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Encourager la lecture en français pour maintenir le niveau</li>
                    <li>• Proposer des exercices supplémentaires en mathématiques</li>
                    <li>• Organiser des séances de conversation en anglais</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Indicateurs de performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-3">Évolution du comportement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Participation</span>
                      <Badge className="bg-green-100 text-green-800">Très bien</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Assiduité</span>
                      <Badge className="bg-green-100 text-green-800">{student.attendance}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Travail personnel</span>
                      <Badge className="bg-blue-100 text-blue-800">Bien</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Objectifs pour la suite</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Maintenir la moyenne au-dessus de 16/20</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Améliorer le niveau en Anglais</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Préparer le passage en 6ème</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
