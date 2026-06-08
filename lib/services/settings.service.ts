import { getSchoolInfo, upsertSchoolInfo } from "@/lib/repositories/school-info.repository";
import {
  findAllAcademicYears,
  findAcademicYearById,
  findCurrentAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} from "@/lib/repositories/academic-year.repository";
import {
  findAllSubjects,
  findSubjectById,
  findSubjectByIdWithTeachers,
  createSubject,
  updateSubject,
  deleteSubject,
  setSubjectTeachers,
} from "@/lib/repositories/subject.repository";

function mapSchoolInfo(s: any) {
  if (!s) return null;
  return {
    id: String(s.id),
    name: s.name,
    address: s.address ?? "",
    phone: s.phone ?? "",
    email: s.email ?? "",
    website: s.website ?? "",
    director: s.director ?? "",
    logoUrl: s.logoUrl ?? "",
    foundedYear: s.foundedYear,
  };
}

function mapAcademicYear(y: any) {
  if (!y) return null;
  return {
    id: String(y.id),
    name: y.name,
    startDate: y.startDate,
    endDate: y.endDate,
    isCurrent: y.isCurrent,
  };
}

function mapSubject(s: any) {
  if (!s) return null;
  return {
    id: String(s.id),
    name: s.name,
    code: s.code ?? "",
    coefficient: s.coefficient ?? 1,
    hoursPerWeek: s.hoursPerWeek ?? s.hours_per_week ?? 0,
    description: s.description ?? "",
    color: s.color ?? "#6366f1",
    status: s.status,
    teacherNumber: s.teacher_number ?? 0,
  };
}

export async function fetchSchoolInfo() {
  const row = await getSchoolInfo();
  return mapSchoolInfo(row);
}

export async function saveSchoolInfo(input: any) {
  const row = await upsertSchoolInfo(input);
  return mapSchoolInfo(row);
}

export async function fetchAcademicYears() {
  const rows = await findAllAcademicYears();
  return rows.map(mapAcademicYear);
}

export async function fetchAcademicYear(id: string) {
  const row = await findAcademicYearById(Number(id));
  return mapAcademicYear(row);
}

export async function fetchCurrentAcademicYear() {
  const row = await findCurrentAcademicYear();
  return mapAcademicYear(row);
}

export async function addAcademicYear(input: {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}) {
  const row = await createAcademicYear(input);
  return mapAcademicYear(row);
}

export async function editAcademicYear(id: string, input: any) {
  const row = await updateAcademicYear(Number(id), input);
  return mapAcademicYear(row);
}

export async function removeAcademicYear(id: string) {
  await deleteAcademicYear(Number(id));
}

export async function fetchSubjects() {
  const rows = await findAllSubjects();
  return rows.map(mapSubject);
}

export async function fetchSubject(id: string) {
  const row = await findSubjectById(Number(id));
  return mapSubject(row);
}

export async function fetchSubjectWithTeachers(id: string) {
  return await findSubjectByIdWithTeachers(Number(id));
}

export async function addSubject(input: {
  name: string;
  code?: string;
  coefficient?: number;
  hoursPerWeek?: number;
  description?: string;
  color?: string;
  status?: string;
  teacherIds?: string[];
}) {
  const { teacherIds, ...subjectInput } = input;
  const row = await createSubject(subjectInput);
  if (teacherIds && teacherIds.length > 0) {
    await setSubjectTeachers(Number(row.id), teacherIds.map(Number));
  }
  return mapSubject(row);
}

export async function editSubject(id: string, input: any) {
  const { teacherIds, ...subjectInput } = input;
  const row = await updateSubject(Number(id), subjectInput);
  if (teacherIds !== undefined) {
    await setSubjectTeachers(Number(id), teacherIds.map(Number));
  }
  return mapSubject(row);
}

export async function removeSubject(id: string) {
  await deleteSubject(Number(id));
}

export async function updateSubjectTeachers(subjectId: string, teacherIds: string[]) {
  await setSubjectTeachers(Number(subjectId), teacherIds.map(Number));
}
