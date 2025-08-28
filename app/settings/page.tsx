"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings,
  Plus,
  Save,
  Edit,
  Trash2,
  BookOpen,
  GraduationCap,
  Building2,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  School,
  UserCheck,
  Calendar,
  User,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff
} from "lucide-react"
import { NotificationBellMain } from "@/components/notifications/notification-bell-main"

// Types pour les données
interface Class {
  id: number;
  name: string;
  level: string;
  capacity: number;
  currentStudents: number;
  teacher: string;
  color: string;
  subjects: number[]; // IDs des matières enseignées dans cette classe
}

interface Subject {
  id: number;
  name: string;
  code: string;
  teacher: string;
  hoursPerWeek: number;
  coefficient: number;
  color: string;
}



interface SchoolInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  director: string;
  foundedYear: string;
  logo: string;
}

interface UserAccount {
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  lastLogin: string;
  avatar: string;
}

// Mock data
const mockClasses: Class[] = [
  {
    id: 1,
    name: "CP",
    level: "Primaire",
    capacity: 30,
    currentStudents: 28,
    teacher: "Fatoumata Diarra",
    color: "bg-blue-100 text-blue-700",
    subjects: [1, 2, 3, 6] // Mathématiques, Français, Sciences, EPS
  },
  {
    id: 2,
    name: "CE1",
    level: "Primaire",
    capacity: 30,
    currentStudents: 25,
    teacher: "Moussa Koné",
    color: "bg-green-100 text-green-700",
    subjects: [1, 2, 3, 4, 6] // Mathématiques, Français, Sciences, Histoire-Géo, EPS
  },
  {
    id: 3,
    name: "CE2",
    level: "Primaire",
    capacity: 30,
    currentStudents: 27,
    teacher: "Aïcha Traoré",
    color: "bg-yellow-100 text-yellow-700",
    subjects: [1, 2, 3, 4, 5, 6] // Toutes les matières
  },
  {
    id: 4,
    name: "CM1",
    level: "Primaire",
    capacity: 30,
    currentStudents: 26,
    teacher: "Sékou Keita",
    color: "bg-purple-100 text-purple-700",
    subjects: [1, 2, 3, 4, 5, 6] // Toutes les matières
  },
  {
    id: 5,
    name: "CM2",
    level: "Primaire",
    capacity: 30,
    currentStudents: 29,
    teacher: "Aminata Touré",
    color: "bg-red-100 text-red-700",
    subjects: [1, 2, 3, 4, 5, 6] // Toutes les matières
  },
  {
    id: 6,
    name: "6ème",
    level: "Collège",
    capacity: 35,
    currentStudents: 32,
    teacher: "Oumar Diallo",
    color: "bg-indigo-100 text-indigo-700",
    subjects: [1, 2, 3, 4, 5, 6] // Toutes les matières
  }
]

const mockSubjects: Subject[] = [
  {
    id: 1,
    name: "Mathématiques",
    code: "MATH",
    teacher: "Fatoumata Diarra",
    hoursPerWeek: 6,
    coefficient: 4,
    color: "bg-blue-100 text-blue-700"
  },
  {
    id: 2,
    name: "Français",
    code: "FRAN",
    teacher: "Moussa Koné",
    hoursPerWeek: 5,
    coefficient: 4,
    color: "bg-green-100 text-green-700"
  },
  {
    id: 3,
    name: "Sciences",
    code: "SCIE",
    teacher: "Aïcha Traoré",
    hoursPerWeek: 4,
    coefficient: 3,
    color: "bg-yellow-100 text-yellow-700"
  },
  {
    id: 4,
    name: "Histoire-Géographie",
    code: "HIST",
    teacher: "Sékou Keita",
    hoursPerWeek: 3,
    coefficient: 2,
    color: "bg-purple-100 text-purple-700"
  },
  {
    id: 5,
    name: "Anglais",
    code: "ANGL",
    teacher: "Aminata Touré",
    hoursPerWeek: 3,
    coefficient: 2,
    color: "bg-red-100 text-red-700"
  },
  {
    id: 6,
    name: "Éducation Physique",
    code: "EPS",
    teacher: "Oumar Diallo",
    hoursPerWeek: 2,
    coefficient: 1,
    color: "bg-orange-100 text-orange-700"
  }
]



const mockSchoolInfo: SchoolInfo = {
  name: "École Primaire de Bamako",
  address: "Quartier Hippodrome, Bamako, Mali",
  phone: "+223 20 21 22 23",
  email: "contact@ecolebamako.ml",
  director: "Dr. Mamadou Traoré",
  foundedYear: "1995",
  logo: "/school-logo.png"
}

const mockUserAccount: UserAccount = {
  username: "admin",
  email: "admin@ecolebamako.ml",
  fullName: "Administrateur Principal",
  phone: "+223 76 12 34 56",
  role: "Administrateur",
  lastLogin: "2024-01-15 14:30",
  avatar: "/admin-avatar.png"
}

// Composant pour ajouter/modifier une classe
function ClassModal({ isOpen, onClose, onSave, classData = null, allSubjects = [] }) {
  const [formData, setFormData] = useState({
    name: classData?.name || "",
    level: classData?.level || "Primaire",
    capacity: classData?.capacity || 30,
    teacher: classData?.teacher || "",
    subjects: classData?.subjects || []
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newClass = {
      id: classData?.id || Date.now(),
      ...formData,
      currentStudents: classData?.currentStudents || 0,
      color: classData?.color || "bg-blue-100 text-blue-700"
    }
    onSave(newClass)
    onClose()
  }

  const handleSubjectToggle = (subjectId) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId]
    }))
  }

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: classData?.name || "",
        level: classData?.level || "Primaire",
        capacity: classData?.capacity || 30,
        teacher: classData?.teacher || "",
        subjects: classData?.subjects || []
      })
    }
  }, [isOpen, classData])

  // Suggérer des matières selon le niveau
  const handleLevelChange = (level) => {
    setFormData(prev => ({
      ...prev,
      level,
      // Suggérer des matières selon le niveau si c'est une nouvelle classe
      subjects: classData ? prev.subjects : getSuggestedSubjects(level)
    }))
  }

  const getSuggestedSubjects = (level) => {
    if (level === "Primaire") {
      // Matières de base pour le primaire
      return allSubjects
        .filter(s => ["Mathématiques", "Français", "Sciences", "Éducation Physique"].includes(s.name))
        .map(s => s.id)
    } else if (level === "Collège") {
      // Toutes les matières pour le collège
      return allSubjects.map(s => s.id)
    } else {
      // Lycée - toutes les matières
      return allSubjects.map(s => s.id)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{classData ? "Modifier la classe" : "Ajouter une classe"}</DialogTitle>
          <DialogDescription>
            {classData ? "Modifiez les informations de la classe" : "Ajoutez une nouvelle classe à l'école"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nom de la classe</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: CP, CE1, 6ème"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Niveau</label>
              <Select value={formData.level} onValueChange={handleLevelChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primaire">Primaire</SelectItem>
                  <SelectItem value="Collège">Collège</SelectItem>
                  <SelectItem value="Lycée">Lycée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Capacité</label>
              <Input
                type="number"
                min="10"
                max="50"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Professeur principal</label>
              <Input
                value={formData.teacher}
                onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                placeholder="Nom du professeur"
              />
            </div>
          </div>

          {/* Sélection des matières */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Matières enseignées</label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {formData.subjects.length} matière{formData.subjects.length > 1 ? 's' : ''} sélectionnée{formData.subjects.length > 1 ? 's' : ''}
                </span>
                {allSubjects.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        subjects: formData.subjects.length === allSubjects.length ? [] : allSubjects.map(s => s.id)
                      }))
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    {formData.subjects.length === allSubjects.length ? "Désélectionner tout" : "Sélectionner tout"}
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
              {allSubjects.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucune matière disponible. Créez d'abord des matières dans l'onglet "Matières".
                </p>
              ) : (
                allSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className={`flex items-center space-x-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                      formData.subjects.includes(subject.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleSubjectToggle(subject.id)}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      formData.subjects.includes(subject.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {formData.subjects.includes(subject.id) && (
                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{subject.name}</span>
                        <Badge variant="secondary" className={`text-xs ${subject.color}`}>
                          {subject.hoursPerWeek}h/sem
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>Code: {subject.code}</span>
                        <span>Coef: {subject.coefficient}</span>
                        <span>Prof: {subject.teacher}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {allSubjects.length > 0 && (
              <p className="text-xs text-gray-500">
                💡 Sélectionnez les matières qui seront enseignées dans cette classe
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {classData ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Composant pour la gestion du compte utilisateur
function UserAccountModal({ isOpen, onClose, onSave, userData = null }) {
  const [formData, setFormData] = useState({
    username: userData?.username || "",
    email: userData?.email || "",
    fullName: userData?.fullName || "",
    phone: userData?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis"
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Le nom complet est requis"
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = "Le mot de passe doit contenir au moins 6 caractères"
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const updatedUser = {
      ...userData,
      ...formData,
      // Ne pas inclure les mots de passe dans les données retournées
      currentPassword: undefined,
      newPassword: undefined,
      confirmPassword: undefined
    }
    
    onSave(updatedUser)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestion du compte utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez vos informations personnelles et votre mot de passe
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informations personnelles</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username" className="text-sm font-medium">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Nom d'utilisateur"
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@exemple.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">Nom complet</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Nom complet"
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+223 XX XX XX XX"
                />
              </div>
            </div>
          </div>

          {/* Changement de mot de passe */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Changement de mot de passe</span>
            </h3>
            
            <div>
              <Label htmlFor="currentPassword" className="text-sm font-medium">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  placeholder="Mot de passe actuel"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPassword" className="text-sm font-medium">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    placeholder="Nouveau mot de passe"
                    className={`pr-10 ${errors.newPassword ? "border-red-500" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Confirmer le mot de passe"
                    className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note :</strong> Laissez les champs de mot de passe vides si vous ne souhaitez pas changer votre mot de passe.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Composant pour ajouter/modifier une matière
function SubjectModal({ isOpen, onClose, onSave, subjectData = null }) {
  const [formData, setFormData] = useState({
    name: subjectData?.name || "",
    code: subjectData?.code || "",
    teacher: subjectData?.teacher || "",
    hoursPerWeek: subjectData?.hoursPerWeek || 3,
    coefficient: subjectData?.coefficient || 1
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newSubject = {
      id: subjectData?.id || Date.now(),
      ...formData,
      color: subjectData?.color || "bg-blue-100 text-blue-700"
    }
    onSave(newSubject)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subjectData ? "Modifier la matière" : "Ajouter une matière"}</DialogTitle>
          <DialogDescription>
            {subjectData ? "Modifiez les informations de la matière" : "Ajoutez une nouvelle matière au programme"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nom de la matière</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Mathématiques"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Code</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Ex: MATH"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Professeur</label>
            <Input
              value={formData.teacher}
              onChange={(e) => setFormData({...formData, teacher: e.target.value})}
              placeholder="Nom du professeur"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Heures par semaine</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.hoursPerWeek}
                onChange={(e) => setFormData({...formData, hoursPerWeek: parseInt(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Coefficient</label>
              <Input
                type="number"
                min="1"
                max="5"
                step="0.5"
                value={formData.coefficient}
                onChange={(e) => setFormData({...formData, coefficient: parseFloat(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {subjectData ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



export default function SettingsPage() {
  const [classes, setClasses] = useState(mockClasses)
  const [subjects, setSubjects] = useState(mockSubjects)
  const [schoolInfo, setSchoolInfo] = useState(mockSchoolInfo)
  const [userAccount, setUserAccount] = useState(mockUserAccount)
  
  const [showClassModal, setShowClassModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showUserAccountModal, setShowUserAccountModal] = useState(false)
  
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [showClassSubjectsModal, setShowClassSubjectsModal] = useState(false)
  const [selectedClassForSubjects, setSelectedClassForSubjects] = useState(null)

  const handleAddClass = (newClass) => {
    setClasses([...classes, newClass])
  }

  const handleEditClass = (classData) => {
    setSelectedClass(classData)
    setShowClassModal(true)
  }

  const handleSaveClass = (updatedClass) => {
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c))
  }

  const handleDeleteClass = (classId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) {
      setClasses(classes.filter(c => c.id !== classId))
    }
  }

  const getClassSubjects = (classItem) => {
    return classItem.subjects.map(subjectId => 
      subjects.find(s => s.id === subjectId)
    ).filter(Boolean)
  }

  const handleEditClassSubjects = (classItem) => {
    setSelectedClassForSubjects(classItem)
    setShowClassSubjectsModal(true)
  }

  const handleSaveClassSubjects = (updatedClass) => {
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c))
    setShowClassSubjectsModal(false)
  }

  const handleAddSubject = (newSubject) => {
    setSubjects([...subjects, newSubject])
  }

  const handleEditSubject = (subjectData) => {
    setSelectedSubject(subjectData)
    setShowSubjectModal(true)
  }

  const handleSaveSubject = (updatedSubject) => {
    setSubjects(subjects.map(s => s.id === updatedSubject.id ? updatedSubject : s))
  }

  const handleDeleteSubject = (subjectId) => {
    setSubjects(subjects.filter(s => s.id !== subjectId))
  }

  const handleSaveUserAccount = (updatedUser) => {
    setUserAccount(updatedUser)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Paramètres"
            description="Configurez les paramètres de l'école et gérez les données de base"
          >
            <NotificationBellMain />
          </PageHeader>

          <Tabs defaultValue="classes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="classes" className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Classes</span>
              </TabsTrigger>
              <TabsTrigger value="subjects" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Matières</span>
              </TabsTrigger>
              <TabsTrigger value="school" className="flex items-center space-x-2">
                <School className="h-4 w-4" />
                <span>École</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Compte</span>
              </TabsTrigger>
            </TabsList>

            {/* Onglet Classes */}
            <TabsContent value="classes" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Gestion des Classes</h2>
                  <p className="text-muted-foreground">Configurez les classes de l'école</p>
                </div>
                <Button onClick={() => setShowClassModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle classe
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((classItem) => (
                  <Card key={classItem.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{classItem.name}</CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClass(classItem)}
                            className="h-6 w-6 p-0"
                            title="Modifier la classe"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClassSubjects(classItem)}
                            className="h-6 w-6 p-0 text-blue-600"
                            title="Modifier les matières"
                          >
                            <BookOpen className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClass(classItem.id)}
                            className="h-6 w-6 p-0 text-red-600"
                            title="Supprimer la classe"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{classItem.level}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Capacité:</span>
                        <span className="font-medium">{classItem.capacity} élèves</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Inscrits:</span>
                        <span className="font-medium">{classItem.currentStudents} élèves</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Professeur:</span>
                        <span className="font-medium">{classItem.teacher}</span>
                      </div>
                      
                      {/* Liste des matières */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Matières enseignées:</span>
                          <span className="font-medium">{classItem.subjects.length} matières</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {getClassSubjects(classItem).map((subject) => (
                            <Badge 
                              key={subject.id} 
                              variant="secondary" 
                              className={`text-xs ${subject.color}`}
                              title={`${subject.name} - ${subject.hoursPerWeek}h/semaine - Coef: ${subject.coefficient}`}
                            >
                              {subject.name}
                            </Badge>
                          ))}
                        </div>
                        {classItem.subjects.length === 0 && (
                          <p className="text-xs text-gray-500 italic">Aucune matière assignée</p>
                        )}
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(classItem.currentStudents / classItem.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Onglet Matières */}
            <TabsContent value="subjects" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Gestion des Matières</h2>
                  <p className="text-muted-foreground">Configurez les matières enseignées</p>
                </div>
                <Button onClick={() => setShowSubjectModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle matière
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => (
                  <Card key={subject.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{subject.name}</CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditSubject(subject)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="h-6 w-6 p-0 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>Code: {subject.code}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Professeur:</span>
                        <span className="font-medium">{subject.teacher}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Heures/semaine:</span>
                        <span className="font-medium">{subject.hoursPerWeek}h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Coefficient:</span>
                        <span className="font-medium">{subject.coefficient}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>



            {/* Onglet École */}
            <TabsContent value="school" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Informations de l'École</h2>
                <p className="text-muted-foreground">Configurez les informations générales de l'école</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Détails de l'établissement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nom de l'école</label>
                      <Input
                        value={schoolInfo.name}
                        onChange={(e) => setSchoolInfo({...schoolInfo, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Directeur</label>
                      <Input
                        value={schoolInfo.director}
                        onChange={(e) => setSchoolInfo({...schoolInfo, director: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Adresse</label>
                    <Input
                      value={schoolInfo.address}
                      onChange={(e) => setSchoolInfo({...schoolInfo, address: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Téléphone</label>
                      <Input
                        value={schoolInfo.phone}
                        onChange={(e) => setSchoolInfo({...schoolInfo, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={schoolInfo.email}
                        onChange={(e) => setSchoolInfo({...schoolInfo, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Année de création</label>
                    <Input
                      value={schoolInfo.foundedYear}
                      onChange={(e) => setSchoolInfo({...schoolInfo, foundedYear: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder les modifications
                    </Button>
                  </div>
                              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Compte */}
          <TabsContent value="account" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Gestion du Compte</h2>
                <p className="text-muted-foreground">Gérez vos informations personnelles et votre mot de passe</p>
              </div>
              <Button onClick={() => setShowUserAccountModal(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier le compte
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Informations du compte */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Informations du compte</span>
                  </CardTitle>
                  <CardDescription>Vos informations personnelles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{userAccount.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{userAccount.role}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Nom d'utilisateur</p>
                        <p className="text-sm text-muted-foreground">{userAccount.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{userAccount.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Téléphone</p>
                        <p className="text-sm text-muted-foreground">{userAccount.phone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sécurité et connexion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>Sécurité et connexion</span>
                  </CardTitle>
                  <CardDescription>Informations de sécurité</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Compte actif</p>
                          <p className="text-xs text-green-600">Votre compte est sécurisé</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Dernière connexion</p>
                          <p className="text-xs text-blue-600">{userAccount.lastLogin}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Actions de sécurité</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Lock className="h-4 w-4 mr-2" />
                          Changer le mot de passe
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Eye className="h-4 w-4 mr-2" />
                          Voir l'historique de connexion
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Activer l'authentification à deux facteurs
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

          {/* Modals */}
          <ClassModal
            isOpen={showClassModal}
            onClose={() => {
              setShowClassModal(false)
              setSelectedClass(null)
            }}
            onSave={selectedClass ? handleSaveClass : handleAddClass}
            classData={selectedClass}
            allSubjects={subjects}
          />

          <SubjectModal
            isOpen={showSubjectModal}
            onClose={() => {
              setShowSubjectModal(false)
              setSelectedSubject(null)
            }}
            onSave={selectedSubject ? handleSaveSubject : handleAddSubject}
            subjectData={selectedSubject}
          />

          <UserAccountModal
            isOpen={showUserAccountModal}
            onClose={() => setShowUserAccountModal(false)}
            onSave={handleSaveUserAccount}
            userData={userAccount}
          />

          {/* Modal pour éditer les matières d'une classe */}
          <Dialog open={showClassSubjectsModal} onOpenChange={setShowClassSubjectsModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Matières de la classe {selectedClassForSubjects?.name}</DialogTitle>
                <DialogDescription>
                  Sélectionnez les matières enseignées dans cette classe
                </DialogDescription>
              </DialogHeader>
              <ClassSubjectsModal
                isOpen={showClassSubjectsModal}
                onClose={() => setShowClassSubjectsModal(false)}
                onSave={handleSaveClassSubjects}
                classData={selectedClassForSubjects}
                allSubjects={subjects}
              />
            </DialogContent>
          </Dialog>


        </div>
      </main>
    </div>
  )
}

// Composant pour éditer les matières d'une classe
function ClassSubjectsModal({ isOpen, onClose, onSave, classData, allSubjects }) {
  const [selectedSubjects, setSelectedSubjects] = useState(classData?.subjects || [])

  useEffect(() => {
    if (classData) {
      setSelectedSubjects(classData.subjects || [])
    }
  }, [classData])

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const handleSave = () => {
    if (classData) {
      onSave({
        ...classData,
        subjects: selectedSubjects
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Matières disponibles</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {allSubjects.map((subject) => (
            <div
              key={subject.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedSubjects.includes(subject.id)
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => handleSubjectToggle(subject.id)}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                selectedSubjects.includes(subject.id)
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-300'
              }`}>
                {selectedSubjects.includes(subject.id) && (
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{subject.name}</span>
                  <Badge variant="secondary" className={`text-xs ${subject.color}`}>
                    {subject.hoursPerWeek}h/sem
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <span>Code: {subject.code}</span>
                  <span>Coef: {subject.coefficient}</span>
                  <span>Prof: {subject.teacher}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={handleSave}>
          Enregistrer
        </Button>
      </div>
    </div>
  )
}

