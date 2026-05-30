import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";

describe("Périodes - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("devrait retourner une liste vide initialement", async () => {
    const { getClosedPeriods } = await import("@/lib/services/period.service");
    const periods = await getClosedPeriods();
    expect(periods).toEqual([]);
  });

  it("devrait clôturer une période", async () => {
    const { closePeriod, getClosedPeriods } = await import("@/lib/services/period.service");
    const result = await closePeriod(5, 2026);
    expect(result.month).toBe(5);
    expect(result.year).toBe(2026);
    expect(result.id).toBeTruthy();

    const periods = await getClosedPeriods();
    expect(periods.length).toBe(1);
    expect(periods[0].month).toBe(5);
  });

  it("devrait lever une erreur si période déjà clôturée", async () => {
    const { closePeriod } = await import("@/lib/services/period.service");
    await expect(closePeriod(5, 2026)).rejects.toThrow("déjà clôturée");
  });

  it("devrait vérifier qu'une période est fermée", async () => {
    const { checkPeriodClosed } = await import("@/lib/services/period.service");
    const closed = await checkPeriodClosed("2026-05-15");
    expect(closed).toBe(true);
  });

  it("devrait vérifier qu'une période non fermée est ouverte", async () => {
    const { checkPeriodClosed } = await import("@/lib/services/period.service");
    const closed = await checkPeriodClosed("2026-06-15");
    expect(closed).toBe(false);
  });

  it("devrait rouvrir une période", async () => {
    const { openPeriod, getClosedPeriods, checkPeriodClosed } = await import("@/lib/services/period.service");
    await openPeriod(5, 2026);
    const periods = await getClosedPeriods();
    expect(periods.length).toBe(0);
    const closed = await checkPeriodClosed("2026-05-15");
    expect(closed).toBe(false);
  });
});
