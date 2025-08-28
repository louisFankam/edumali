"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Search, User, CheckCircle } from "lucide-react"

export function ReenrollmentModal({ open, onOpenChange }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [newClass, setNewClass] = useState("")
  const [newSchoolYear, setNewSchoolYear] = useState("2024-2025")

  // Mock data for existing students
  const existingStudents = [
    {
      id: 1,
      name: "Ibrahim Keita",
      currentClass: "5ème A",
      school: "Collège Soundiata",
      parentName: "Fatoumata Keita",
      phone: "+223 65 43 21 87",
      lastYear: "2023-2024",
      status: "active",
    },
    {
      id: 2,
      name: "Aminata Diallo",
      currentClass: "3ème B",
      school: "Lycée Askia Mohamed",
      parentName: "Mamadou Diallo",
      phone: "+223 76 54 32 10",
      lastYear: "2023-2024",
      status: "active",
    },
  ]

  const filteredStudents = existingStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleReenroll = () => {
    if (selectedStudent && newClass) {
      console.log("Réinscription:", {
        student: selectedStudent,
        newClass,
        newSchoolYear,
      })
      onOpenChange(false)
      setSelectedStudent(null)
      setNewClass("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Réinscription d'un élève</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!selectedStudent ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="search">Rechercher un élève existant</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Nom de l'élève ou du parent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <Card
                    key={student.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <User className="h-8 w-8 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">
                              {student.currentClass} - {student.school}
                            </div>
                            <div className="text-sm text-gray-500">
                              Parent: {student.parentName} ({student.phone})
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{student.lastYear}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Élève sélectionné</span>
                    <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                      Changer
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <User className="h-10 w-10 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{selectedStudent.name}</div>
                      <div className="text-sm text-gray-500">Classe actuelle: {selectedStudent.currentClass}</div>
                      <div className="text-sm text-gray-500">École: {selectedStudent.school}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informations de réinscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newSchoolYear">Année scolaire *</Label>
                      <Select value={newSchoolYear} onValueChange={setNewSchoolYear}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024-2025">2024-2025</SelectItem>
                          <SelectItem value="2025-2026">2025-2026</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="newClass">Nouvelle classe *</Label>
                      <Select value={newClass} onValueChange={setNewClass}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une classe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6eme">6ème</SelectItem>
                          <SelectItem value="5eme">5ème</SelectItem>
                          <SelectItem value="4eme">4ème</SelectItem>
                          <SelectItem value="3eme">3ème</SelectItem>
                          <SelectItem value="2nde">2nde</SelectItem>
                          <SelectItem value="1ere">1ère</SelectItem>
                          <SelectItem value="terminale">Terminale</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Avantages de la réinscription</span>
                    </div>
                    <ul className="mt-2 text-sm text-green-700 space-y-1">
                      <li>• Informations déjà enregistrées</li>
                      <li>• Processus simplifié</li>
                      <li>• Historique académique conservé</li>
                      <li>• Réduction sur les frais d'inscription</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          {selectedStudent && (
            <Button onClick={handleReenroll} disabled={!newClass}>
              Confirmer réinscription
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
