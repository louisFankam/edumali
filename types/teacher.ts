export interface Teacher {
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
  gender: "Masculin" | "Féminin"
  contrat: "horaire" | "mensuel"
  speciality: string[]
  speciality_names: string[]
  created: string
  updated: string
}

export interface Subject {
  id: string
  name: string
}
