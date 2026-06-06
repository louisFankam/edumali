import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";

describe("Bootstrap - Aucune donnée de démo", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("ne devrait seed aucune classe", async () => {
    const { getClasses } = await import("@/lib/services/student.service");
    const classes = await getClasses();
    expect(classes.length).toBe(0);
  });

  it("ne devrait seed aucun élève", async () => {
    const { getStudents } = await import("@/lib/services/student.service");
    const result = await getStudents();
    expect(result.total).toBe(0);
  });

  it("ne devrait seed aucune matière", async () => {
    const { fetchSubjects } = await import("@/lib/services/settings.service");
    const subjects = await fetchSubjects();
    expect(subjects.length).toBe(0);
  });

  it("ne devrait seed aucun enseignant", async () => {
    const { findAllTeachers } = await import("@/lib/repositories/teacher.repository");
    const teachers = await findAllTeachers();
    expect(teachers.length).toBe(0);
  });

  it("ne devrait seed aucune année académique", async () => {
    const { fetchAcademicYears } = await import("@/lib/services/settings.service");
    const years = await fetchAcademicYears();
    expect(years.length).toBe(0);
  });

  it("ne devrait seed aucune info école", async () => {
    const { fetchSchoolInfo } = await import("@/lib/services/settings.service");
    const info = await fetchSchoolInfo();
    expect(info).toBeNull();
  });

  it("devrait créer uniquement l'utilisateur admin", async () => {
    const { countUsers } = await import("@/lib/repositories/user.repository");
    const count = await countUsers();
    expect(count).toBe(1);
  });
});
