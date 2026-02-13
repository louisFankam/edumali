// hooks/use-students.ts
import { useState, useCallback } from "react"
import { useClasses } from './use-classes'
import { pb, COLLECTIONS } from '@/lib/pocketbase'

interface Student {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  class: string
  classId?: string
  parentName: string
  parentPhone: string
  address: string
  enrollmentDate: string
  status: string
  nationality: string
  photo?: File
}

interface Class {
  id: string
  name: string
  level: string
}

interface PocketBaseStudent {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  class_id: string
  parent_name: string
  parent_phone: string
  address: string
  enrollment_date: string
  status: string
  nationality: string
  photo?: File
  expand?: {
    class_id?: {
      name: string
      level: string
    }
  }
}

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newRegistrations, setNewRegistrations] = useState(0)
  const { incrementClassStudents, decrementClassStudents } = useClasses()

  const calculateNewRegistrations = useCallback((studentsData: Student[]) => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    const newRegistrationsCount = studentsData.filter(student => {
      const enrollmentDate = new Date(student.enrollmentDate)
      return enrollmentDate.getMonth() === currentMonth && 
             enrollmentDate.getFullYear() === currentYear
    }).length
    
    setNewRegistrations(newRegistrationsCount)
  }, [])

  const getCurrentAcademicYear = () => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const nextYear = currentYear + 1
    return `${currentYear}-${nextYear}`
  }

  const createOrGetActiveAcademicYear = useCallback(async () => {
    try {
      // Vérifier s'il existe une année académique active
      const academicYearData = await pb.collection(COLLECTIONS.ACADEMIC_YEARS).getList(1, 1, {
        filter: 'status = "active"'
      })
      
      console.log('Année académique:', academicYearData.items)
      
      // Si une année active existe, la retourner
      if (academicYearData.items.length > 0) {
        return academicYearData.items[0].id
      }

      // Si aucune année active n'existe, en créer une nouvelle
      console.log('Creating new academic year...')
      const currentYear = new Date().getFullYear()
      const nextYear = currentYear + 1
      const academicYearName = `${currentYear}-${nextYear}`
      
      const startDate = new Date(currentYear, 8, 1) // 1er septembre
      const endDate = new Date(nextYear, 6, 30) // 30 juin

      const newAcademicYearData = {
        year: academicYearName,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active'
      }

      const createdAcademicYear = await pb.collection(COLLECTIONS.ACADEMIC_YEARS).create(newAcademicYearData)
      console.log('Nouvelle année académique créée:', createdAcademicYear)
      return createdAcademicYear.id

    } catch (err) {
      console.error('Erreur année académique:', err)
      throw err
    }
  }, [])

  const fetchClasses = useCallback(async (academicYearId: string) => {
    try {
      const result = await pb.collection(COLLECTIONS.CLASSES).getList(1, 50, {
        filter: `academic_year = "${academicYearId}"`
      })
      
      console.log('Classes récupérées:', result.items)
      return result.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        level: item.level
      }))
    } catch (err) {
      console.error('Erreur classes:', err)
      return []
    }
  }, [])

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Créer ou récupérer l'année académique active
      const activeAcademicYear = await createOrGetActiveAcademicYear()

      if (!activeAcademicYear) throw new Error('Impossible de créer ou récupérer une année académique active')

      // Récupérer les classes
      const classesData = await fetchClasses(activeAcademicYear)
      setClasses(classesData)

      // Récupérer les étudiants
      const result = await pb.collection(COLLECTIONS.STUDENTS).getList(1, 500, {
        filter: `academic_year = "${activeAcademicYear}"`,
        expand: 'class_id'
      })
      
      const transformedStudents: Student[] = result.items.map((item: PocketBaseStudent) => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        dateOfBirth: item.date_of_birth,
        gender: item.gender,
        class: item.expand?.class_id?.name || 'Inconnu',
        classId: item.class_id,
        school: "",
        parentName: item.parent_name,
        parentPhone: item.parent_phone,
        address: item.address,
        enrollmentDate: item.enrollment_date,
        status: item.status === 'active' ? 'Actif' : item.status === 'transferred' ? 'Transféré' : item.status === 'graduated' ? 'Diplômé' : 'Inactif',
        nationality: item.nationality || '',
        photo: item.photo
      }))

      setStudents(transformedStudents)
      calculateNewRegistrations(transformedStudents)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur élèves:', err)
    } finally {
      setIsLoading(false)
    }
  }, [calculateNewRegistrations, fetchClasses, createOrGetActiveAcademicYear])

  const createStudent = useCallback(async (studentData: Omit<Student, "id">) => {
    try {
      // Créer ou récupérer l'année académique active
      const activeAcademicYear = await createOrGetActiveAcademicYear()

      if (!activeAcademicYear) throw new Error('Aucune année académique active disponible')

      // Récupérer l'ID de la classe basé sur le nom
      const classData = await pb.collection(COLLECTIONS.CLASSES).getList(1, 1, {
        filter: `name = "${studentData.class}" && academic_year = "${activeAcademicYear}"`
      })
      
      const classId = classData.items[0]?.id

      if (!classId) throw new Error(`Classe "${studentData.class}" non trouvée pour l'année académique active`)

      const pocketbaseData = {
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        date_of_birth: studentData.dateOfBirth,
        gender: studentData.gender,
        class_id: classId,
        academic_year: activeAcademicYear,
        parent_name: studentData.parentName,
        parent_phone: studentData.parentPhone,
        address: studentData.address,
        enrollment_date: studentData.enrollmentDate,
        status: studentData.status === 'Actif' ? 'active' : 'inactive',
        nationality: studentData.nationality || '',
        photo: studentData.photo || null
      }

      await pb.collection(COLLECTIONS.STUDENTS).create(pocketbaseData)

      // Incrémenter le compteur de la classe si l'élève a une classe
      if (pocketbaseData.class_id) {
        await incrementClassStudents(pocketbaseData.class_id)
      }

      await fetchStudents()
      
    } catch (err) {
      console.error('Erreur création:', err)
      throw err
    }
  }, [fetchStudents, createOrGetActiveAcademicYear, incrementClassStudents])

  const updateStudent = useCallback(async (id: string, studentData: Student) => {
    try {
      // Créer ou récupérer l'année académique active
      const activeAcademicYear = await createOrGetActiveAcademicYear()

      if (!activeAcademicYear) throw new Error('Aucune année académique active disponible')

      // Récupérer l'ID de la classe basé sur le nom
      const classData = await pb.collection(COLLECTIONS.CLASSES).getList(1, 1, {
        filter: `name = "${studentData.class}" && academic_year = "${activeAcademicYear}"`
      })
      
      const classId = classData.items[0]?.id

      const pocketbaseData = {
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        date_of_birth: studentData.dateOfBirth,
        gender: studentData.gender,
        class_id: classId,
        academic_year: activeAcademicYear,
        parent_name: studentData.parentName,
        parent_phone: studentData.parentPhone,
        address: studentData.address,
        enrollment_date: studentData.enrollmentDate,
        status: studentData.status === 'Actif' ? 'active' : studentData.status === 'Transféré' ? 'transferred' : studentData.status === 'Diplômé' ? 'graduated' : 'inactive',
        nationality: studentData.nationality || '',
        photo: studentData.photo || null
      }

      await pb.collection(COLLECTIONS.STUDENTS).update(id, pocketbaseData)
      await fetchStudents()
      
    } catch (err) {
      console.error('Erreur modification:', err)
      throw err
    }
  }, [fetchStudents, createOrGetActiveAcademicYear])

  const deleteStudent = useCallback(async (id: string, classId: string) => {
    try {
      await pb.collection(COLLECTIONS.STUDENTS).delete(id)

      // Décrémenter le compteur de la classe si l'élève avait une classe
      if (classId) {
        await decrementClassStudents(classId)
      }

      setStudents((prev) => prev.filter((s) => s.id !== id))
      calculateNewRegistrations(students.filter(s => s.id !== id))

    } catch (err) {
      console.error('Erreur suppression:', err)
      throw err
    }
  }, [calculateNewRegistrations, students, decrementClassStudents])

  return {
    students,
    classes,
    isLoading,
    error,
    newRegistrations,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent
  }
}