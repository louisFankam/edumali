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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStudents } from "@/hooks/use-students"
import { 
  Settings,
  Plus,
  Save,
  Edit,
  Trash2,
  BookOpen,
  GraduationCap,
  School,
  User,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  Calendar,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  DollarSign
} from "lucide-react"
import { NotificationBellMain } from "@/components/notifications/notification-bell-main"
import { useClasses } from "@/hooks/use-classes"
import { useSubjects } from "@/hooks/use-subjects"
import { useTeachers } from "@/hooks/use-teachers"
import { useSchool } from "@/hooks/use-school"

// Types pour les données
interface Class {
  id: string
  name: string
  level: string
  capacity: number
  current_students: number
  total_fee: number
  teacher_id: string
  teacher_name?: string
  color: string
  academic_year: string // Utilisez academic_year ici
  status: string
}

interface Subject {
  id: string
  name: string
  code: string
  teacher_number: number
  teacher_name?: string
  hours_per_week: number
  coefficient: number
  color: string
  description: string
  status: string
}

interface SchoolInfo {
  id: string
  name: string
  address: string
  phone: string
  email: string
  director: string
  founded_year: number
  logo: string
  website: string
}

interface UserAccount {
  id: string
  username: string
  email: string
  full_name: string
  phone: string
  role: string
  last_login: string
  avatar: string
  status: string
}

interface Teacher {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  address: string
  hire_date: string
  salary: number
  status: "active" | "inactive" | "on_leave"
  photo: string
  user_id: string
  created: string
  updated: string
}

interface AcademicYear {
  id: string
  year: string
  start_date: string
  end_date: string
  status: string
  created: string
  updated: string
}

function ClassModal({ 
  isOpen, 
  onClose, 
  onSave, 
  classData = null, 
  teachers = [], 
  academicYears = [], 
  selectedAcademicYear = null 
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  classData?: Class | null
  teachers?: Teacher[]
  academicYears?: AcademicYear[]
  selectedAcademicYear?: AcademicYear | null
}) {
  const [formData, setFormData] = useState({
  name: classData?.name || "",
  level: classData?.level || "Primaire",
  capacity: classData?.capacity || 30,
  total_fee: classData?.total_fee || 50000,
  teacher_id: classData?.teacher_id || "",
  color: classData?.color || "bg-blue-100 text-blue-700",
  academic_year: classData?.academic_year || selectedAcademicYear?.id || "", // Utilisez academic_year ici
  status: classData?.status !== undefined ? (classData.status === 'active' ? true : false) : true
})

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (isOpen && classData) {
      setFormData({
        name: classData.name,
        level: classData.level,
        capacity: classData.capacity,
        total_fee: classData.total_fee,
        teacher_id: classData.teacher_id,
        color: classData.color,
        academic_year: classData.academic_year, // Utilisez academic_year directement
        status: classData.status === 'active' ? 'active' : 'inactive'
      })
    }
  }, [isOpen, classData])

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
              <Label htmlFor="name">Nom de la classe</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: CP, CE1, 6ème"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="level">Niveau</Label>
              <Select 
                value={formData.level} 
                onValueChange={(value) => setFormData({...formData, level: value})}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le niveau" />
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
              <Label htmlFor="capacity">Capacité</Label>
              <Input
                id="capacity"
                type="number"
                min="10"
                max="50"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="total_fee">Frais de scolarité</Label>
              <Input
                id="total_fee"
                type="number"
                min="0"
                value={formData.total_fee}
                onChange={(e) => setFormData({...formData, total_fee: parseInt(e.target.value) || 0})}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teacher">Professeur principal</Label>
              <Select 
                value={formData.teacher_id} 
                onValueChange={(value) => setFormData({...formData, teacher_id: value})}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un professeur" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="academic_year">Année académique</Label>
              <Select 
                  value={formData.academic_year} // Utilisez academic_year ici
                  onValueChange={(value) => setFormData({...formData, academic_year: value})} // Et ici
                  disabled={isSubmitting || academicYears.length === 0}
                >
                <SelectTrigger>
                  <SelectValue placeholder={academicYears.length === 0 ? "Aucune année disponible" : "Sélectionner l'année"} />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year} {year.status === 'active' ? "(Active)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="color">Couleur</Label>
              <Select 
                value={formData.color} 
                onValueChange={(value) => setFormData({...formData, color: value})}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une couleur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-blue-100 text-blue-700">Bleu</SelectItem>
                  <SelectItem value="bg-green-100 text-green-700">Vert</SelectItem>
                  <SelectItem value="bg-yellow-100 text-yellow-700">Jaune</SelectItem>
                  <SelectItem value="bg-red-100 text-red-700">Rouge</SelectItem>
                  <SelectItem value="bg-purple-100 text-purple-700">Violet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="status"
              checked={formData.status === 'active' || formData.status === true}
              onChange={(e) => setFormData({...formData, status: e.target.checked ? 'active' : 'inactive'})}
              className="rounded border-gray-300"
              disabled={isSubmitting}
            />
            <Label htmlFor="status" className="text-sm font-medium">
              Classe active
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {classData ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SubjectModal({ 
  isOpen, 
  onClose, 
  onSave, 
  subjectData = null 
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  subjectData?: Subject | null
}) {
  const [formData, setFormData] = useState({
    name: subjectData?.name || "",
    code: subjectData?.code || "",
    hours_per_week: subjectData?.hours_per_week || 3,
    coefficient: subjectData?.coefficient || 1,
    color: subjectData?.color || "bg-blue-100 text-blue-700",
    description: subjectData?.description || "",
    status: subjectData?.status !== undefined ? (subjectData.status === 'active' ? true : false) : true
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (isOpen && subjectData) {
      setFormData({
        name: subjectData.name,
        code: subjectData.code,
        hours_per_week: subjectData.hours_per_week,
        coefficient: subjectData.coefficient,
        color: subjectData.color,
        description: subjectData.description,
        status: subjectData.status === 'active' ? 'active' : 'inactive'
      })
    }
  }, [isOpen, subjectData])

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
              <Label htmlFor="name">Nom de la matière</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Mathématiques"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Ex: MATH"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hours_per_week">Heures par semaine</Label>
              <Input
                id="hours_per_week"
                type="number"
                min="1"
                max="10"
                value={formData.hours_per_week}
                onChange={(e) => setFormData({...formData, hours_per_week: parseInt(e.target.value) || 0})}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="coefficient">Coefficient</Label>
              <Input
                id="coefficient"
                type="number"
                min="1"
                max="5"
                step="0.5"
                value={formData.coefficient}
                onChange={(e) => setFormData({...formData, coefficient: parseFloat(e.target.value) || 0})}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="color">Couleur</Label>
            <Select 
              value={formData.color} 
              onValueChange={(value) => setFormData({...formData, color: value})}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une couleur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bg-blue-100 text-blue-700">Bleu</SelectItem>
                <SelectItem value="bg-green-100 text-green-700">Vert</SelectItem>
                <SelectItem value="bg-yellow-100 text-yellow-700">Jaune</SelectItem>
                <SelectItem value="bg-red-100 text-red-700">Rouge</SelectItem>
                <SelectItem value="bg-purple-100 text-purple-700">Violet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description de la matière"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="status"
              checked={formData.status === 'active' || formData.status === true}
              onChange={(e) => setFormData({...formData, status: e.target.checked ? 'active' : 'inactive'})}
              className="rounded border-gray-300"
              disabled={isSubmitting}
            />
            <Label htmlFor="status" className="text-sm font-medium">
              Matière active
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {subjectData ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UserAccountModal({ 
  isOpen, 
  onClose, 
  onSave, 
  userData = null 
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  userData?: UserAccount | null
}) {
  const [formData, setFormData] = useState({
    full_name: userData?.full_name || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Le nom complet est requis"
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const updatedUser = {
        ...userData,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
      }
      
      // Ajouter les champs pour le mot de passe si modifié
      if (formData.newPassword) {
        Object.assign(updatedUser, {
          oldPassword: formData.currentPassword,
          password: formData.newPassword,
          passwordConfirm: formData.confirmPassword
        })
      }
      
      await onSave(updatedUser)
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    }
  }, [isOpen, userData])

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
                <Label htmlFor="full_name" className="text-sm font-medium">Nom complet</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Nom complet"
                  className={errors.full_name ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.full_name && (
                  <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>
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
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+223 XX XX XX XX"
                disabled={isSubmitting}
              />
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
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function SettingsPage() {
  const { classes, isLoading: classesLoading, fetchClasses, createClass, updateClass, deleteClass } = useClasses()
  const { subjects, isLoading: subjectsLoading, fetchSubjects, createSubject, updateSubject, deleteSubject } = useSubjects()
  const { teachers, isLoading: teachersLoading, fetchTeachers } = useTeachers()
  const { schoolInfo, isLoading: schoolLoading, updateSchoolInfo, fetchSchoolInfo } = useSchool()
  
  const [showClassModal, setShowClassModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showUserAccountModal, setShowUserAccountModal] = useState(false)
  
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  
  const [schoolFormData, setSchoolFormData] = useState<Partial<SchoolInfo>>({})
  const [isSavingSchool, setIsSavingSchool] = useState(false)

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null)


  // Récupérer les données utilisateur depuis localStorage
  const getUserAccount = (): UserAccount | null => {
    const authData = localStorage.getItem('pocketbase_auth')
    if (!authData) return null
    try {
      const { record } = JSON.parse(authData)
      return {
        id: record.id,
        username: record.username || record.email,
        email: record.email,
        full_name: record.full_name,
        phone: record.phone,
        role: record.role,
        last_login: record.last_login,
        avatar: record.avatar,
        status: record.status === 'active' ? 'active' : 'inactive'
      }
    } catch {
      return null
    }
  }

  const [userAccount, setUserAccount] = useState<UserAccount | null>(null)

  const fetchAcademicYears = async () => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      const response = await fetch(
        getApiUrl('collections/edumali_academic_years/records?sort=-year'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la récupération des années académiques')

      const result = await response.json()
      const years: AcademicYear[] = result.items

      setAcademicYears(years)
      
      // Sélectionner l'année active par défaut, ou la plus récente si aucune n'est active
      const activeYear = years.find(year => year.status === 'active') || years[0] || null
      setSelectedAcademicYear(activeYear)
      
    } catch (err) {
      console.error('Erreur années académiques:', err)
    }
  }

  useEffect(() => {
    // Charger les données au montage du composant
    fetchClasses()
    fetchSubjects()
    fetchTeachers()
    fetchAcademicYears()
    fetchSchoolInfo()
    setUserAccount(getUserAccount())
  }, [fetchClasses, fetchSubjects, fetchTeachers])


  useEffect(() => {
    console.log('School info state:', schoolInfo)
    console.log('School loading state:', schoolLoading)
    console.log('School error state:', Error)
    
    // Vérifier le cache localStorage
    const cached = localStorage.getItem('school_info')
    console.log('Cached school info:', cached ? JSON.parse(cached) : 'No cache')
  }, [schoolInfo, schoolLoading, Error])

  useEffect(() => {
    if (schoolInfo) {
      setSchoolFormData(schoolInfo)
    }
  }, [schoolInfo])

  const handleAddClass = async (classData: any) => {
    await createClass(classData)
  }

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem)
    setShowClassModal(true)
  }

  const handleSaveClass = async (classData: any) => {
    if (selectedClass) {
      await updateClass(selectedClass.id, classData)
    } else {
      await createClass(classData)
    }
    setSelectedClass(null)
  }

  const handleDeleteClass = async (classId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) {
      await deleteClass(classId)
    }
  }

  const handleAddSubject = async (subjectData: any) => {
    await createSubject(subjectData)
  }

  const handleEditSubject = (subjectItem: Subject) => {
    setSelectedSubject(subjectItem)
    setShowSubjectModal(true)
  }

  const handleSaveSubject = async (subjectData: any) => {
    if (selectedSubject) {
      await updateSubject(selectedSubject.id, subjectData)
    } else {
      await createSubject(subjectData)
    }
    setSelectedSubject(null)
  }

  const handleDeleteSubject = async (subjectId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette matière ?")) {
      await deleteSubject(subjectId)
    }
  }

  const handleSaveSchoolInfo = async () => {
    if (!schoolInfo) return
    
    setIsSavingSchool(true)
    try {
      await updateSchoolInfo(schoolFormData)
      // Mettre à jour le localStorage
      const updatedSchoolInfo = { ...schoolInfo, ...schoolFormData }
      localStorage.setItem('school_info', JSON.stringify(updatedSchoolInfo))
    } catch (error) {
      console.error('Erreur sauvegarde école:', error)
    } finally {
      setIsSavingSchool(false)
    }
  }

  const handleSaveUserAccount = async (userData: any) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      // Préparer les données à envoyer
      const dataToSend: any = {
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone || ''
      }

      // Ajouter les champs de mot de passe seulement si un nouveau mot de passe est fourni
      if (userData.password) {
        dataToSend.oldPassword = userData.oldPassword || ''
        dataToSend.password = userData.password
        dataToSend.passwordConfirm = userData.passwordConfirm
      }

      const response = await fetch(
        getApiUrl(`collections/users/records/${userData.id}`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la modification')
      }

      const updatedUser = await response.json()
      setUserAccount(updatedUser)
      
      // Mettre à jour le localStorage
      const currentAuthData = JSON.parse(authData)
      currentAuthData.record = { ...currentAuthData.record, ...updatedUser }
      localStorage.setItem('pocketbase_auth', JSON.stringify(currentAuthData))
    
    } catch (error) {
      console.error('Erreur modification utilisateur:', error)
      throw error
    }
  }

  const isLoading = classesLoading || subjectsLoading || teachersLoading || schoolLoading

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Chargement des paramètres...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Paramètres"
            description="Configurez les paramètres de l'école et gérez les données de base"
            className=""
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
                        <span className="font-medium">{classItem.current_students} élèves</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Professeur principal:</span>
                        <span className="font-medium">{classItem.teacher_name}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Année académique:</span>
                        <span className="font-medium">
                          {academicYears.find(y => y.id === classItem.academic_year)?.year || 'Non définie'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Statut:</span>
                        <Badge variant={classItem.status === 'active' ? "default" : "secondary"}>
                          {classItem.status === 'active' ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${classItem.capacity > 0 ? (classItem.current_students / classItem.capacity) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {Math.round((classItem.current_students / classItem.capacity) * 100)}% de remplissage
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {classes.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune classe</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Commencez par créer votre première classe pour organiser votre école.
                    </p>
                    <Button onClick={() => setShowClassModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer une classe
                    </Button>
                  </CardContent>
                </Card>
              )}
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
                        <span>Nombre de professeurs:</span>
                        <span className="font-medium">{subject.teacher_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Heures/semaine:</span>
                        <span className="font-medium">{subject.hours_per_week}h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Coefficient:</span>
                        <span className="font-medium">{subject.coefficient}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Statut:</span>
                        <Badge variant={subject.status === 'active' ? "default" : "secondary"}>
                          {subject.status === 'active' ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {subject.description && (
                        <div className="text-sm text-muted-foreground">
                          {subject.description}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {subjects.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune matière</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Créez des matières pour définir le programme d'enseignement de votre école.
                    </p>
                    <Button onClick={() => setShowSubjectModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer une matière
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Onglet École */}
            <TabsContent value="school" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Informations de l'École</h2>
                <p className="text-muted-foreground">Configurez les informations générales de l'école</p>
              </div>

              {schoolInfo ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Détails de l'établissement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="school-name">Nom de l'école</Label>
                        <Input
                          id="school-name"
                          value={schoolFormData.name || ''}
                          onChange={(e) => setSchoolFormData({...schoolFormData, name: e.target.value})}
                          placeholder="Nom de l'école"
                        />
                      </div>
                      <div>
                        <Label htmlFor="school-director">Directeur</Label>
                        <Input
                          id="school-director"
                          value={schoolFormData.director || ''}
                          onChange={(e) => setSchoolFormData({...schoolFormData, director: e.target.value})}
                          placeholder="Nom du directeur"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="school-address">Adresse</Label>
                      <Input
                        id="school-address"
                        value={schoolFormData.address || ''}
                        onChange={(e) => setSchoolFormData({...schoolFormData, address: e.target.value})}
                        placeholder="Adresse complète"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="school-phone">Téléphone</Label>
                        <Input
                          id="school-phone"
                          value={schoolFormData.phone || ''}
                          onChange={(e) => setSchoolFormData({...schoolFormData, phone: e.target.value})}
                          placeholder="+223 XX XX XX XX"
                        />
                      </div>
                      <div>
                        <Label htmlFor="school-email">Email</Label>
                        <Input
                          id="school-email"
                          type="email"
                          value={schoolFormData.email || ''}
                          onChange={(e) => setSchoolFormData({...schoolFormData, email: e.target.value})}
                          placeholder="email@exemple.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="school-founded">Année de création</Label>
                        <Input
                          id="school-founded"
                          type="number"
                          value={schoolFormData.founded_year || ''}
                          onChange={(e) => setSchoolFormData({...schoolFormData, founded_year: parseInt(e.target.value) || 0})}
                          placeholder="2000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="school-website">Site web</Label>
                        <Input
                          id="school-website"
                          value={schoolFormData.website || ''}
                          onChange={(e) => setSchoolFormData({...schoolFormData, website: e.target.value})}
                          placeholder="https://www.exemple.com"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button onClick={handleSaveSchoolInfo} disabled={isSavingSchool}>
                        {isSavingSchool ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Sauvegarder les modifications
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <School className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Informations non disponibles</h3>
                    <p className="text-muted-foreground text-center">
                      Les informations de l'école n'ont pas pu être chargées.
                    </p>
                  </CardContent>
                </Card>
              )}
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

              {userAccount ? (
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
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{userAccount.full_name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{userAccount.role}</p>
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
                            <p className="text-sm text-muted-foreground">{userAccount.phone || 'Non renseigné'}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Statut</p>
                            <Badge variant={userAccount.status === 'active' ? "default" : "secondary"}>
                              {userAccount.status === 'active' ? "Actif" : "Inactif"}
                            </Badge>
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

                        {userAccount.last_login && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-3">
                              <Clock className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-blue-800">Dernière connexion</p>
                                <p className="text-xs text-blue-600">
                                  {new Date(userAccount.last_login).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Actions de sécurité</h4>
                          <div className="space-y-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full justify-start"
                              onClick={() => setShowUserAccountModal(true)}
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              Changer le mot de passe
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                              <Eye className="h-4 w-4 mr-2" />
                              Voir l'historique de connexion
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Utilisateur non connecté</h3>
                    <p className="text-muted-foreground text-center">
                      Impossible de charger les informations du compte.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Modals */}
          <ClassModal
            isOpen={showClassModal}
            onClose={() => {
              setShowClassModal(false)
              setSelectedClass(null)
            }}
            onSave={handleSaveClass}
            classData={selectedClass}
            teachers={teachers}
            academicYears={academicYears}
            selectedAcademicYear={selectedAcademicYear}
          />

          <SubjectModal
            isOpen={showSubjectModal}
            onClose={() => {
              setShowSubjectModal(false)
              setSelectedSubject(null)
            }}
            onSave={handleSaveSubject}
            subjectData={selectedSubject}
          />

          <UserAccountModal
            isOpen={showUserAccountModal}
            onClose={() => setShowUserAccountModal(false)}
            onSave={handleSaveUserAccount}
            userData={userAccount}
          />
        </div>
      </main>
    </div>
  )
}