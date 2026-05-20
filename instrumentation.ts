export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PHASE !== "phase-production-build") {
    const { initializeApp } = await import("@/lib/bootstrap");
    await initializeApp();
  }
}
