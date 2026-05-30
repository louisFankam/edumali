import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

const categoryLabels: Record<string, string> = {
  eau: "Eau", electricite: "Électricité", fournitures: "Fournitures",
  entretien: "Entretien", transport: "Transport", equipement: "Équipement", autres: "Autres",
};

export async function getDashboardData(from?: string, to?: string) {
  const dateFrom = from || "1970-01-01";
  const dateTo = to || "2099-12-31";

  const monthlyRevenue = db.all(sql`
    SELECT substr(date, 1, 7) as month, SUM(amount) as total
    FROM payments
    WHERE status = 'payé' AND date >= ${dateFrom} AND date <= ${dateTo}
    GROUP BY substr(date, 1, 7)
    ORDER BY month ASC
  `) as { month: string; total: number }[];

  const monthlyExpenses = db.all(sql`
    SELECT substr(date, 1, 7) as month, SUM(amount) as total
    FROM expenses
    WHERE date >= ${dateFrom} AND date <= ${dateTo}
    GROUP BY substr(date, 1, 7)
    ORDER BY month ASC
  `) as { month: string; total: number }[];

  const monthlyPayroll = db.all(sql`
    SELECT printf('%04d-%02d', year, month) as month, SUM(amount + COALESCE(bonus, 0) - COALESCE(deductions, 0)) as total
    FROM payroll
    WHERE (year > ${Number(dateFrom.substring(0, 4))} OR (year = ${Number(dateFrom.substring(0, 4))} AND month >= ${Number(dateFrom.substring(5, 7))}))
      AND (year < ${Number(dateTo.substring(0, 4))} OR (year = ${Number(dateTo.substring(0, 4))} AND month <= ${Number(dateTo.substring(5, 7))}))
    GROUP BY printf('%04d-%02d', year, month)
    ORDER BY month ASC
  `) as { month: string; total: number }[];

  const categoryExpenses = db.all(sql`
    SELECT category, COALESCE(category_custom, category) as cat_label, SUM(amount) as total
    FROM expenses
    WHERE date >= ${dateFrom} AND date <= ${dateTo}
    GROUP BY category, cat_label
    ORDER BY total DESC
  `) as { category: string; cat_label: string; total: number }[];

  const [revTotal] = db.all(sql`
    SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM payments
    WHERE status = 'payé' AND date >= ${dateFrom} AND date <= ${dateTo}
  `) as { total: number; count: number }[];

  const [expTotal] = db.all(sql`
    SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM expenses
    WHERE date >= ${dateFrom} AND date <= ${dateTo}
  `) as { total: number; count: number }[];

  const [payrollTotal] = db.all(sql`
    SELECT COALESCE(SUM(amount + COALESCE(bonus, 0) - COALESCE(deductions, 0)), 0) as total, COUNT(*) as count
    FROM payroll
    WHERE (year > ${Number(dateFrom.substring(0, 4))} OR (year = ${Number(dateFrom.substring(0, 4))} AND month >= ${Number(dateFrom.substring(5, 7))}))
      AND (year < ${Number(dateTo.substring(0, 4))} OR (year = ${Number(dateTo.substring(0, 4))} AND month <= ${Number(dateTo.substring(5, 7))}))
  `) as { total: number; count: number }[];

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().substring(0, 7);
    const label = d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
    const revenus = monthlyRevenue.find(r => r.month === key)?.total || 0;
    const depenses = (monthlyExpenses.find(e => e.month === key)?.total || 0) + (monthlyPayroll.find(p => p.month === key)?.total || 0);
    months.push({ month: label, Revenus: revenus, Dépenses: depenses });
  }

  const pieData = categoryExpenses.map(c => ({
    name: categoryLabels[c.category] || c.cat_label,
    value: c.total,
  }));
  if (payrollTotal.total > 0) {
    pieData.push({ name: "Salaires", value: payrollTotal.total });
  }

  const totalRevenue = revTotal.total;
  const totalExpenses = expTotal.total + payrollTotal.total;

  return {
    totals: {
      totalRevenue,
      totalExpenses,
      netBalance: totalRevenue - totalExpenses,
      revenueCount: revTotal.count,
      expenseCount: expTotal.count + payrollTotal.count,
    },
    monthly: months,
    pieData,
  };
}
