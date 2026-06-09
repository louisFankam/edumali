import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { seedSchoolEvent } from "../helpers/seed";
import { getEventsByRange, createEvent, updateEvent, deleteEvent, getEventById } from "@/lib/services/calendar.service";

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

const toISO = (d: Date) => d.toISOString().split("T")[0];

describe("Calendrier scolaire - Tests d'intégration", () => {
  describe("A. CRUD de base", () => {
    it("A1 - createEvent crée un événement et retourne l'ID", async () => {
      const ev = await createEvent({
        title: "Réunion parents",
        type: "meeting",
        startDate: "2026-06-10",
      });
      expect(ev).toBeDefined();
      expect(ev.id).toBeTruthy();
      expect(ev.title).toBe("Réunion parents");
      expect(ev.type).toBe("meeting");
    });

    it("A1b - createEvent crée un audit_log", async () => {
      const { getAuditLogs } = await import("@/lib/services/audit.service");
      const result = await getAuditLogs({ tableName: "school_events", action: "create", limit: 1 });
      expect(result.total).toBeGreaterThanOrEqual(1);
    });

    it("A2 - createEvent avec tous les champs optionnels", async () => {
      const ev = await createEvent({
        title: "Vacances Noël",
        description: "Du 22 déc au 5 janv",
        type: "holiday",
        startDate: "2026-12-22",
        endDate: "2027-01-05",
        allDay: true,
        color: "#ef4444",
      });
      expect(ev.description).toBe("Du 22 déc au 5 janv");
      expect(ev.endDate).toBe("2027-01-05");
      expect(ev.allDay).toBe(true);
      expect(ev.color).toBe("#ef4444");
    });

    it("A3 - getEventById retourne l'événement", async () => {
      const id = await seedSchoolEvent({ title: "Test", type: "exam" });
      const ev = await getEventById(id);
      expect(ev).not.toBeNull();
      expect(ev!.title).toBe("Test");
      expect(ev!.type).toBe("exam");
    });

    it("A4 - getEventById retourne null pour un ID inexistant", async () => {
      const ev = await getEventById("999999");
      expect(ev).toBeNull();
    });

    it("A5 - updateEvent modifie un événement", async () => {
      const id = await seedSchoolEvent({ title: "Avant modif", type: "event" });
      const updated = await updateEvent(id, { title: "Après modif", type: "holiday" });
      expect(updated.title).toBe("Après modif");
      expect(updated.type).toBe("holiday");
    });

    it("A6 - updateEvent lève une erreur si ID inexistant", async () => {
      await expect(updateEvent("999999", { title: "Nope" })).rejects.toThrow("non trouvé");
    });

    it("A7 - deleteEvent supprime un événement", async () => {
      const id = await seedSchoolEvent({ title: "À supprimer" });
      await deleteEvent(id);
      const ev = await getEventById(id);
      expect(ev).toBeNull();
    });

    it("A8 - deleteEvent ne lève pas d'erreur si ID inexistant (delete silencieux)", async () => {
      await expect(deleteEvent("999999")).resolves.not.toThrow();
    });
  });

  describe("B. Filtre par plage de dates (getEventsByRange)", () => {
    it("B1 - retourne les événements dans la plage", async () => {
      await seedSchoolEvent({ title: "Dedans", startDate: "2026-07-15" });
      const events = await getEventsByRange("2026-07-01", "2026-07-31");
      const titles = events.map(e => e.title);
      expect(titles).toContain("Dedans");
    });

    it("B2 - exclut les événements hors plage", async () => {
      await seedSchoolEvent({ title: "Dehors", startDate: "2026-08-15" });
      const events = await getEventsByRange("2026-07-01", "2026-07-31");
      const titles = events.map(e => e.title);
      expect(titles).not.toContain("Dehors");
    });

    it("B3 - événement multi-jours visible sur toute la plage", async () => {
      const id = await seedSchoolEvent({ title: "Multi", startDate: "2026-07-20", endDate: "2026-08-05" });
      const july = await getEventsByRange("2026-07-01", "2026-07-31");
      const aug = await getEventsByRange("2026-08-01", "2026-08-31");
      expect(july.map(e => e.id)).toContain(id);
      expect(aug.map(e => e.id)).toContain(id);
    });

    it("B4 - plage vide retourne un tableau vide", async () => {
      const events = await getEventsByRange("2020-01-01", "2020-01-31");
      expect(events).toEqual([]);
    });
  });

  describe("C. Types d'événements et validation", () => {
    it("C1 - crée un événement de chaque type", async () => {
      const types = ["holiday", "event", "meeting", "exam", "deadline"] as const;
      for (const type of types) {
        const ev = await createEvent({ title: `Type ${type}`, type, startDate: "2026-09-01" });
        expect(ev.type).toBe(type);
      }
    });

    it("C2 - le tri est par startDate croissante", async () => {
      const idZ = await seedSchoolEvent({ title: "ZZZ", startDate: "2026-10-03" });
      const idA = await seedSchoolEvent({ title: "AAA", startDate: "2026-10-01" });
      const idM = await seedSchoolEvent({ title: "MMM", startDate: "2026-10-02" });
      const events = await getEventsByRange("2026-10-01", "2026-10-31");
      const titles = events.filter(e => [idA, idM, idZ].includes(e.id)).map(e => e.title);
      expect(titles).toEqual(["AAA", "MMM", "ZZZ"]);
    });
  });
});
