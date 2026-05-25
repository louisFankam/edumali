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
  createSubject,
  updateSubject,
  deleteSubject,
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
    hoursPerWeek: s.hoursPerWeek ?? 0,
    description: s.description ?? "",
    color: s.color ?? "#6366f1",
    status: s.status,
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

export async function addSubject(input: {
  name: string;
  code?: string;
  coefficient?: number;
  hoursPerWeek?: number;
  description?: string;
  color?: string;
  status?: string;
}) {
  const row = await createSubject(input);
  return mapSubject(row);
}

export async function editSubject(id: string, input: any) {
  const row = await updateSubject(Number(id), input);
  return mapSubject(row);
}

export async function removeSubject(id: string) {
  await deleteSubject(Number(id));
}
