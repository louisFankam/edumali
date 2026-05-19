import { StudentsClient } from "./students-client"

export const metadata = {
  title: "Gestion des Élèves | EduMali",
}

export default async function StudentsPage() {
  return <StudentsClient />
}
