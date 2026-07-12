export function validateAmount(amount: unknown, fieldName = "Montant"): asserts amount is number {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${fieldName} invalide : doit être un nombre positif`);
  }
}
