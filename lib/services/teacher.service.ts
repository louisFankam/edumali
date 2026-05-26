import {
  findAllTeachers, findTeacherById, createTeacher, updateTeacher, deleteTeacher, countTeachers, setTeacherSubjects,
  findTeacherAttendance, findTeacherAttendanceByDate, upsertTeacherAttendance,
  findAllPayroll, createPayroll, deletePayrollRecord,
  type NewTeacher,
} from "@/lib/repositories/teacher.repository";
import { findAllSubjects } from "@/lib/repositories/subject.repository";

function mapTeacher(t: any) {
  if (!t) return null;
  const specialityIds = t.subjects?.map((s: any) => String(s.subject?.id)).filter(Boolean) ?? [];
  const specialityNames = t.subjects?.map((s: any) => s.subject?.name).filter(Boolean) ?? [];
  return {
    id: String(t.id),
    first_name: t.firstName,
    last_name: t.lastName,
    full_name: `${t.firstName} ${t.lastName}`,
    email: t.email,
    phone: t.phone ?? "",
    address: t.address ?? "",
    hire_date: t.hireDate,
    salary: t.salary ?? 0,
    status: t.status,
    photo: t.photo ?? "",
    user_id: t.userId ? String(t.userId) : "",
    gender: t.gender,
    contrat: t.contrat,
    speciality: specialityIds,
    speciality_names: specialityNames,
    created: t.createdAt?.toISOString?.() ?? t.createdAt ?? "",
    updated: t.updatedAt?.toISOString?.() ?? t.updatedAt ?? "",
  };
}

function mapPayroll(p: any) {
  if (!p) return null;
  return {
    id: String(p.id),
    teacher_id: String(p.teacherId),
    first_name: p.teacher?.firstName ?? "",
    last_name: p.teacher?.lastName ?? "",
    month: p.month,
    year: p.year,
    amount: p.amount,
    bonus: p.bonus ?? 0,
    deductions: p.deductions ?? 0,
    paid_at: p.paidAt ?? "",
    notes: p.notes ?? "",
    teacher: p.teacher ? mapTeacher(p.teacher) : null,
  };
}

export async function getTeachers(filters?: {
  search?: string; status?: string; contrat?: string; page?: number; limit?: number;
}) {
  const rows = await findAllTeachers({
    search: filters?.search,
    status: filters?.status,
    contrat: filters?.contrat,
    page: filters?.page,
    limit: filters?.limit,
  });
  const total = await countTeachers({
    search: filters?.search,
    status: filters?.status,
    contrat: filters?.contrat,
  });
  return { data: rows.map(mapTeacher), total };
}

export async function getTeacherById(id: string) {
  const row = await findTeacherById(Number(id));
  return mapTeacher(row);
}

export async function addTeacher(input: {
  first_name: string; last_name: string; email: string; phone?: string;
  address?: string; gender: string; hire_date: string; salary?: number;
  contrat: string; status?: string; photo?: string; speciality?: string[];
}) {
  const data: NewTeacher = {
    firstName: input.first_name,
    lastName: input.last_name,
    email: input.email,
    phone: input.phone,
    address: input.address,
    gender: input.gender as "Masculin" | "Féminin",
    hireDate: input.hire_date,
    salary: input.salary ?? 0,
    contrat: input.contrat as "horaire" | "mensuel",
    status: (input.status as "active" | "inactive" | "on_leave") ?? "active",
    photo: input.photo,
  };
  const created = await createTeacher(data);

  if (input.speciality && input.speciality.length > 0) {
    await setTeacherSubjects(created.id, input.speciality.map(Number));
  }

  return mapTeacher(created);
}

export async function editTeacher(id: string, input: Partial<{
  first_name: string; last_name: string; email: string; phone: string;
  address: string; gender: string; hire_date: string; salary: number;
  contrat: string; status: string; photo: string; speciality: string[];
}>) {
  const data: any = {};
  if (input.first_name !== undefined) data.firstName = input.first_name;
  if (input.last_name !== undefined) data.lastName = input.last_name;
  if (input.email !== undefined) data.email = input.email;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.address !== undefined) data.address = input.address;
  if (input.gender !== undefined) data.gender = input.gender;
  if (input.hire_date !== undefined) data.hireDate = input.hire_date;
  if (input.salary !== undefined) data.salary = input.salary;
  if (input.contrat !== undefined) data.contrat = input.contrat;
  if (input.status !== undefined) data.status = input.status;
  if (input.photo !== undefined) data.photo = input.photo;

  const updated = await updateTeacher(Number(id), data);

  if (input.speciality !== undefined) {
    await setTeacherSubjects(Number(id), input.speciality.map(Number));
  }

  return mapTeacher(updated);
}

export async function removeTeacher(id: string) {
  await deleteTeacher(Number(id));
}

export async function getTeacherStats() {
  const all = await findAllTeachers();
  const total = all.length;
  const active = all.filter(t => t.status === "active").length;
  const inactive = all.filter(t => t.status === "inactive").length;
  const onLeave = all.filter(t => t.status === "on_leave").length;
  const male = all.filter(t => t.gender === "Masculin").length;
  const female = total - male;
  return {
    total,
    active,
    inactive,
    onLeave,
    male,
    female,
    malePercent: total > 0 ? Math.round((male / total) * 100) : 0,
    femalePercent: total > 0 ? Math.round((female / total) * 100) : 0,
    onLeavePercent: total > 0 ? Math.round((onLeave / total) * 100) : 0,
  };
}

export async function getTeacherAttendance(teacherId?: string, from?: string, to?: string) {
  const rows = await findTeacherAttendance(teacherId ? Number(teacherId) : undefined);
  let filtered = rows.map(a => ({
    id: String(a.id),
    teacher_id: String(a.teacherId),
    date: a.date,
    status: a.status,
    justification: a.justification ?? "",
    teacher: a.teacher ? mapTeacher(a.teacher) : null,
  }));
  if (from) filtered = filtered.filter(a => a.date >= from);
  if (to) filtered = filtered.filter(a => a.date <= to);
  return filtered;
}

export async function getTeacherAttendanceByDate(date: string) {
  const rows = await findTeacherAttendanceByDate(date);
  return rows.map(a => ({
    id: String(a.id),
    teacher_id: String(a.teacherId),
    date: a.date,
    status: a.status,
    justification: a.justification ?? "",
    teacher: a.teacher ? mapTeacher(a.teacher) : null,
  }));
}

export async function saveTeacherAttendance(records: { teacher_id: string; date: string; status: string; justification?: string }[]) {
  await upsertTeacherAttendance(
    records.map(r => ({
      teacherId: Number(r.teacher_id),
      date: r.date,
      status: r.status,
      justification: r.justification,
    }))
  );
}

export async function getPayroll(filters?: { teacherId?: string; month?: number; year?: number; from?: string; to?: string }) {
  const rows = await findAllPayroll({
    teacherId: filters?.teacherId ? Number(filters.teacherId) : undefined,
    month: filters?.month,
    year: filters?.year,
  });
  let result = rows.map(mapPayroll);
  if (filters?.from) {
    const from = filters.from.substring(0, 7);
    result = result.filter(r => `${r.year}-${String(r.month).padStart(2, "0")}` >= from);
  }
  if (filters?.to) {
    const to = filters.to.substring(0, 7);
    result = result.filter(r => `${r.year}-${String(r.month).padStart(2, "0")}` <= to);
  }
  return result;
}

export async function addPayroll(input: {
  teacher_id: string; month: number; year: number;
  amount: number; bonus?: number; deductions?: number; paid_at?: string; notes?: string;
}) {
  const created = await createPayroll({
    teacherId: Number(input.teacher_id),
    month: input.month,
    year: input.year,
    amount: input.amount,
    bonus: input.bonus,
    deductions: input.deductions,
    paidAt: input.paid_at,
    notes: input.notes,
  });
  return mapPayroll(created);
}

export async function updatePayroll(id: string, input: any) {
  const data: any = {};
  if (input.amount !== undefined) data.amount = input.amount;
  if (input.bonus !== undefined) data.bonus = input.bonus;
  if (input.deductions !== undefined) data.deductions = input.deductions;
  if (input.paid_at !== undefined) data.paidAt = input.paid_at;
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.month !== undefined) data.month = input.month;
  if (input.year !== undefined) data.year = input.year;
  await updatePayrollRecord(Number(id), data);
}

export async function removePayroll(id: string) {
  await deletePayrollRecord(Number(id));
}

export async function getSubjectsList() {
  const rows = await findAllSubjects();
  return rows.map(s => ({
    id: String(s.id),
    name: s.name,
    code: s.code ?? "",
  }));
}
