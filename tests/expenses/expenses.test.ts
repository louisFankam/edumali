import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { sql } from "drizzle-orm";

describe("Dépenses - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("devrait retourner une liste vide initialement", async () => {
    const { getExpenses } = await import("@/lib/services/expense.service");
    const result = await getExpenses();
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("devrait créer une dépense", async () => {
    const { addExpense } = await import("@/lib/services/expense.service");

    const created = await addExpense({
      description: "Achat de fournitures",
      amount: 50000,
      category: "fournitures",
      date: "2026-05-15",
      notes: "Cahiers et stylos",
    });

    expect(created.description).toBe("Achat de fournitures");
    expect(created.amount).toBe(50000);
    expect(created.category).toBe("fournitures");
    expect(created.categoryLabel).toBe("Fournitures");
    expect(created.date).toBe("2026-05-15");
    });

  it("devrait créer un audit_log pour addExpense", async () => {
    const { getAuditLogs } = await import("@/lib/services/audit.service");
    const result = await getAuditLogs({ tableName: "expenses", action: "create", limit: 1 });
    expect(result.total).toBeGreaterThanOrEqual(1);
  });

  it("devrait créer une dépense avec catégorie personnalisée", async () => {
    const { addExpense } = await import("@/lib/services/expense.service");

    const created = await addExpense({
      description: "Réparation toiture",
      amount: 150000,
      category: "autres",
      categoryCustom: "Réparation",
      date: "2026-05-20",
    });

    expect(created.categoryCustom).toBe("Réparation");
  });

  it("devrait lister les dépenses avec pagination", async () => {
    const { addExpense, getExpenses } = await import("@/lib/services/expense.service");

    await addExpense({ description: "Dépense 1", amount: 10000, category: "eau", date: "2026-05-01" });
    await addExpense({ description: "Dépense 2", amount: 20000, category: "electricite", date: "2026-05-02" });

    const result = await getExpenses({ page: 1, limit: 10 });
    expect(result.total).toBeGreaterThanOrEqual(2);
    expect(result.data.length).toBeGreaterThanOrEqual(2);
  });

  it("devrait filtrer les dépenses par catégorie", async () => {
    const { getExpenses } = await import("@/lib/services/expense.service");

    const result = await getExpenses({ category: "eau" });
    expect(result.data.every((e: any) => e.category === "eau")).toBe(true);
  });

  it("devrait filtrer les dépenses par plage de dates", async () => {
    const { getExpenses } = await import("@/lib/services/expense.service");

    const result = await getExpenses({ from: "2026-05-01", to: "2026-05-31" });
    expect(result.data.every((e: any) => e.date >= "2026-05-01" && e.date <= "2026-05-31")).toBe(true);
  });

  it("devrait récupérer une dépense par ID", async () => {
    const { addExpense, getExpenseById } = await import("@/lib/services/expense.service");

    const created = await addExpense({
      description: "Dépense spécifique",
      amount: 75000,
      category: "transport",
      date: "2026-05-10",
    });

    const found = await getExpenseById(created.id);
    expect(found).not.toBeNull();
    expect(found!.description).toBe("Dépense spécifique");
  });

  it("devrait retourner null pour une dépense inexistante", async () => {
    const { getExpenseById } = await import("@/lib/services/expense.service");
    const found = await getExpenseById("99999");
    expect(found).toBeNull();
  });

  it("devrait modifier une dépense", async () => {
    const { addExpense, editExpense, getExpenseById } = await import("@/lib/services/expense.service");

    const created = await addExpense({
      description: "Avant modification",
      amount: 30000,
      category: "entretien",
      date: "2026-05-05",
    });

    await editExpense(created.id, { description: "Après modification", amount: 35000 });

    const updated = await getExpenseById(created.id);
    expect(updated!.description).toBe("Après modification");
    expect(updated!.amount).toBe(35000);
  });

  it("devrait supprimer une dépense", async () => {
    const { addExpense, removeExpense, getExpenseById } = await import("@/lib/services/expense.service");

    const created = await addExpense({
      description: "À supprimer",
      amount: 5000,
      category: "autres",
      date: "2026-05-25",
    });

    await removeExpense(created.id);
    const found = await getExpenseById(created.id);
    expect(found).toBeNull();
  });

  it("devrait lever une erreur pour dépense inexistante en modification", async () => {
    const { editExpense } = await import("@/lib/services/expense.service");
    await expect(editExpense("99999", { description: "Nope" })).rejects.toThrow("Dépense introuvable");
  });

  it("devrait lever une erreur pour dépense inexistante en suppression", async () => {
    const { removeExpense } = await import("@/lib/services/expense.service");
    await expect(removeExpense("99999")).rejects.toThrow("Dépense introuvable");
  });
});
