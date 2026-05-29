import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { HelpButton } from "@/components/help-button"
import { ImportStudents } from "@/components/import-students"

export default function ImportStudentsPage() {
  return (
    <AppLayout>
      <PageHeader title="Importer des élèves" description="Importez en masse depuis un fichier CSV ou Excel">
        <HelpButton section="eleves" />
      </PageHeader>
      <ImportStudents />
    </AppLayout>
  )
}