import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const academicYearId = searchParams.get("academicYearId") 
      ?? (db.get(sql`SELECT id FROM academic_years WHERE is_current = 1`) as { id: number } | undefined)?.id 
      ?? null;

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const firstOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];

    const dateFilter = from && to ? sql`AND a.date >= ${from} AND a.date <= ${to}` : sql``;
    const yearFilter = from && to ? sql`AND a.date >= ${from} AND a.date <= ${to}` : sql``;
    const evalFilter = from ? sql`AND e.date >= ${from} AND e.date <= ${to}` : sql``;

    const enrollmentJoin = academicYearId
      ? sql`JOIN enrollments e ON e.student_id = s.id AND e.academic_year_id = ${academicYearId}`
      : sql``;
    const enrollmentWhere = academicYearId
      ? sql`AND e.academic_year_id = ${academicYearId}`
      : sql``;

    // Combined student stats: active count, total, new this month, previous month
    const [studentStats] = db.all(sql`
      SELECT
        (SELECT COUNT(*) FROM students s ${enrollmentJoin} WHERE s.status = 'Actif') as active,
        (SELECT COUNT(*) FROM students s ${enrollmentJoin}) as total,
        (SELECT COUNT(*) FROM students s ${enrollmentJoin} WHERE s.status = 'Actif' AND s.registration_date >= ${firstOfMonth}) as new_this_month,
        (SELECT COUNT(*) FROM students s ${enrollmentJoin} WHERE s.status = 'Actif' AND s.registration_date < ${firstOfMonth}) as prev_month
    `) as any;

    const studentGrowth = studentStats.prev_month > 0
      ? Math.round(((studentStats.active - studentStats.prev_month) / studentStats.prev_month) * 100 * 10) / 10
      : 0;

    const studentsByClass = db.all(sql`
      SELECT c.name, c.capacity, COUNT(s.id) as count
      FROM classes c
      LEFT JOIN enrollments e ON e.class_id = c.id ${enrollmentWhere}
      LEFT JOIN students s ON s.id = e.student_id AND s.status = 'Actif'
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY c.name
    `) as { name: string; capacity: number; count: number }[];

    // Combined attendance: overall + this week + last week + by class + recent absences
    const absRows = db.all(sql`
      SELECT
        (SELECT COUNT(*) FROM attendance a WHERE 1=1 ${dateFilter}) as att_total,
        (SELECT SUM(CASE WHEN status IN ('présent','congé') THEN 1 ELSE 0 END) FROM attendance a WHERE 1=1 ${dateFilter}) as att_present,
        (SELECT COUNT(*) FROM attendance a WHERE date >= date('now','weekday 0','-7 days') ${yearFilter}) as week_total,
        (SELECT SUM(CASE WHEN status IN ('présent','congé') THEN 1 ELSE 0 END) FROM attendance a WHERE date >= date('now','weekday 0','-7 days') ${yearFilter}) as week_present,
        (SELECT COUNT(*) FROM attendance a WHERE date >= date('now','weekday 0','-14 days') AND date < date('now','weekday 0','-7 days') ${yearFilter}) as last_week_total,
        (SELECT SUM(CASE WHEN status IN ('présent','congé') THEN 1 ELSE 0 END) FROM attendance a WHERE date >= date('now','weekday 0','-14 days') AND date < date('now','weekday 0','-7 days') ${yearFilter}) as last_week_present,
        (SELECT COUNT(*) FROM attendance a WHERE status = 'absent' AND date >= date('now','-7 days') ${yearFilter}) as recent_absences
    `) as any;

    const absRow = absRows[0];
    const attendanceRate = absRow.att_total > 0
      ? Math.round((absRow.att_present / absRow.att_total) * 100) : 0;
    const thisWeekRate = absRow.week_total > 0 ? (absRow.week_present / absRow.week_total) * 100 : 0;
    const lastWeekRate = absRow.last_week_total > 0 ? (absRow.last_week_present / absRow.last_week_total) * 100 : 0;
    const attendanceTrend = lastWeekRate > 0 ? Math.round((thisWeekRate - lastWeekRate) * 10) / 10 : 0;

    const attendanceByClass = db.all(sql`
      SELECT c.name,
        COUNT(a.id) as total,
        SUM(CASE WHEN a.status IN ('présent','congé') THEN 1 ELSE 0 END) as present
      FROM classes c
      LEFT JOIN attendance a ON a.class_id = c.id
      WHERE c.status = 'active' ${dateFilter}
      GROUP BY c.id
      ORDER BY c.name
    `) as { name: string; total: number; present: number }[];

    const attendanceByClassData = attendanceByClass.map(c => ({
      class: c.name,
      rate: c.total > 0 ? Math.round((c.present / c.total) * 100) : 0,
    }));

    // Combined payment stats: revenue, this month, last month, monthly avg, outstanding, unpaid count
    const payRows = db.all(sql`
      SELECT
        COALESCE((SELECT SUM(amount) FROM payments WHERE status = 'payé'), 0) as total_revenue,
        COALESCE((SELECT SUM(amount) FROM payments WHERE status = 'payé' AND date >= ${firstOfMonth}), 0) as this_month,
        COALESCE((SELECT SUM(amount) FROM payments WHERE status = 'payé' AND date >= ${firstOfPrevMonth} AND date <= ${lastMonthEnd}), 0) as last_month,
        COALESCE((SELECT AVG(monthly) FROM (SELECT SUM(amount) as monthly FROM payments WHERE status = 'payé' GROUP BY substr(date, 1, 7))), 0) as monthly_avg
    `) as any;

    const payRow = payRows[0];
    const revenueGrowth = payRow.last_month > 0
      ? Math.round(((payRow.this_month - payRow.last_month) / payRow.last_month) * 100 * 10) / 10
      : 0;

    // Outstanding & unpaid — combined in a single query
    const [finData] = db.all(sql`
      SELECT
        COALESCE(SUM(CASE WHEN due > 0 THEN due ELSE 0 END), 0) as outstanding_total,
        COUNT(CASE WHEN due > 0 THEN 1 END) as unpaid_count
      FROM (
        SELECT c.total_fee - COALESCE(SUM(p.amount), 0) as due
        FROM students s
        JOIN classes c ON s.class_id = c.id
        LEFT JOIN payments p ON p.student_id = s.id AND p.status = 'payé'
        ${enrollmentJoin}
        WHERE s.status = 'Actif' AND c.total_fee > 0
        GROUP BY s.id
      )
    `) as any;

    // Exam stats
    const [examStats] = db.all(sql`
      SELECT
        COALESCE(AVG(CASE WHEN g.is_absent = 0 THEN g.score END), 0) as avg_score,
        COUNT(DISTINCT g.student_id) as graded_students,
        SUM(CASE WHEN g.score >= 10 AND g.is_absent = 0 THEN 1 ELSE 0 END) as passed
      FROM grades g
      JOIN evaluations e ON g.evaluation_id = e.id
      WHERE e.status = 'published' ${evalFilter}
    `) as any;

    const passRate = examStats.graded_students > 0
      ? Math.round((examStats.passed / examStats.graded_students) * 100)
      : 0;

    // Teacher count
    const [teacherCount] = db.all(sql`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
      FROM teachers
    `) as any;

    // Upcoming exams
    const [upcomingExams] = db.all(sql`
      SELECT COUNT(*) as count
      FROM exams
      WHERE date >= date('now') AND date <= date('now', '+7 days')
    `) as any;

    return NextResponse.json({
      ok: true,
      data: {
        students: {
          total: studentStats.active,
          growth: studentGrowth,
          newThisMonth: studentStats.new_this_month,
          byClass: studentsByClass.map(c => ({
            name: c.name,
            count: c.count,
            capacity: c.capacity || 50,
            percentage: c.capacity > 0 ? Math.round((c.count / c.capacity) * 100) : 0,
          })),
        },
        attendance: {
          overall: attendanceRate,
          trend: attendanceTrend,
          byClass: attendanceByClassData,
        },
        financial: {
          totalRevenue: payRow.total_revenue,
          growth: revenueGrowth,
          monthlyAverage: payRow.monthly_avg,
          outstandingPayments: finData.outstanding_total,
        },
        exams: {
          passRate,
          averageScore: Math.round(examStats.avg_score * 10) / 10,
        },
        teachers: {
          total: teacherCount.total,
          active: teacherCount.active,
        },
        alerts: {
          unpaidStudents: finData.unpaid_count,
          unpaidAmount: finData.outstanding_total,
          recentAbsences: absRow.recent_absences,
          upcomingExams: upcomingExams.count,
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
