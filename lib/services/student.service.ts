import {
  findAllStudents,
  findStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  countStudents,
  type NewStudent,
} from "@/lib/repositories/student.repository";
import { findAllClasses, findClassById, createClass, updateClass, deleteClass } from "@/lib/repositories/class.repository";
import { findAllEnrollments, createEnrollment, updateEnrollment } from "@/lib/repositories/enrollment.repository";
import { findCurrentAcademicYear } from "@/lib/repositories/academic-year.repository";
import { findAllPayments } from "@/lib/repositories/payment.repository";
import { findAttendanceByStudent } from "@/lib/repositories/attendance.repository";
import { findGradesByEvaluation } from "@/lib/repositories/grade.repository";
import { findAllClassFeeTypes } from "@/lib/repositories/class-fee-type.repository";
import { db } from "@/lib/db";
import { medicalInfos, familyInfos, academicHistories, evaluations, schedules, exams, classSubjects, attendance, grades, students as studentsTable, enrollments as enrollmentsTable } from "@/lib/models/schema";
import { eq, and, inArray } from "drizzle-orm";
import { logAudit } from "@/lib/services/audit.service";
import type { ClassFeeTypeData } from "@/lib/services/class-fee-type.service";

function mapStudent(s: any) {
  if (!s) return null;
  return {
    id: String(s.id),
    firstName: s.firstName,
    lastName: s.lastName,
    gender: s.gender,
    birthDate: s.birthDate,
    nationality: s.nationality ?? "",
    photo: s.photo,
    parentName: s.parentName,
    parentPhone: s.parentPhone,
    classId: String(s.classId),
    className: s.class?.name ?? "",
    registrationDate: s.registrationDate,
    status: s.status,
    discountType: s.discountType ?? null,
    discountValue: s.discountValue ?? null,
    discountReason: s.discountReason ?? null,
  };
}

function mapClass(c: any) {
  if (!c) return null;
  const feeTypes: ClassFeeTypeData[] = (c.classFeeTypes ?? []).map((cft: any) => ({
    id: String(cft.id),
    feeTypeId: String(cft.feeTypeId),
    feeTypeName: cft.feeType?.name ?? "",
    feeTypeAmount: cft.feeType?.amount ?? 0,
    feeTypePeriod: cft.feeType?.period ?? "",
    amount: cft.amount ?? null,
  }));
  return {
    id: String(c.id), name: c.name, level: c.level,
    capacity: c.capacity, totalFee: c.totalFee,
    teacherId: c.teacherId ? String(c.teacherId) : null,
    color: c.color, academicYear: c.academicYear, status: c.status,
    studentCount: c.students?.length ?? 0,
    feeTypes,
  };
}

export async function getStudents(filters?: { search?: string; classId?: string; academicYearId?: string; page?: number; limit?: number }) {
  const rows = await findAllStudents({
    search: filters?.search,
    classId: filters?.classId ? Number(filters.classId) : undefined,
    academicYearId: filters?.academicYearId ? Number(filters.academicYearId) : undefined,
    page: filters?.page,
    limit: filters?.limit,
  });
  const total = await countStudents({
    search: filters?.search,
    classId: filters?.classId ? Number(filters.classId) : undefined,
    academicYearId: filters?.academicYearId ? Number(filters.academicYearId) : undefined,
  });
  return { data: rows.map(mapStudent), total };
}

export async function getStudentById(id: string) {
  const row = await findStudentById(Number(id));
  return mapStudent(row);
}

export async function addStudent(input: {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  nationality?: string;
  photo?: string;
  parentName: string;
  parentPhone: string;
  address?: string;
  classId: string;
  status?: string;
  discountType?: string | null;
  discountValue?: number | null;
  discountReason?: string | null;
}, userId?: number) {
  const data: NewStudent = {
    firstName: input.firstName,
    lastName: input.lastName,
    gender: input.gender as "Masculin" | "Féminin",
    birthDate: input.birthDate,
    nationality: input.nationality,
    photo: input.photo,
    parentName: input.parentName,
    parentPhone: input.parentPhone,
    address: input.address,
    classId: Number(input.classId),
    registrationDate: new Date().toISOString().split("T")[0],
    status: (input.status as "Actif" | "Inactif") ?? "Actif",
    discountType: input.discountType as "percentage" | "fixed" | null ?? null,
    discountValue: input.discountValue ?? null,
    discountReason: input.discountReason ?? null,
  };
  const created = await createStudent(data);

  // Create enrollment for current academic year
  const currentYear = await findCurrentAcademicYear();
  if (currentYear) {
    await createEnrollment({
      studentId: created.id,
      classId: Number(input.classId),
      academicYearId: currentYear.id,
      enrollmentDate: created.registrationDate,
      status: "inscrit",
    });
  }

  logAudit({ tableName: "students", recordId: created.id, action: "create", userId, newValues: input as any });
  return mapStudent(created);
}

export async function editStudent(id: string, input: Partial<{
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  nationality: string;
  photo: string;
  parentName: string;
  parentPhone: string;
  address: string;
  classId: string;
  status: string;
  discountType: string | null;
  discountValue: number | null;
  discountReason: string | null;
}>, userId?: number) {
  const old = await findStudentById(Number(id));
  const data: any = {};
  if (input.firstName !== undefined) data.firstName = input.firstName;
  if (input.lastName !== undefined) data.lastName = input.lastName;
  if (input.gender !== undefined) data.gender = input.gender;
  if (input.birthDate !== undefined) data.birthDate = input.birthDate;
  if (input.nationality !== undefined) data.nationality = input.nationality;
  if (input.photo !== undefined) data.photo = input.photo;
  if (input.parentName !== undefined) data.parentName = input.parentName;
  if (input.parentPhone !== undefined) data.parentPhone = input.parentPhone;
  if (input.address !== undefined) data.address = input.address;
  if (input.classId !== undefined) data.classId = Number(input.classId);
  if (input.status !== undefined) data.status = input.status;
  if (input.discountType !== undefined) data.discountType = input.discountType;
  if (input.discountValue !== undefined) data.discountValue = input.discountValue;
  if (input.discountReason !== undefined) data.discountReason = input.discountReason;
  const updated = await updateStudent(Number(id), data);
  logAudit({ tableName: "students", recordId: Number(id), action: "update", userId, oldValues: old ?? undefined, newValues: input as any });

  // If classId changed, create an enrollment for current year if none exists (never overwrite)
  if (input.classId !== undefined) {
    const currentYear = await findCurrentAcademicYear();
    if (currentYear) {
      const existing = await findAllEnrollments({ studentId: Number(id), academicYearId: currentYear.id });
      if (existing.length === 0) {
        await createEnrollment({
          studentId: Number(id),
          classId: Number(input.classId),
          academicYearId: currentYear.id,
          enrollmentDate: new Date().toISOString().split("T")[0],
          status: "inscrit",
        });
      }
    }
  }

  return mapStudent(updated);
}

export async function removeStudent(id: string, userId?: number) {
  const studentId = Number(id);

  const existing = await findStudentById(Number(id));
  if (!existing) {
    throw new Error("Élève introuvable");
  }

  const payments = await findAllPayments({ studentId });
  if (payments.length > 0) {
    throw new Error("Impossible de supprimer cet élève : il a des paiements enregistrés");
  }

  const att = await findAttendanceByStudent(studentId);
  if (att && att.length > 0) {
    throw new Error("Impossible de supprimer cet élève : il a des présences enregistrées");
  }

  // Check other related tables before deletion
  const enrolls = await findAllEnrollments({ studentId });
  if (enrolls.length > 0) {
    throw new Error("Impossible de supprimer cet élève : il a des inscriptions");
  }

  const gr = db.select({ id: grades.id }).from(grades).where(eq(grades.studentId, studentId)).all();
  if (gr.length > 0) {
    throw new Error("Impossible de supprimer cet élève : il a des notes");
  }

  const med = db.select({ id: medicalInfos.id }).from(medicalInfos).where(eq(medicalInfos.studentId, studentId)).all();
  if (med.length > 0) {
    throw new Error("Impossible de supprimer cet élève : il a des informations médicales");
  }

  const fam = db.select({ id: familyInfos.id }).from(familyInfos).where(eq(familyInfos.studentId, studentId)).all();
  if (fam.length > 0) {
    throw new Error("Impossible de supprimer cet élève : il a des informations familiales");
  }

  const hist = db.select({ id: academicHistories.id }).from(academicHistories).where(eq(academicHistories.studentId, studentId)).all();
  if (hist.length > 0) {
    throw new Error("Impossible de supprimer cet élève : il a un historique scolaire");
  }

  logAudit({ tableName: "students", recordId: studentId, action: "delete", userId, oldValues: existing as any });
  await deleteStudent(studentId);
}

export async function getStudentStats(academicYearId?: string) {
  const allStudents = await findAllStudents({
    academicYearId: academicYearId ? Number(academicYearId) : undefined,
  });
  const total = allStudents.length;
  const girlsCount = allStudents.filter(s => s.gender === "Féminin").length;
  const boysCount = total - girlsCount;
  return {
    total,
    girls: girlsCount,
    boys: boysCount,
    girlsPercentage: total > 0 ? Math.round((girlsCount / total) * 100) : 0,
    boysPercentage: total > 0 ? Math.round((boysCount / total) * 100) : 0,
  };
}

export async function getClasses() {
  const rows = await findAllClasses();
  return rows.map(mapClass);
}

export async function addClass(input: {
  name: string; level?: number | null; capacity?: number | null;
  totalFee?: number | null; teacherId?: number | null; color?: string;
  academicYear?: string; status?: string;
  feeTypeItems?: { feeTypeId: number; amount: number | null }[];
}, userId?: number) {
  const created = await createClass(input);
  if (input.feeTypeItems && input.feeTypeItems.length > 0) {
    const { setClassFeeTypes } = await import("@/lib/repositories/class-fee-type.repository");
    await setClassFeeTypes(created.id, input.feeTypeItems.map(item => ({
      feeTypeId: item.feeTypeId,
      amount: item.amount,
    })));
  }
  logAudit({ tableName: "classes", recordId: created.id, action: "create", userId, newValues: input as any });
  return mapClass(created);
}

export async function editClass(id: string, input: {
  name?: string; level?: number | null; capacity?: number | null;
  totalFee?: number | null; teacherId?: number | null; color?: string;
  academicYear?: string; status?: string;
  feeTypeItems?: { feeTypeId: number; amount: number | null }[];
}, userId?: number) {
  const old = await findClassById(Number(id));
  const updated = await updateClass(Number(id), input);
  if (input.feeTypeItems !== undefined) {
    const { setClassFeeTypes } = await import("@/lib/repositories/class-fee-type.repository");
    await setClassFeeTypes(Number(id), input.feeTypeItems.map(item => ({
      feeTypeId: item.feeTypeId,
      amount: item.amount,
    })));
  }
  logAudit({ tableName: "classes", recordId: Number(id), action: "update", userId, oldValues: old ?? undefined, newValues: input as any });
  return mapClass(updated);
}

export async function removeClass(id: string, userId?: number) {
  const classId = Number(id);
  const oldClass = await findClassById(classId);

  const studentsInClass = db.select({ id: studentsTable.id }).from(studentsTable).where(eq(studentsTable.classId, classId)).all();
  if (studentsInClass.length > 0) {
    throw new Error("Impossible de supprimer cette classe : elle contient des élèves");
  }

  const evalsInClass = db.select({ id: evaluations.id }).from(evaluations).where(eq(evaluations.classId, classId)).all();
  if (evalsInClass.length > 0) {
    throw new Error("Impossible de supprimer cette classe : elle a des évaluations");
  }

  const scheds = db.select({ id: schedules.id }).from(schedules).where(eq(schedules.classId, classId)).all();
  if (scheds.length > 0) {
    throw new Error("Impossible de supprimer cette classe : elle a des emplois du temps");
  }

  const enrolls = db.select({ id: enrollmentsTable.id }).from(enrollmentsTable).where(eq(enrollmentsTable.classId, classId)).all();
  if (enrolls.length > 0) {
    throw new Error("Impossible de supprimer cette classe : elle a des inscriptions");
  }

  const subjAssigns = db.select({ id: classSubjects.id }).from(classSubjects).where(eq(classSubjects.classId, classId)).all();
  if (subjAssigns.length > 0) {
    throw new Error("Impossible de supprimer cette classe : elle a des matières assignées");
  }

  const attRows = db.select({ id: attendance.id }).from(attendance).where(eq(attendance.classId, classId)).all();
  if (attRows.length > 0) {
    throw new Error("Impossible de supprimer cette classe : elle a des présences enregistrées");
  }

  const examRows = db.select({ id: exams.id }).from(exams).where(eq(exams.classId, classId)).all();
  if (examRows.length > 0) {
    throw new Error("Impossible de supprimer cette classe : elle a des examens");
  }

  const { deleteClassFeeTypesByClass } = await import("@/lib/repositories/class-fee-type.repository");
  await deleteClassFeeTypesByClass(classId);

  logAudit({ tableName: "classes", recordId: classId, action: "delete", userId, oldValues: oldClass ?? undefined });
  await deleteClass(classId);
}
