"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Building2,
  DollarSign,
  Users,
  Check,
  X,
  Image,
  Globe
} from "lucide-react"

import { AffectationsPanel } from "@/components/affectations-panel"
import { useSchoolInfo, useAcademicYears, useSubjects } from "@/hooks/use-settings"
import { useClasses, type ClassFeeTypeData } from "@/hooks/use-classes"
import { useTeachers } from "@/hooks/use-teachers"
import { useClassSubjects } from "@/hooks/use-class-subjects"
import { useFeeTypes } from "@/hooks/use-payments"

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
  feeTypes?: ClassFeeTypeData[]
}

interface Subject {
  id: string
  name: string
  code: string
  teacherNumber: number
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
  id: number
  email: string
  full_name: string
  created_at: number | null
}

interface FeeTypeData {
  id: string
  name: string
  amount: number
  period: string
  description?: string
}

interface AccountMessage {
  type: "success" | "error"
  text: string
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
  selectedAcademicYear = null,
  allFeeTypes = [],
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  classData?: Class | null
  teachers?: any[]
  academicYears?: AcademicYear[]
  selectedAcademicYear?: AcademicYear | null
  allFeeTypes?: ClassFeeTypeData[]
}) {
  const [formData, setFormData] = useState({
  name: classData?.name || "",
  level: classData?.level || "1",
  capacity: classData?.capacity || 30,
  total_fee: classData?.total_fee || 50000,
  teacher_id: classData?.teacher_id || "",
  color: classData?.color || "#3b82f6",
  academic_year: classData?.academic_year || selectedAcademicYear?.id || "", // Utilisez academic_year ici
  status: classData?.status === "inactive" ? "inactive" : "active"
})

  const [selectedFeeTypes, setSelectedFeeTypes] = useState<{ feeTypeId: string; amount: number | null }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave({ ...formData, feeTypeItems: selectedFeeTypes })
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const supplementaryTotal = selectedFeeTypes.reduce((sum, item) => {
    const feeType = allFeeTypes.find(f => f.id === item.feeTypeId)
    return sum + (item.amount ?? feeType?.amount ?? 0)
  }, 0)

  const baseFee = Number(formData.total_fee) || 0
  const totalWithSupplements = baseFee + supplementaryTotal

  useEffect(() => {
    if (isOpen) {
      if (classData) {
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
        setSelectedFeeTypes(
          (classData.feeTypes ?? []).map(ft => ({
            feeTypeId: ft.feeTypeId,
            amount: ft.amount,
          }))
        )
      } else {
        setSelectedFeeTypes([])
      }
    }
  }, [isOpen, classData])

  const toggleFeeType = (feeType: ClassFeeTypeData) => {
    setSelectedFeeTypes(prev => {
      const exists = prev.find(item => item.feeTypeId === feeType.id)
      if (exists) {
        return prev.filter(item => item.feeTypeId !== feeType.id)
      }
      return [...prev, { feeTypeId: feeType.id, amount: null }]
    })
  }

  const updateFeeTypeAmount = (feeTypeId: string, amount: number | null) => {
    setSelectedFeeTypes(prev =>
      prev.map(item =>
        item.feeTypeId === feeTypeId ? { ...item, amount } : item
      )
    )
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
              <Input
                id="level"
                type="number"
                min={1}
                placeholder="Ex: 1, 2, 3..."
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ordre de progression entre les classes. Deux classes peuvent avoir le même niveau (ex: 1ère A et 1ère B).
              </p>
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
              <Label htmlFor="total_fee">Frais de scolarité (base)</Label>
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

          {allFeeTypes.length > 0 && (
            <div className="border rounded-lg p-4 space-y-3">
              <Label className="text-sm font-semibold">Frais supplémentaires</Label>
              <p className="text-xs text-muted-foreground">
                Cochez les types de frais à ajouter au montant de base de cette classe
              </p>
              <div className="space-y-2">
                {allFeeTypes.map((ft) => {
                  const selected = selectedFeeTypes.find(s => s.feeTypeId === ft.id)
                  const isChecked = !!selected
                  const displayAmount = selected?.amount ?? ft.amount
                  return (
                    <div key={ft.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFeeType(ft)}
                        className="rounded border-gray-300 h-4 w-4"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm flex-1">{ft.name}</span>
                      {isChecked && (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            value={displayAmount}
                            onChange={(e) => updateFeeTypeAmount(ft.id, parseInt(e.target.value) || 0)}
                            className="w-24 h-8 text-sm"
                            disabled={isSubmitting}
                          />
                          <span className="text-xs text-muted-foreground">FCFA</span>
                        </div>
                      )}
                      {!isChecked && (
                        <span className="text-xs text-muted-foreground">
                          {ft.amount.toLocaleString()} FCFA
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              {selectedFeeTypes.length > 0 && (
                <div className="pt-2 border-t text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Frais de base</span>
                    <span className="font-medium">{baseFee.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supplémentaires</span>
                    <span className="font-medium text-green-600">+ {supplementaryTotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1 border-t">
                    <span>Total</span>
                    <span>{totalWithSupplements.toLocaleString()} FCFA</span>
                  </div>
                </div>
              )}
            </div>
          )}

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
                  <SelectItem value="#3b82f6">Bleu</SelectItem>
                  <SelectItem value="#22c55e">Vert</SelectItem>
                  <SelectItem value="#eab308">Jaune</SelectItem>
                  <SelectItem value="#ef4444">Rouge</SelectItem>
                  <SelectItem value="#a855f7">Violet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="status"
              checked={formData.status === 'active'}
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
  subjectData = null,
  allTeachers = []
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  subjectData?: Subject | null
  allTeachers?: any[]
}) {
  const [formData, setFormData] = useState({
    name: subjectData?.name || "",
    code: subjectData?.code || "",
    hours_per_week: subjectData?.hours_per_week || 3,
    coefficient: subjectData?.coefficient || 1,
    color: subjectData?.color || "#3b82f6",
    description: subjectData?.description || "",
    status: subjectData?.status === "inactive" ? "inactive" : "active",
    teacherIds: [] as string[],
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
        status: subjectData.status === 'active' ? 'active' : 'inactive',
        teacherIds: [],
      })
    } else if (isOpen && !subjectData) {
      setFormData({
        name: "",
        code: "",
        hours_per_week: 3,
        coefficient: 1,
        color: "#3b82f6",
        description: "",
        status: "active",
        teacherIds: [],
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
                <SelectItem value="#3b82f6">Bleu</SelectItem>
                <SelectItem value="#22c55e">Vert</SelectItem>
                <SelectItem value="#eab308">Jaune</SelectItem>
                <SelectItem value="#ef4444">Rouge</SelectItem>
                <SelectItem value="#a855f7">Violet</SelectItem>
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
              checked={formData.status === 'active'}
              onChange={(e) => setFormData({...formData, status: e.target.checked ? 'active' : 'inactive'})}
              className="rounded border-gray-300"
              disabled={isSubmitting}
            />
            <Label htmlFor="status" className="text-sm font-medium">
              Matière active
            </Label>
          </div>

          {!subjectData && allTeachers.length > 0 && (
            <div>
              <Label>Assigner des enseignants (optionnel)</Label>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto border rounded-md p-2">
                {allTeachers.map(t => (
                  <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.teacherIds.includes(t.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, teacherIds: [...formData.teacherIds, t.id]})
                        } else {
                          setFormData({...formData, teacherIds: formData.teacherIds.filter(id => id !== t.id)})
                        }
                      }}
                      className="rounded"
                    />
                    {t.full_name}
                  </label>
                ))}
              </div>
            </div>
          )}

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

function FeeTypeModal({
  isOpen,
  onClose,
  onSave,
  feeTypeData = null,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  feeTypeData?: FeeTypeData | null
}) {
  const periods = [
    { value: "mensuel", label: "Mensuel" },
    { value: "trimestriel", label: "Trimestriel" },
    { value: "annuel", label: "Annuel" },
    { value: "unique", label: "Unique" },
  ]

  const [formData, setFormData] = useState({
    name: feeTypeData?.name || "",
    amount: feeTypeData?.amount || 0,
    period: feeTypeData?.period || "annuel",
    description: feeTypeData?.description || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      if (feeTypeData) {
        setFormData({
          name: feeTypeData.name,
          amount: feeTypeData.amount,
          period: feeTypeData.period,
          description: feeTypeData.description || "",
        })
      } else {
        setFormData({ name: "", amount: 0, period: "annuel", description: "" })
      }
    }
  }, [isOpen, feeTypeData])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{feeTypeData ? "Modifier le type de frais" : "Ajouter un type de frais"}</DialogTitle>
          <DialogDescription>
            {feeTypeData ? "Modifiez les informations du type de frais" : "Ajoutez un nouveau type de frais à l'école"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ft-name">Nom</Label>
              <Input
                id="ft-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Frais d'examen"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="ft-amount">Montant (FCFA)</Label>
              <Input
                id="ft-amount"
                type="number"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="ft-period">Période</Label>
            <Select
              value={formData.period}
              onValueChange={(value) => setFormData({...formData, period: value})}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la période" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ft-description">Description (optionnelle)</Label>
            <Input
              id="ft-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description du type de frais"
              disabled={isSubmitting}
            />
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
              {feeTypeData ? "Modifier" : "Ajouter"}
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
    username: userData?.email || "",
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

    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis"
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
        username: formData.username,
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
        username: userData.email || "",
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
              <Label htmlFor="username" className="text-sm font-medium">Nom d'utilisateur</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Nom d'utilisateur"
                className={errors.username ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="text-xs text-red-500 mt-1">{errors.username}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Utilisé pour vous connecter</p>
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
  const { schoolInfo: apiSchoolInfo, isLoading: schoolLoading, save: saveSchool } = useSchoolInfo()
  const { subjects: apiSubjects, isLoading: subjectsLoading, create: createSubject, update: updateSubject, remove: deleteSubject } = useSubjects()
  const { classes: apiClasses, isLoading: classesLoading, create: createClassApi, update: updateClassApi, remove: removeClassApi } = useClasses()
  const { years: apiYears, currentYear, isLoading: yearsLoading, create: createYear, update: updateYear, remove: removeYear } = useAcademicYears()

  const { teachers: apiTeachers } = useTeachers()
  const { feeTypes: allFeeTypes, create: createFeeType, update: updateFeeType, remove: removeFeeType } = useFeeTypes()
  const router = useRouter()

  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    id: "local-school",
    name: "",
    address: "",
    phone: "",
    email: "",
    director: "",
    founded_year: new Date().getFullYear(),
    logo: "",
    website: "",
  })
  
  useEffect(() => {
    if (apiSchoolInfo) {
      setSchoolInfo({
        id: apiSchoolInfo.id,
        name: apiSchoolInfo.name,
        address: apiSchoolInfo.address,
        phone: apiSchoolInfo.phone,
        email: apiSchoolInfo.email,
        director: apiSchoolInfo.director,
        founded_year: apiSchoolInfo.foundedYear ?? new Date().getFullYear(),
        logo: apiSchoolInfo.logoUrl,
        website: apiSchoolInfo.website,
      })
    }
  }, [apiSchoolInfo])

  useEffect(() => {
    if (apiSubjects.length > 0) {
      setSubjects(apiSubjects.map(s => ({
        id: s.id,
        name: s.name,
        code: s.code,
        teacherNumber: s.teacherNumber ?? 0,
        hours_per_week: s.hoursPerWeek,
        coefficient: s.coefficient,
        color: s.color,
        description: s.description,
        status: s.status === "Actif" ? "active" : "inactive",
      })))
    }
  }, [apiSubjects])

  useEffect(() => {
    if (apiClasses.length > 0) {
      setClasses(apiClasses.map(c => ({
        id: c.id,
        name: c.name,
        level: String(c.level ?? ""),
        capacity: c.capacity ?? 0,
        current_students: c.studentCount ?? 0,
        total_fee: c.totalFee ?? 0,
        teacher_id: c.teacherId ?? "",
        teacher_name: "",
        color: c.color ?? "",
        academic_year: c.academicYear ?? "",
        status: c.status ?? "active",
        feeTypes: c.feeTypes ?? [],
      })))
    }
  }, [apiClasses])

  const [showClassModal, setShowClassModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showUserAccountModal, setShowUserAccountModal] = useState(false)
  
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  
  const [showFeeTypeModal, setShowFeeTypeModal] = useState(false)
  const [selectedFeeType, setSelectedFeeType] = useState<FeeTypeData | null>(null)
  
  const [schoolFormData, setSchoolFormData] = useState<Partial<SchoolInfo>>({})
  const [isSavingSchool, setIsSavingSchool] = useState(false)

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null)

  useEffect(() => {
    if (apiYears.length > 0) {
      setAcademicYears(apiYears.map(y => ({
        id: y.id,
        year: y.name,
        start_date: y.startDate,
        end_date: y.endDate,
        status: y.isCurrent ? "active" : "inactive",
        created: "",
        updated: "",
      })))
      const current = apiYears.find(y => y.isCurrent)
      if (current) {
        setSelectedAcademicYear({
          id: current.id,
          year: current.name,
          start_date: current.startDate,
          end_date: current.endDate,
          status: "active",
          created: "",
          updated: "",
        })
      }
    }
  }, [apiYears])


  const [userAccount, setUserAccount] = useState<UserAccount | null>(null)
  const [accountMessage, setAccountMessage] = useState<AccountMessage | null>(null)
  const [isAccountLoading, setIsAccountLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        if (!res.ok) {
          setUserAccount(null)
          return
        }
        const data = await res.json()
        setUserAccount(data.user)
      } catch {
        setUserAccount(null)
      } finally {
        setIsAccountLoading(false)
      }
    }
    fetchUser()
  }, [])


  useEffect(() => {
    console.log('School info state:', schoolInfo)
    
    // Vérifier le cache localStorage
    const cached = localStorage.getItem('school_info')
    console.log('Cached school info:', cached ? JSON.parse(cached) : 'No cache')
  }, [schoolInfo])

  useEffect(() => {
    if (schoolInfo) {
      setSchoolFormData(schoolInfo)
    }
  }, [schoolInfo])

  const buildFeeTypeItems = (classData: any) => {
    if (!classData.feeTypeItems || classData.feeTypeItems.length === 0) return undefined
    return classData.feeTypeItems.map((item: any) => ({
      feeTypeId: Number(item.feeTypeId),
      amount: item.amount ?? null,
    }))
  }

  const handleAddClass = async (classData: any) => {
    await createClassApi({
      name: classData.name,
      level: classData.level && !isNaN(Number(classData.level)) ? Number(classData.level) : null,
      capacity: classData.capacity ?? null,
      totalFee: classData.total_fee ?? null,
      teacherId: classData.teacher_id ? Number(classData.teacher_id) : null,
      color: classData.color,
      academicYear: classData.academic_year,
      status: classData.status === true ? "active" : classData.status || "active",
      feeTypeItems: buildFeeTypeItems(classData),
    })
  }

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem)
    setShowClassModal(true)
  }

  const handleSaveClass = async (classData: any) => {
    const payload = {
      name: classData.name,
      level: classData.level && !isNaN(Number(classData.level)) ? Number(classData.level) : null,
      capacity: classData.capacity ?? null,
      totalFee: classData.total_fee ?? null,
      teacherId: classData.teacher_id ? Number(classData.teacher_id) : null,
      color: classData.color,
      academicYear: classData.academic_year,
      status: classData.status === true ? "active" : classData.status || "active",
      feeTypeItems: buildFeeTypeItems(classData),
    }
    if (selectedClass) {
      await updateClassApi(selectedClass.id, payload)
    } else {
      await createClassApi(payload)
    }
    setSelectedClass(null)
  }

  const handleDeleteClass = async (classId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) {
      await removeClassApi(classId)
    }
  }

  const handleEditSubject = (subjectItem: Subject) => {
    setSelectedSubject(subjectItem)
    setShowSubjectModal(true)
  }

  const handleSaveSubject = async (subjectData: any) => {
    try {
      if (selectedSubject) {
        await updateSubject(selectedSubject.id, {
          name: subjectData.name,
          code: subjectData.code,
          coefficient: subjectData.coefficient,
          hoursPerWeek: subjectData.hours_per_week,
          description: subjectData.description,
          color: subjectData.color,
          status: subjectData.status === "active" ? "Actif" : "Inactif",
        })
      } else {
        await createSubject({
          name: subjectData.name,
          code: subjectData.code,
          coefficient: subjectData.coefficient,
          hoursPerWeek: subjectData.hours_per_week,
          description: subjectData.description,
          color: subjectData.color,
          status: subjectData.status === "active" ? "Actif" : "Inactif",
          teacherIds: subjectData.teacherIds ?? [],
        })
      }
    } catch (e) {
      console.error('Erreur sauvegarde matière:', e)
    }
    setSelectedSubject(null)
  }

  const handleDeleteSubject = async (subjectId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette matière ?")) {
      await deleteSubject(subjectId)
    }
  }

  const handleEditFeeType = (feeType: FeeTypeData) => {
    setSelectedFeeType(feeType)
    setShowFeeTypeModal(true)
  }

  const handleSaveFeeType = async (data: any) => {
    try {
      if (selectedFeeType) {
        await updateFeeType(selectedFeeType.id, {
          name: data.name,
          amount: data.amount,
          period: data.period,
          description: data.description,
        })
      } else {
        await createFeeType({
          name: data.name,
          amount: data.amount,
          period: data.period,
          description: data.description,
        })
      }
    } catch (e) {
      console.error("Erreur sauvegarde type de frais:", e)
    }
    setSelectedFeeType(null)
  }

  const handleDeleteFeeType = async (feeTypeId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce type de frais ?")) {
      await removeFeeType(feeTypeId)
    }
  }

  const handleSaveSchoolInfo = async () => {
    if (!schoolInfo) return
    setIsSavingSchool(true)
    try {
      const updated = await saveSchool({
        name: schoolFormData.name ?? schoolInfo.name,
        address: schoolFormData.address ?? schoolInfo.address,
        phone: schoolFormData.phone ?? schoolInfo.phone,
        email: schoolFormData.email ?? schoolInfo.email,
        website: schoolFormData.website ?? schoolInfo.website,
        director: schoolFormData.director ?? schoolInfo.director,
        foundedYear: schoolFormData.founded_year ?? schoolInfo.founded_year,
        logoUrl: schoolFormData.logo ?? undefined,
      })
      if (updated) {
        setSchoolInfo({
          id: updated.id,
          name: updated.name,
          address: updated.address,
          phone: updated.phone,
          email: updated.email,
          director: updated.director,
          founded_year: updated.foundedYear ?? schoolInfo.founded_year,
          logo: updated.logoUrl,
          website: updated.website,
        })
      }
    } catch (error) {
      console.error('Erreur sauvegarde école:', error)
    } finally {
      setIsSavingSchool(false)
    }
  }

  const handleSaveUserAccount = async (userData: any) => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: userData.full_name,
          username: userData.username,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "Erreur lors de la mise à jour")
      }

      setUserAccount(data.user)

      if (userData.password) {
        await handleChangePassword({
          currentPassword: userData.oldPassword,
          newPassword: userData.password,
          confirmPassword: userData.passwordConfirm,
        })
      } else {
        setAccountMessage({ type: "success", text: "Profil mis à jour avec succès." })
      }
    } catch (error: any) {
      console.error("Erreur modification utilisateur:", error)
      setAccountMessage({ type: "error", text: error.message || "Erreur lors de la mise à jour." })
      throw error
    }
  }

  const handleChangePassword = async (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "Erreur lors du changement de mot de passe")
      }

      setAccountMessage({ type: "success", text: "Mot de passe modifié avec succès." })
    } catch (error: any) {
      console.error("Erreur changement mot de passe:", error)
      setAccountMessage({ type: "error", text: error.message || "Erreur lors du changement de mot de passe." })
      throw error
    }
  }

  const isLoading = false

  if (isLoading) {
    return (
      <AppLayout>
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Chargement des paramètres...</p>
          </div>
        </AppLayout>
    )
  }

  return (
    <AppLayout>
          <PageHeader
            title="Paramètres"
            description="Configurez les paramètres de l'école et gérez les données de base"
            className=""
          >
            <HelpButton section="parametres" />
          </PageHeader>

          <Tabs defaultValue="classes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="classes" className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Classes</span>
              </TabsTrigger>
              <TabsTrigger value="subjects" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Matières</span>
              </TabsTrigger>
              <TabsTrigger value="fee-types" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Types de frais</span>
              </TabsTrigger>
              <TabsTrigger value="affectations" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Affectations</span>
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
                            onClick={() => router.push(`/settings/classes/${classItem.id}`)}
                            className="h-6 w-6 p-0"
                            title="Détails de la classe"
                          >
                            <Eye className="h-3 w-3" />
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
                        <span>Frais:</span>
                        <span className="font-medium">
                          {classItem.total_fee.toLocaleString()} FCFA
                          {classItem.feeTypes && classItem.feeTypes.length > 0 && (
                            <span className="text-green-600 text-xs ml-1">
                              +{classItem.feeTypes.reduce((s, ft) => s + (ft.amount ?? ft.feeTypeAmount), 0).toLocaleString()}
                            </span>
                          )}
                        </span>
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
                            onClick={() => router.push(`/settings/subjects/${subject.id}`)}
                            className="h-6 w-6 p-0"
                            title="Détails de la matière"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
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
                        <span className="font-medium">{subject.teacherNumber ?? 0} professeur{(subject.teacherNumber ?? 0) > 1 ? "s" : ""}</span>
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

            {/* Onglet Types de frais */}
            <TabsContent value="fee-types" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Gestion des Types de Frais</h2>
                  <p className="text-muted-foreground">Configurez les types de frais supplémentaires (examen, transport, assurance, etc.)</p>
                </div>
                <Button onClick={() => { setSelectedFeeType(null); setShowFeeTypeModal(true) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau type de frais
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allFeeTypes.map((ft) => (
                  <Card key={ft.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{ft.name}</CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditFeeType(ft)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteFeeType(ft.id)}
                            className="h-6 w-6 p-0 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>Type de frais</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Montant:</span>
                        <span className="font-medium">{ft.amount.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Période:</span>
                        <span className="font-medium capitalize">{ft.period}</span>
                      </div>
                      {ft.description && (
                        <div className="text-sm text-muted-foreground">
                          {ft.description}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {allFeeTypes.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucun type de frais</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Créez des types de frais (examen, transport, assurance, tenue, etc.) pour pouvoir les ajouter aux classes comme frais supplémentaires.
                    </p>
                    <Button onClick={() => { setSelectedFeeType(null); setShowFeeTypeModal(true) }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un type de frais
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Onglet Affectations */}
            <TabsContent value="affectations" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Affectations Matières → Classes</h2>
                <p className="text-muted-foreground">Assignez les matières à chaque classe avec leur coefficient</p>
              </div>
              <AffectationsPanel classes={classes} allSubjects={subjects} />
            </TabsContent>

            {/* Onglet École */}
            <TabsContent value="school" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Informations de l'École</h2>
                <p className="text-muted-foreground">Configurez les informations générales de l'école et son identité visuelle</p>
              </div>

              {schoolInfo ? (
                <>
                  {/* Carte d'identité visuelle */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Identité de l'établissement</CardTitle>
                      <CardDescription>Prévisualisation de la carte d'identité de l'école</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                          {schoolFormData.logo ? (
                            <img
                              src={schoolFormData.logo}
                              alt="Logo école"
                              className="w-28 h-28 object-contain rounded-xl border bg-white shadow-sm"
                            />
                          ) : (
                            <div className="w-28 h-28 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30">
                              <School className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>

                        {/* Infos */}
                        <div className="flex-1 text-center md:text-left space-y-1">
                          <h3 className="text-2xl font-bold tracking-tight">
                            {schoolFormData.name || "Nom de l'école"}
                          </h3>
                          {schoolFormData.director && (
                            <p className="text-lg text-muted-foreground">
                              Directeur : <span className="font-semibold text-foreground">{schoolFormData.director}</span>
                            </p>
                          )}
                          {schoolFormData.address && (
                            <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {schoolFormData.address}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-3 justify-center md:justify-start text-sm text-muted-foreground pt-1">
                            {schoolFormData.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                {schoolFormData.phone}
                              </span>
                            )}
                            {schoolFormData.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                {schoolFormData.email}
                              </span>
                            )}
                            {schoolFormData.website && (
                              <span className="flex items-center gap-1">
                                <Globe className="h-3.5 w-3.5" />
                                {schoolFormData.website}
                              </span>
                            )}
                            {schoolFormData.founded_year && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Créée en {schoolFormData.founded_year}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Formulaire détaillé */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Détails de l'établissement</CardTitle>
                      <CardDescription>Modifiez les informations de votre école</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Logo */}
                      <div>
                        <Label>Logo de l'école</Label>
                        <div className="flex items-center gap-4 mt-1.5">
                          <div className="flex-shrink-0">
                            {schoolFormData.logo ? (
                              <img
                                src={schoolFormData.logo}
                                alt="Aperçu logo"
                                className="w-16 h-16 object-contain rounded-lg border bg-white"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/20">
                                <Image className="h-6 w-6 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <Input
                              value={schoolFormData.logo || ''}
                              onChange={(e) => setSchoolFormData({...schoolFormData, logo: e.target.value})}
                              placeholder="URL du logo"
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const input = document.createElement('input')
                                  input.type = 'file'
                                  input.accept = 'image/*'
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0]
                                    if (file) {
                                      const reader = new FileReader()
                                      reader.onload = (ev) => {
                                        setSchoolFormData({...schoolFormData, logo: ev.target?.result as string})
                                      }
                                      reader.readAsDataURL(file)
                                    }
                                  }
                                  input.click()
                                }}
                              >
                                <Image className="h-4 w-4 mr-1" />
                                Choisir un fichier
                              </Button>
                              {schoolFormData.logo && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSchoolFormData({...schoolFormData, logo: ''})}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Retirer
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

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
                          <Label htmlFor="school-director">Directeur / Directrice</Label>
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
                </>
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
                <Button onClick={() => setShowUserAccountModal(true)} disabled={!userAccount}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier le compte
                </Button>
              </div>

              {accountMessage && (
                <div className={`p-4 rounded-lg border ${
                  accountMessage.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}>
                  <p className="text-sm font-medium">{accountMessage.text}</p>
                </div>
              )}

              {isAccountLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : userAccount ? (
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
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Nom d'utilisateur</p>
                            <p className="text-sm text-muted-foreground">{userAccount.email}</p>
                          </div>
                        </div>

                        {userAccount.created_at && (
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Membre depuis</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(userAccount.created_at).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                        )}
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

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Actions de sécurité</h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => setShowUserAccountModal(true)}
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Changer le mot de passe
                          </Button>
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
            teachers={apiTeachers}
            academicYears={academicYears}
            selectedAcademicYear={selectedAcademicYear}
            allFeeTypes={allFeeTypes}
          />

          <FeeTypeModal
            isOpen={showFeeTypeModal}
            onClose={() => {
              setShowFeeTypeModal(false)
              setSelectedFeeType(null)
            }}
            onSave={handleSaveFeeType}
            feeTypeData={selectedFeeType}
          />

          <SubjectModal
            isOpen={showSubjectModal}
            onClose={() => {
              setShowSubjectModal(false)
              setSelectedSubject(null)
            }}
            onSave={handleSaveSubject}
            subjectData={selectedSubject}
            allTeachers={apiTeachers}
          />

          <UserAccountModal
            isOpen={showUserAccountModal}
            onClose={() => setShowUserAccountModal(false)}
            onSave={handleSaveUserAccount}
            userData={userAccount}
          />
        </AppLayout>
  )
}
