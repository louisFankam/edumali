import {
  findAllStudents,
  findStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  countStudents,
  type NewStudent,
} from "@/lib/repositories/student.repository";
import { findAllClasses, findClassById, createClass } from "@/lib/repositories/class.repository";

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
  };
}

function mapClass(c: any) {
  if (!c) return null;
  return { id: String(c.id), name: c.name, level: c.level };
}

export async function getStudents(filters?: { search?: string; classId?: string }) {
  const rows = await findAllStudents({
    search: filters?.search,
    classId: filters?.classId ? Number(filters.classId) : undefined,
  });
  return rows.map(mapStudent);
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
  };
  const created = await createStudent(data);
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
  const updated = await updateStudent(Number(id), data);
  return mapStudent(updated);
}

export async function removeStudent(id: string) {
  await deleteStudent(Number(id));
}

export async function getStudentStats() {
  const allStudents = await findAllStudents();
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

export async function addClass(input: { name: string; level?: number }) {
  const created = await createClass(input);
  return mapClass(created);
}
