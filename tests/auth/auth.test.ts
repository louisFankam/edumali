import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { sql } from "drizzle-orm";

describe("Auth - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("devrait authentifier un administrateur avec des identifiants valides", async () => {
    const { authenticateUser } = await import("@/lib/services/auth.service");
    const user = await authenticateUser("admin", "admin");
    expect(user).not.toBeNull();
    expect(user!.email).toBe("admin");
    expect(user!.id).toBeGreaterThan(0);
    expect(user!.role).toBe("admin");
  });

  it("devrait retourner null pour un mot de passe invalide", async () => {
    const { authenticateUser } = await import("@/lib/services/auth.service");
    const user = await authenticateUser("admin", "wrongpassword");
    expect(user).toBeNull();
  });

  it("devrait retourner null pour un email inexistant", async () => {
    const { authenticateUser } = await import("@/lib/services/auth.service");
    const user = await authenticateUser("inexistant@test.com", "password");
    expect(user).toBeNull();
  });

  it("devrait récupérer un utilisateur authentifié par ID", async () => {
    const { getAuthenticatedUser } = await import("@/lib/services/auth.service");
    const user = await getAuthenticatedUser(1);
    expect(user).not.toBeNull();
    expect(user!.email).toBeTruthy();
    expect(user!.role).toBe("admin");
  });

  it("devrait retourner null pour un ID utilisateur inexistant", async () => {
    const { getAuthenticatedUser } = await import("@/lib/services/auth.service");
    const user = await getAuthenticatedUser(99999);
    expect(user).toBeNull();
  });

  it("devrait vérifier le mot de passe avec PBKDF2", async () => {
    const { verifyPassword, hashPassword } = await import("@/lib/auth/password");
    const hash = await hashPassword("monMotDePasse");
    const valid = await verifyPassword("monMotDePasse", hash);
    expect(valid).toBe(true);
    const invalid = await verifyPassword("mauvais", hash);
    expect(invalid).toBe(false);
  });
});
