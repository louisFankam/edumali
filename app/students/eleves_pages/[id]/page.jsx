"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EditStudentProfileModal } from "@/components/students/edit-student-profile-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  User, Users, Heart, GraduationCap, FileText,
  Phone, MapPin, Calendar, Edit, Download, Mail, Loader2, PlusCircle, Trash2, Pencil,
} from "lucide-react"
import { useStudent } from "@/hooks/use-students"
import { usePayments, useFeeTypes } from "@/hooks/use-payments"
import { useClasses } from "@/hooks/use-classes"
import { useMedicalInfo } from "@/hooks/use-medical-info"
import { useFamilyInfo } from "@/hooks/use-family-info"
import { useAcademicHistory } from "@/hooks/use-academic-history"
import { useStudentGrades } from "@/hooks/use-student-grades"
import { useAcademicYears, useSchoolInfo } from "@/hooks/use-settings"
import { useEnrollments } from "@/hooks/use-enrollments"
import { format } from "date-fns"
import { toast } from "sonner"
import { ReceiptModal } from "@/components/invoice/receipt-modal"

export default function StudentProfilePage() {
  const params = useParams()
  const id = params?.id
  const { student, isLoading, refetch: refetchStudent } = useStudent(id)
  const { currentYear } = useAcademicYears()
  const { enrollments } = useEnrollments(
    id && currentYear ? { studentId: id, academicYearId: currentYear.id } : undefined
  )
  const enrollmentFrom = useMemo(() => {
    if (enrollments.length === 0) return undefined
    return [...enrollments].sort((a, b) => a.enrollmentDate.localeCompare(b.enrollmentDate))[0].enrollmentDate
  }, [enrollments])
  const { payments, create: createPayment, refetch: refetchPayments } = usePayments(
    id ? { studentId: id, from: enrollmentFrom } : undefined
  )
  const { feeTypes } = useFeeTypes()
  const { classes } = useClasses()
  const { schoolInfo } = useSchoolInfo()
  const { data: medicalData, isLoading: medicalLoading, save: saveMedical } = useMedicalInfo(id)
  const { data: familyData, isLoading: familyLoading, save: saveFamily } = useFamilyInfo(id)
  const { records: academicRecords, isLoading: academicLoading, add: addAcademic, update: updateAcademic, remove: removeAcademic } = useAcademicHistory(id)
  const { data: gradesData, isLoading: gradesLoading, currentYearResults, annualAverage } = useStudentGrades(id)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [payAmount, setPayAmount] = useState("")
  const [payMethod, setPayMethod] = useState("espèces")
  const [payFeeType, setPayFeeType] = useState(undefined)

  // Receipt
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptPayment, setReceiptPayment] = useState(null)

  // Medical edit
  const [showMedDialog, setShowMedDialog] = useState(false)
  const [medForm, setMedForm] = useState({ bloodType: "", allergies: "", medicalConditions: "", medications: "", doctorName: "", doctorPhone: "", emergencyContact: "", emergencyPhone: "", vaccinationStatus: "" })

  // Family edit
  const [showFamDialog, setShowFamDialog] = useState(false)
  const [famForm, setFamForm] = useState({ fatherName: "", fatherPhone: "", fatherProfession: "", motherName: "", motherPhone: "", motherProfession: "", guardianName: "", guardianRelation: "", guardianPhone: "" })

  // Academic add/edit
  const [showAcadDialog, setShowAcadDialog] = useState(false)
  const [editAcadId, setEditAcadId] = useState(null)
  const [acadForm, setAcadForm] = useState({ schoolName: "", className: "", academicYear: "", reason: "", remarks: "" })

  const classFee = useMemo(() => {
    if (!student) return 0
    const cls = classes.find(c => c.id === student.classId)
    return cls?.totalFee ?? 0
  }, [student, classes])

  const discountAmount = useMemo(() => {
    if (!student || !student.discountType) return 0
    if (student.discountType === "percentage") return classFee * student.discountValue / 100
    if (student.discountType === "fixed") return student.discountValue
    return 0
  }, [student, classFee])

  const supplementaryTotal = useMemo(() => {
    if (!student) return 0
    const cls = classes.find(c => c.id === student.classId)
    return cls?.feeTypes?.reduce((sum, ft) => sum + (ft.amount ?? ft.feeTypeAmount), 0) ?? 0
  }, [student, classes])

  const netFee = classFee + supplementaryTotal - discountAmount

  const totalPaid = useMemo(() => {
    if (!payments.length) return 0
    return payments.reduce((s, p) => s + (p.status === "payé" ? p.amount : 0), 0)
  }, [payments])

  const remaining = netFee - totalPaid

  const handleAddPayment = async () => {
    if (!student || !payAmount) return
    const amount = Number(payAmount)
    if (totalPaid + amount > netFee) {
      toast.error(`Le total payé (${(totalPaid + amount).toLocaleString()} FCFA) dépasserait le montant dû (${netFee.toLocaleString()} FCFA)`)
      return
    }
    try {
      const result = await createPayment({
        studentId: Number(student.id),
        feeTypeId: payFeeType ? Number(payFeeType) : undefined,
        amount,
        method: payMethod,
        date: format(new Date(), "yyyy-MM-dd"),
      })
      if (!result.ok) throw new Error(result.message || "Erreur lors du paiement")
      toast.success("Paiement enregistré")
      setPayAmount("")
      setShowAddPayment(false)
      refetchPayments()
      if (result.data) {
        setTimeout(() => {
          const cls = classes.find(c => c.id === student.classId)
          setReceiptPayment({
            payment: { ...result.data, feeTypeName: result.data.feeTypeName || payFeeType ? (feeTypes.find(ft => ft.id === payFeeType)?.name) || null : null },
            student: {
              firstName: student.firstName,
              lastName: student.lastName,
              parentName: student.parentName,
              parentPhone: student.parentPhone,
              className: cls?.name,
            },
          })
          setShowReceipt(true)
        }, 0)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors du paiement")
    }
  }

  const openMedEdit = () => {
    setMedForm({
      bloodType: medicalData?.bloodType || "",
      allergies: medicalData?.allergies || "",
      medicalConditions: medicalData?.medicalConditions || "",
      medications: medicalData?.medications || "",
      doctorName: medicalData?.doctorName || "",
      doctorPhone: medicalData?.doctorPhone || "",
      emergencyContact: medicalData?.emergencyContact || "",
      emergencyPhone: medicalData?.emergencyPhone || "",
      vaccinationStatus: medicalData?.vaccinationStatus || "",
    })
    setShowMedDialog(true)
  }

  const handleSaveMedical = async () => {
    const result = await saveMedical(medForm)
    if (!result.ok) {
      toast.error(result.message || "Erreur lors de la sauvegarde des informations médicales")
      return
    }
    toast.success("Informations médicales mises à jour")
    setShowMedDialog(false)
  }

  const openFamEdit = () => {
    setFamForm({
      fatherName: familyData?.fatherName || "",
      fatherPhone: familyData?.fatherPhone || "",
      fatherProfession: familyData?.fatherProfession || "",
      motherName: familyData?.motherName || "",
      motherPhone: familyData?.motherPhone || "",
      motherProfession: familyData?.motherProfession || "",
      guardianName: familyData?.guardianName || "",
      guardianRelation: familyData?.guardianRelation || "",
      guardianPhone: familyData?.guardianPhone || "",
    })
    setShowFamDialog(true)
  }

  const handleSaveFamily = async () => {
    const result = await saveFamily(famForm)
    if (!result.ok) {
      toast.error(result.message || "Erreur lors de la sauvegarde des informations familiales")
      return
    }
    toast.success("Informations familiales mises à jour")
    setShowFamDialog(false)
  }

  const openAcadAdd = () => {
    setEditAcadId(null)
    setAcadForm({ schoolName: "", className: "", academicYear: "", reason: "", remarks: "" })
    setShowAcadDialog(true)
  }

  const openAcadEdit = (r) => {
    setEditAcadId(r.id)
    setAcadForm({ schoolName: r.schoolName, className: r.className, academicYear: r.academicYear, reason: r.reason, remarks: r.remarks })
    setShowAcadDialog(true)
  }

  const handleSaveAcad = async () => {
    let result
    if (editAcadId) {
      result = await updateAcademic(editAcadId, acadForm)
    } else {
      result = await addAcademic(acadForm)
    }
    if (!result.ok) {
      toast.error(result.message || "Erreur lors de la sauvegarde")
      return
    }
    toast.success("Historique scolaire mis à jour")
    setShowAcadDialog(false)
  }

  const studentIdStr = `EDM-${String(student?.id || "").padStart(4, "0")}`

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </AppLayout>
    )
  }

  if (!student) {
    return (
      <AppLayout>
        <Card><CardContent className="py-12 text-center text-muted-foreground">Élève non trouvé</CardContent></Card>
      </AppLayout>
    )
  }

  const fullName = `${student.firstName} ${student.lastName}`

  return (
    <AppLayout>
      <PageHeader title={`Profil de ${fullName}`} description={`Élève · ${student.className} · ${student.status}`}>
        <HelpButton section="eleves" />
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setIsEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg" alt={fullName} />
              <AvatarFallback className="text-lg">
                {student.firstName[0]}{student.lastName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-serif font-bold">{fullName}</h2>
                <p className="text-muted-foreground">{studentIdStr}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem icon={Calendar} label="Date naissance" value={student.birthDate} />
                <InfoItem icon={User} label="Genre" value={student.gender} />
                <InfoItem icon={GraduationCap} label="Classe" value={student.className} />
                <InfoItem icon={MapPin} label="Nationalité" value={student.nationality || "N/A"} />
              </div>
            </div>

            <Badge variant={student.status === "Actif" ? "default" : "secondary"} className="text-sm px-3 py-1">
              {student.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="family">Famille</TabsTrigger>
          <TabsTrigger value="medical">Médical</TabsTrigger>
          <TabsTrigger value="academic">Académique</TabsTrigger>
          <TabsTrigger value="financial">Financier</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>Informations Générales</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem icon={User} label="Prénom" value={student.firstName} />
              <InfoItem icon={User} label="Nom" value={student.lastName} />
              <InfoItem icon={Calendar} label="Date de naissance" value={student.birthDate} />
              <InfoItem icon={User} label="Genre" value={student.gender} />
              <InfoItem icon={Users} label="Nationalité" value={student.nationality || "N/A"} />
              <InfoItem icon={GraduationCap} label="Classe" value={student.className} />
              <InfoItem icon={Calendar} label="Date d'inscription" value={student.registrationDate} />
              <InfoItem icon={FileText} label="Statut" value={student.status} />
              <InfoItem icon={FileText} label="N° Étudiant" value={studentIdStr} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informations Familiales</CardTitle>
              <Button variant="outline" size="sm" onClick={openFamEdit}>
                <Pencil className="h-4 w-4 mr-1" />Modifier
              </Button>
            </CardHeader>
            <CardContent>
              {familyLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem icon={User} label="Père" value={familyData?.fatherName || "Non renseigné"} />
                  <InfoItem icon={Phone} label="Tél. père" value={familyData?.fatherPhone || "Non renseigné"} />
                  <InfoItem icon={User} label="Profession père" value={familyData?.fatherProfession || "Non renseigné"} />
                  <InfoItem icon={User} label="Mère" value={familyData?.motherName || "Non renseignée"} />
                  <InfoItem icon={Phone} label="Tél. mère" value={familyData?.motherPhone || "Non renseigné"} />
                  <InfoItem icon={User} label="Profession mère" value={familyData?.motherProfession || "Non renseigné"} />
                  <InfoItem icon={User} label="Tuteur" value={familyData?.guardianName || student.parentName} />
                  <InfoItem icon={Phone} label="Tél. tuteur" value={familyData?.guardianPhone || student.parentPhone} />
                  <InfoItem icon={FileText} label="Lien parenté" value={familyData?.guardianRelation || "Non renseigné"} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informations Médicales</CardTitle>
              <Button variant="outline" size="sm" onClick={openMedEdit}>
                <Pencil className="h-4 w-4 mr-1" />Modifier
              </Button>
            </CardHeader>
            <CardContent>
              {medicalLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : !medicalData ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucune information médicale</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={openMedEdit}>Ajouter</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem icon={Heart} label="Groupe sanguin" value={medicalData.bloodType || "Non renseigné"} />
                  <InfoItem icon={FileText} label="Allergies" value={medicalData.allergies || "Aucune"} />
                  <InfoItem icon={FileText} label="Conditions médicales" value={medicalData.medicalConditions || "Aucune"} />
                  <InfoItem icon={FileText} label="Médicaments" value={medicalData.medications || "Aucun"} />
                  <InfoItem icon={User} label="Médecin traitant" value={medicalData.doctorName || "Non renseigné"} />
                  <InfoItem icon={Phone} label="Tél. médecin" value={medicalData.doctorPhone || "Non renseigné"} />
                  <InfoItem icon={Phone} label="Contact urgence" value={medicalData.emergencyContact || "Non renseigné"} />
                  <InfoItem icon={FileText} label="Vaccination" value={medicalData.vaccinationStatus || "Non renseigné"} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">

          {gradesLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : currentYearResults.length > 0 ? (
            <>
              <Card>
                <CardHeader><CardTitle>Notes & Résultats — {currentYearResults[0]?.year || ""}</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {annualAverage !== null && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Moyenne annuelle</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{annualAverage.toFixed(2)} / 20</div></CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Statut annuel</CardTitle></CardHeader>
                        <CardContent>
                          <Badge variant="default" className={`text-sm px-3 py-1 ${annualAverage >= 10 ? "!bg-green-600 !text-white" : "!bg-destructive !text-white"}`}>
                            {annualAverage >= 10 ? "Admis" : "Redoublant"}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {currentYearResults.map((trimester) => (
                    <div key={`${trimester.trimester}-${trimester.year}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">Trimestre {trimester.trimester}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">Moyenne : <strong>{trimester.average}</strong></span>
                          <Badge variant={trimester.status === "Admis" ? "default" : "destructive"} className={`text-sm px-3 py-1 ${trimester.status === "Admis" ? "!bg-green-600 !text-white" : ""}`}>
                            {trimester.status}
                          </Badge>
                        </div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Matière</TableHead>
                            <TableHead className="text-center">Coeff</TableHead>
                            <TableHead className="text-center">Notes Devoirs</TableHead>
                            <TableHead className="text-center">Note Trimestrielle</TableHead>
                            <TableHead className="text-center">Moyenne Finale</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trimester.subjects.map((subj, i) => (
                            <TableRow key={subj.name + i}>
                              <TableCell className="font-medium">{subj.name}</TableCell>
                              <TableCell className="text-center">{subj.coefficient}</TableCell>
                              <TableCell className="text-center">{subj.devoirScores?.length > 0 ? subj.devoirScores.join(", ") : "—"}</TableCell>
                              <TableCell className="text-center">{subj.trimestrielleScore !== null && subj.trimestrielleScore !== undefined ? `${subj.trimestrielleScore}/20` : "—"}</TableCell>
                              <TableCell className="text-center font-semibold">{subj.grade}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader><CardTitle>Notes & Résultats</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucune note disponible pour cette année</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Historique scolaire</CardTitle>
              <Button size="sm" onClick={openAcadAdd}>
                <PlusCircle className="h-4 w-4 mr-1" />Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              {academicLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : academicRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucun historique scolaire</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={openAcadAdd}>Ajouter une école</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {academicRecords.map(r => (
                    <div key={r.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{r.schoolName}</p>
                        <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4">
                          {r.className && <span>Classe : {r.className}</span>}
                          {r.academicYear && <span>Année : {r.academicYear}</span>}
                          {r.reason && <span>Motif : {r.reason}</span>}
                        </div>
                        {r.remarks && <p className="text-sm text-muted-foreground mt-1">{r.remarks}</p>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => openAcadEdit(r)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => { if (confirm("Supprimer ?")) await removeAcademic(r.id) }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Frais de base</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{classFee.toLocaleString()} FCFA</div></CardContent>
            </Card>
            {discountAmount > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Réduction</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-orange-500">-{discountAmount.toLocaleString()} FCFA</div></CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Net à payer</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{netFee.toLocaleString()} FCFA</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Déjà Payé</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString()} FCFA</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Reste à Payer</CardTitle></CardHeader>
              <CardContent><div className={`text-2xl font-bold ${Math.max(0, remaining) > 0 ? "text-red-600" : "text-green-600"}`}>{Math.max(0, remaining).toLocaleString()} FCFA</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Historique des paiements</CardTitle>
              <Button size="sm" onClick={() => setShowAddPayment(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />Nouveau Paiement
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Facture</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun paiement</TableCell></TableRow>
                    ) : (
                      payments.map(p => (
                        <TableRow key={p.id}>
                          <TableCell>{p.date}</TableCell>
                          <TableCell className="font-bold">{p.amount.toLocaleString()} FCFA</TableCell>
                          <TableCell>{p.method}</TableCell>
                          <TableCell>{p.feeTypeName || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setReceiptPayment({
                                payment: { ...p, feeTypeName: p.feeTypeName || null },
                                student: {
                                  firstName: student?.firstName || "",
                                  lastName: student?.lastName || "",
                                  parentName: student?.parentName,
                                  parentPhone: student?.parentPhone,
                                  className: student ? (classes.find(c => c.id === student.classId)?.name) : "",
                                },
                              })
                              setShowReceipt(true)
                            }}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouveau Paiement</DialogTitle></DialogHeader>
              {student && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{fullName}</p>
                  <div><Label>Montant (FCFA)</Label><Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="50000" /></div>
                  <div><Label>Type de frais</Label>
                    <Select value={payFeeType} onValueChange={setPayFeeType}>
                      <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                      <SelectContent>
                        {feeTypes.map(ft => <SelectItem key={ft.id} value={ft.id}>{ft.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Mode</Label>
                    <Select value={payMethod} onValueChange={setPayMethod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="espèces">Espèces</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="virement">Virement</SelectItem>
                        <SelectItem value="chèque">Chèque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddPayment} className="w-full" disabled={!payAmount}>Enregistrer</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* Medical edit dialog */}
      <Dialog open={showMedDialog} onOpenChange={setShowMedDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Informations médicales</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Groupe sanguin</Label>
                <Select value={medForm.bloodType || undefined} onValueChange={v => setMedForm(f => ({ ...f, bloodType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Statut vaccination</Label>
                <Select value={medForm.vaccinationStatus || undefined} onValueChange={v => setMedForm(f => ({ ...f, vaccinationStatus: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="À jour">À jour</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Non vacciné">Non vacciné</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Allergies</Label><Input value={medForm.allergies} onChange={e => setMedForm(f => ({ ...f, allergies: e.target.value }))} placeholder="Aucune allergie connue" /></div>
            <div><Label>Conditions médicales</Label><Textarea value={medForm.medicalConditions} onChange={e => setMedForm(f => ({ ...f, medicalConditions: e.target.value }))} placeholder="Aucune condition particulière" /></div>
            <div><Label>Médicaments</Label><Textarea value={medForm.medications} onChange={e => setMedForm(f => ({ ...f, medications: e.target.value }))} placeholder="Aucun médicament" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Médecin traitant</Label><Input value={medForm.doctorName} onChange={e => setMedForm(f => ({ ...f, doctorName: e.target.value }))} /></div>
              <div><Label>Tél. médecin</Label><Input value={medForm.doctorPhone} onChange={e => setMedForm(f => ({ ...f, doctorPhone: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Contact urgence</Label><Input value={medForm.emergencyContact} onChange={e => setMedForm(f => ({ ...f, emergencyContact: e.target.value }))} /></div>
              <div><Label>Tél. urgence</Label><Input value={medForm.emergencyPhone} onChange={e => setMedForm(f => ({ ...f, emergencyPhone: e.target.value }))} /></div>
            </div>
            <Button onClick={handleSaveMedical} className="w-full">Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Family edit dialog */}
      <Dialog open={showFamDialog} onOpenChange={setShowFamDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Informations familiales</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <Label className="text-sm font-semibold text-muted-foreground">Père</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div className="col-span-1"><Input value={famForm.fatherName} onChange={e => setFamForm(f => ({ ...f, fatherName: e.target.value }))} placeholder="Nom" /></div>
                <div><Input value={famForm.fatherPhone} onChange={e => setFamForm(f => ({ ...f, fatherPhone: e.target.value }))} placeholder="Téléphone" /></div>
                <div><Input value={famForm.fatherProfession} onChange={e => setFamForm(f => ({ ...f, fatherProfession: e.target.value }))} placeholder="Profession" /></div>
              </div>
            </div>
            <div className="border-b pb-3">
              <Label className="text-sm font-semibold text-muted-foreground">Mère</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div><Input value={famForm.motherName} onChange={e => setFamForm(f => ({ ...f, motherName: e.target.value }))} placeholder="Nom" /></div>
                <div><Input value={famForm.motherPhone} onChange={e => setFamForm(f => ({ ...f, motherPhone: e.target.value }))} placeholder="Téléphone" /></div>
                <div><Input value={famForm.motherProfession} onChange={e => setFamForm(f => ({ ...f, motherProfession: e.target.value }))} placeholder="Profession" /></div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold text-muted-foreground">Tuteur (si différent)</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div><Input value={famForm.guardianName} onChange={e => setFamForm(f => ({ ...f, guardianName: e.target.value }))} placeholder="Nom" /></div>
                <div><Input value={famForm.guardianPhone} onChange={e => setFamForm(f => ({ ...f, guardianPhone: e.target.value }))} placeholder="Téléphone" /></div>
                <div><Input value={famForm.guardianRelation} onChange={e => setFamForm(f => ({ ...f, guardianRelation: e.target.value }))} placeholder="Lien parenté" /></div>
              </div>
            </div>
            <Button onClick={handleSaveFamily} className="w-full">Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Academic add/edit dialog */}
      <Dialog open={showAcadDialog} onOpenChange={setShowAcadDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editAcadId ? "Modifier" : "Ajouter"} un établissement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nom de l'école *</Label><Input value={acadForm.schoolName} onChange={e => setAcadForm(f => ({ ...f, schoolName: e.target.value }))} placeholder="École primaire de ..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Classe</Label><Input value={acadForm.className} onChange={e => setAcadForm(f => ({ ...f, className: e.target.value }))} placeholder="CM2" /></div>
              <div><Label>Année scolaire</Label><Input value={acadForm.academicYear} onChange={e => setAcadForm(f => ({ ...f, academicYear: e.target.value }))} placeholder="2023-2024" /></div>
            </div>
            <div><Label>Motif de départ</Label><Input value={acadForm.reason} onChange={e => setAcadForm(f => ({ ...f, reason: e.target.value }))} placeholder="Mutation, changement d'école..." /></div>
            <div><Label>Remarques</Label><Textarea value={acadForm.remarks} onChange={e => setAcadForm(f => ({ ...f, remarks: e.target.value }))} /></div>
            <Button onClick={handleSaveAcad} className="w-full" disabled={!acadForm.schoolName}>Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>

      <EditStudentProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} student={{ ...student, fullName }} onEdit={refetchStudent} />

      {/* Receipt modal */}
      {receiptPayment && (
        <ReceiptModal
          open={showReceipt}
          onOpenChange={setShowReceipt}
          data={{
            payment: receiptPayment.payment,
            student: receiptPayment.student,
            schoolInfo: schoolInfo || { name: "", address: "", phone: "", email: "", logoUrl: "", director: "" },
            receiptNumber: `FACT-${String(receiptPayment.payment.id).padStart(3, "0")}-${receiptPayment.payment.date ? receiptPayment.payment.date.replace(/-/g, "").slice(2) : ""}`,
          }}
        />
      )}
    </AppLayout>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  )
}
