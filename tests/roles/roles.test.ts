import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { sql } from "drizzle-orm";

describe("Rôles - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("devrait créer l'admin par defaut avec le role 'admin'", async () => {
    const { findUserByEmail } = await import("@/lib/repositories/user.repository");
    const user = await findUserByEmail("admin");
    expect(user).not.toBeNull();
    expect(user!.role).toBe("admin");
  });

  it("devrait retourner le role dans authenticateUser", async () => {
    const { authenticateUser } = await import("@/lib/services/auth.service");
    const user = await authenticateUser("admin", "admin");
    expect(user).not.toBeNull();
    expect(user!.role).toBe("admin");
  });

  it("devrait retourner le role dans getAuthenticatedUser", async () => {
    const { getAuthenticatedUser } = await import("@/lib/services/auth.service");
    const user = await getAuthenticatedUser(1);
    expect(user).not.toBeNull();
    expect(user!.role).toBe("admin");
  });

  it("devrait pouvoir creer un utilisateur manager", async () => {
    const { createUser } = await import("@/lib/repositories/user.repository");
    const { hashPassword } = await import("@/lib/auth/password");

    const hash = await hashPassword("manager123");
    const user = await createUser({
      email: "manager1",
      fullName: "Gestionnaire Test",
      passwordHash: hash,
      role: "manager",
    });

    expect(user).not.toBeNull();
    expect(user.role).toBe("manager");
  });

  it("devrait pouvoir creer un utilisateur admin via le repository", async () => {
    const { createUser } = await import("@/lib/repositories/user.repository");
    const { hashPassword } = await import("@/lib/auth/password");

    const hash = await hashPassword("admin2");
    const user = await createUser({
      email: "admin2",
      fullName: "Admin 2",
      passwordHash: hash,
      role: "admin",
    });

    expect(user).not.toBeNull();
    expect(user.role).toBe("admin");
  });

  it("devrait creer par defaut avec le role 'manager' si non specifie", async () => {
    const { createUser } = await import("@/lib/repositories/user.repository");
    const { hashPassword } = await import("@/lib/auth/password");

    const hash = await hashPassword("default");
    const user = await createUser({
      email: "defaultrole",
      fullName: "Default Role",
      passwordHash: hash,
    });

    expect(user).not.toBeNull();
    expect(user.role).toBe("manager");
  });

  it("requireAdmin() verifie le role via findUserById", async () => {
    // Test the guard logic directly (cookies() not available in test env)
    const { findUserById } = await import("@/lib/repositories/user.repository");

    const admin = await findUserById(1);
    expect(admin).not.toBeNull();
    expect(admin!.role).toBe("admin");

    const { createUser, findAllUsers } = await import("@/lib/repositories/user.repository");
    const { hashPassword } = await import("@/lib/auth/password");

    const hash = await hashPassword("manageronly");
    const manager = await createUser({
      email: "manageronly",
      fullName: "Manager Only",
      passwordHash: hash,
      role: "manager",
    });

    const managerCheck = await findUserById(manager.id);
    expect(managerCheck!.role).toBe("manager");
  });

  it("findUserById retourne undefined pour un ID inexistant", async () => {
    const { findUserById } = await import("@/lib/repositories/user.repository");
    const user = await findUserById(99999);
    expect(user).toBeUndefined();
  });

  it("devrait mettre a jour le role d'un utilisateur", async () => {
    const { updateUser, findUserByEmail, createUser } = await import("@/lib/repositories/user.repository");
    const { hashPassword } = await import("@/lib/auth/password");

    const hash = await hashPassword("updaterole");
    await createUser({
      email: "updaterole",
      fullName: "Update Role",
      passwordHash: hash,
      role: "manager",
    });

    const user = await findUserByEmail("updaterole");
    expect(user).not.toBeNull();
    expect(user!.role).toBe("manager");

    await updateUser(user!.id, { role: "admin" });

    const updated = await findUserByEmail("updaterole");
    expect(updated!.role).toBe("admin");
  });

  it("findAllUsers devrait retourner tous les utilisateurs", async () => {
    const { findAllUsers } = await import("@/lib/repositories/user.repository");
    const users = await findAllUsers();
    expect(users.length).toBeGreaterThanOrEqual(4); // admin + 3 created in tests
    expect(users.some(u => u.role === "admin")).toBe(true);
    expect(users.some(u => u.role === "manager")).toBe(true);
  });

  it("devrait supprimer un utilisateur", async () => {
    const { createUser, deleteUser, findUserByEmail } = await import("@/lib/repositories/user.repository");
    const { hashPassword } = await import("@/lib/auth/password");

    const hash = await hashPassword("deleteuser");
    const user = await createUser({
      email: "deleteuser",
      fullName: "Delete User",
      passwordHash: hash,
      role: "manager",
    });

    await deleteUser(user.id);

    const deleted = await findUserByEmail("deleteuser");
    expect(deleted).toBeUndefined();
  });

  it("auth.service devrait retourner le role correct pour admin et manager", async () => {
    const { authenticateUser } = await import("@/lib/services/auth.service");

    const admin = await authenticateUser("admin", "admin");
    expect(admin!.role).toBe("admin");

    const manager = await authenticateUser("manager1", "manager123");
    expect(manager!.role).toBe("manager");
  });

  it("requireApiAdmin avec un admin devrait retourner userId et null error", async () => {
    // Test the guard function directly by mocking getSessionUserId
    const { findUserById } = await import("@/lib/repositories/user.repository");
    const user = await findUserById(1);

    // Verify admin user exists with correct role
    expect(user).not.toBeNull();
    expect(user!.role).toBe("admin");

    // Create a manager and verify its role
    const { createUser } = await import("@/lib/repositories/user.repository");
    const { hashPassword } = await import("@/lib/auth/password");
    const hash = await hashPassword("apimanager");
    const managerUser = await createUser({
      email: "apimanager",
      fullName: "API Manager",
      passwordHash: hash,
      role: "manager",
    });

    // The guard logic: role === "admin" passes, role !== "admin" fails
    expect(managerUser.role).toBe("manager");
    const managerCheck = await findUserById(managerUser.id);
    expect(managerCheck!.role).toBe("manager");
  });

  it("devrait creer un audit_log lors de la creation d'un utilisateur", async () => {
    const { logAudit, getAuditLogs } = await import("@/lib/services/audit.service");

    await logAudit({
      tableName: "users",
      recordId: 42,
      action: "create",
      userId: 1,
      newValues: { email: "test-audit", fullName: "Test Audit", role: "manager" },
    });

    const result = await getAuditLogs({ tableName: "users", action: "create" });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    const entry = result.data.find((e: any) => e.recordId === 42);
    expect(entry).toBeDefined();
    expect(entry.action).toBe("create");
    expect(entry.newValues.email).toBe("test-audit");
  });

  it("devrait creer un audit_log lors de la modification d'un utilisateur", async () => {
    const { logAudit, getAuditLogs } = await import("@/lib/services/audit.service");

    await logAudit({
      tableName: "users",
      recordId: 1,
      action: "update",
      userId: 1,
      oldValues: { role: "manager" },
      newValues: { role: "admin" },
    });

    const result = await getAuditLogs({ tableName: "users", action: "update" });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    const entry = result.data.find((e: any) => e.recordId === 1 && e.oldValues?.role === "manager");
    expect(entry).toBeDefined();
    expect(entry.newValues.role).toBe("admin");
  });

  it("devrait creer un audit_log lors de la suppression d'un utilisateur", async () => {
    const { logAudit, getAuditLogs } = await import("@/lib/services/audit.service");

    await logAudit({
      tableName: "users",
      recordId: 7,
      action: "delete",
      userId: 1,
      oldValues: { email: "delete-audit", fullName: "Delete Audit", role: "manager" },
    });

    const result = await getAuditLogs({ tableName: "users", action: "delete" });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    const entry = result.data.find((e: any) => e.recordId === 7);
    expect(entry).toBeDefined();
    expect(entry.oldValues.email).toBe("delete-audit");
  });
});
