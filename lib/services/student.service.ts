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
import { createEnrollment } from "@/lib/repositories/enrollment.repository";
import { findCurrentAcademicYear } from "@/lib/repositories/academic-year.repository";
import { findAllPayments } from "@/lib/repositories/payment.repository";
import { findAttendanceByStudent } from "@/lib/repositories/attendance.repository";

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
  return {
    id: String(c.id), name: c.name, level: c.level,
    capacity: c.capacity, totalFee: c.totalFee,
    teacherId: c.teacherId ? String(c.teacherId) : null,
    color: c.color, academicYear: c.academicYear, status: c.status,
    studentCount: c.students?.length ?? 0,
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
}) {
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
}>) {
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
  return mapStudent(updated);
}

export async function removeStudent(id: string) {
  const studentId = Number(id);

  const existing = await getStudentById(studentId);
  if (!existing) {
    throw new Error("Élève introuvable");
  }

  const payments = await findAllPayments({ studentId });
  if (payments.length > 0) {
    throw new Error("Impossible de supprimer cet élève : il a des paiements enregistrés");
  }

  const attendance = await findAttendanceByStudent(studentId);
  if (attendance.length > 0) {
    throw new Error("Impossible de supprimer cet élève : il a des présences enregistrées");
  }

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
}) {
  const created = await createClass(input);
  return mapClass(created);
}

export async function editClass(id: string, input: {
  name?: string; level?: number | null; capacity?: number | null;
  totalFee?: number | null; teacherId?: number | null; color?: string;
  academicYear?: string; status?: string;
}) {
  const updated = await updateClass(Number(id), input);
  return mapClass(updated);
}

export async function removeClass(id: string) {
  await deleteClass(Number(id));
}
