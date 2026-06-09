import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";

describe("Journal d'activité - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("A.1 getAuditLogs - liste vide initialement", async () => {
    const { getAuditLogs } = await import("@/lib/services/audit.service");
    const result = await getAuditLogs({});
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("A.2 logAudit écrit un log", async () => {
    const { logAudit, getAuditLogs } = await import("@/lib/services/audit.service");

    await logAudit({ tableName: "students", recordId: 1, action: "create", newValues: { firstName: "Test" } });

    const result = await getAuditLogs({});
    expect(result.total).toBe(1);
    expect(result.data[0].tableName).toBe("students");
    expect(result.data[0].action).toBe("create");
    expect(result.data[0].newValues).toEqual({ firstName: "Test" });
  });

  it("A.3 getAuditLogs filtre par tableName", async () => {
    const { logAudit, getAuditLogs } = await import("@/lib/services/audit.service");

    await logAudit({ tableName: "teachers", recordId: 1, action: "create" });
    await logAudit({ tableName: "classes", recordId: 1, action: "create" });

    const teachers = await getAuditLogs({ tableName: "teachers" });
    expect(teachers.total).toBe(1);
    expect(teachers.data[0].tableName).toBe("teachers");

    const classes = await getAuditLogs({ tableName: "classes" });
    expect(classes.total).toBe(1);
    expect(classes.data[0].tableName).toBe("classes");
  });

  it("A.4 getAuditLogs filtre par action", async () => {
    const { logAudit, getAuditLogs } = await import("@/lib/services/audit.service");

    await logAudit({ tableName: "students", recordId: 2, action: "update", oldValues: { name: "Old" }, newValues: { name: "New" } });

    const updates = await getAuditLogs({ action: "update" });
    expect(updates.total).toBeGreaterThanOrEqual(1);
    expect(updates.data.every(e => e.action === "update")).toBe(true);

    const creates = await getAuditLogs({ action: "create" });
    expect(creates.total).toBeGreaterThanOrEqual(1);
    expect(creates.data.every(e => e.action === "create")).toBe(true);
  });

  it("A.5 getAuditLogs pagination", async () => {
    const { getAuditLogs } = await import("@/lib/services/audit.service");

    const page1 = await getAuditLogs({ page: 1, limit: 2 });
    expect(page1.data.length).toBeLessThanOrEqual(2);

    const page2 = await getAuditLogs({ page: 2, limit: 2 });
    expect(page2.data.length).toBeLessThanOrEqual(2);
  });

  it("A.6 getAuditLogs ordre DESC (plus récent en premier)", async () => {
    const { logAudit, getAuditLogs } = await import("@/lib/services/audit.service");

    await logAudit({ tableName: "test", recordId: 99, action: "create" });
    await logAudit({ tableName: "test", recordId: 100, action: "create" });

    const result = await getAuditLogs({ tableName: "test" });
    expect(result.data.length).toBeGreaterThanOrEqual(2);
    // The most recent entries should be first (DESC order)
    expect(new Date(result.data[0].createdAt).getTime()).toBeGreaterThanOrEqual(new Date(result.data[1].createdAt).getTime());
  });

  it("A.7 logAudit stocke oldValues et newValues JSON", async () => {
    const { logAudit, getAuditLogs } = await import("@/lib/services/audit.service");

    const oldVals = { name: "Before", amount: 100 };
    const newVals = { name: "After", amount: 200 };

    await logAudit({ tableName: "expenses", recordId: 5, action: "update", oldValues: oldVals, newValues: newVals });

    const result = await getAuditLogs({ tableName: "expenses" });
    expect(result.total).toBeGreaterThanOrEqual(1);
    const log = result.data.find(e => e.recordId === 5);
    expect(log).toBeDefined();
    expect(log!.oldValues).toEqual(oldVals);
    expect(log!.newValues).toEqual(newVals);
  });

  it("A.8 getAuditLogs accepte userId optionnel", async () => {
    const { logAudit, getAuditLogs } = await import("@/lib/services/audit.service");

    await logAudit({ tableName: "payments", recordId: 10, action: "create", userId: 42 });

    const result = await getAuditLogs({ userId: 42 });
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.data.every(e => e.userId === 42)).toBe(true);
  });
});
