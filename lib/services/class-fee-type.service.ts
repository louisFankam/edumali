import {
  findClassFeeTypes,
  findAllClassFeeTypes,
  setClassFeeTypes,
} from "@/lib/repositories/class-fee-type.repository";
import { logAudit } from "@/lib/services/audit.service";
import { validateAmount } from "./amount.validation";

export interface ClassFeeTypeData {
  id: string;
  feeTypeId: string;
  feeTypeName: string;
  feeTypeAmount: number;
  feeTypePeriod: string;
  amount: number | null;
}

function mapClassFeeType(cft: any): ClassFeeTypeData {
  return {
    id: String(cft.id),
    feeTypeId: String(cft.feeTypeId),
    feeTypeName: cft.feeType?.name ?? "",
    feeTypeAmount: cft.feeType?.amount ?? 0,
    feeTypePeriod: cft.feeType?.period ?? "",
    amount: cft.amount ?? null,
  };
}

export async function getClassFeeTypes(classId: string) {
  const rows = await findClassFeeTypes(Number(classId));
  return rows.map(mapClassFeeType);
}

export async function getAllClassFeeTypes() {
  const rows = await findAllClassFeeTypes();
  return rows.map(mapClassFeeType);
}

export async function saveClassFeeTypes(
  classId: string,
  items: { feeTypeId: string; amount: number | null }[],
  userId?: number
) {
  for (const item of items) {
    if (item.amount !== null) {
      validateAmount(item.amount, `Montant du frais supplémentaire (feeTypeId: ${item.feeTypeId})`);
    }
  }
  const parsed = items.map(item => ({
    feeTypeId: Number(item.feeTypeId),
    amount: item.amount,
  }));
  await setClassFeeTypes(Number(classId), parsed);
  logAudit({
    tableName: "class_fee_types",
    recordId: Number(classId),
    action: "update",
    userId,
    newValues: { items: parsed },
  });
}
