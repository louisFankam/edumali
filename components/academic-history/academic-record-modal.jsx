"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, TrendingUp, Award } from "lucide-react"

export function AcademicRecordModal({ open, onOpenChange, student }) {
  if (!student) return null

  // Mock historical data
  const academicHistory = [
    {
      year: "2024-2025",
      class: "CM2",
      school: "École Primaire de Bamako",
      average: "16.5/20",
      rank: "2/35",
      status: "En cours",
    },
    {
      year: "2023-2024",
      class: "CM1",
      school: "École Primaire de Bamako",
      average: "15.8/20",
      rank: "3/38",
      status: "Admis",
    },
    {
      year: "2022-2023",
      class: "CE2",
      school: "École Primaire de Bamako",
      average: "15.2/20",
      rank: "5/42",
      status: "Admis",
    },
  ]

  const achievements = [
    {
      year: "2024",
      title: "Prix d'excellence en Français",
      description: "Meilleure performance en littérature",
    },
    {
      year: "2023",
      title: "Mention Très Bien",
      description: "Passage en CM2 avec félicitations",
    },
    {
      year: "2023",
      title: "Participation concours de mathématiques",
      description: "3ème place au niveau régional",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Dossier académique complet - {student.studentName}</span>
          </DialogTitle>
        </DialogHeader>

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
                <div className="space-y-4">
                  {academicHistory.map((record, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg">{record.year}</h4>
                        <Badge
                          className={
                            record.status === "En cours" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }
                        >
                          {record.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Classe:</span>
                          <p>{record.class}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">École:</span>
                          <p>{record.school}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Moyenne:</span>
                          <p className="font-semibold text-primary">{record.average}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-medium text-gray-600">Rang:</span>
                        <span className="ml-2 font-semibold">{record.rank}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>2022-2023 (CE2)</span>
                      <span className="font-semibold">15.2/20</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>2023-2024 (CM1)</span>
                      <span className="font-semibold">15.8/20</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <span>2024-2025 (CM2)</span>
                      <span className="font-semibold text-primary">16.5/20</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analyse de progression</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Tendance générale:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-semibold">En progression</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Amélioration:</span>
                      <p className="text-green-600 font-semibold">+1.3 points en 2 ans</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Points forts:</span>
                      <p className="text-sm">Français, Histoire-Géographie</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">À améliorer:</span>
                      <p className="text-sm">Anglais, Expression orale</p>
                    </div>
                  </div>
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
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                        <Badge variant="outline">{achievement.year}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <Button variant="outline" className="justify-start bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    Bulletins trimestriels
                  </Button>
                  <Button variant="outline" className="justify-start bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    Certificats de scolarité
                  </Button>
                  <Button variant="outline" className="justify-start bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    Relevés de notes
                  </Button>
                  <Button variant="outline" className="justify-start bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    Rapports de progression
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
