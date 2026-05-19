export type Gender = "Masculin" | "Féminin"

export interface Student {
  id: string
  firstName: string
  lastName: string
  gender: Gender
  birthDate: string
  nationality?: string
  photo?: string
  parentName: string
  parentPhone: string
  classId: string
  className: string
  registrationDate: string
  status: "Actif" | "Inactif"
}

export interface Class {
  id: string
  name: string
}
