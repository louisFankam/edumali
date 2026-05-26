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

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const firstOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];

    const dateFilter = from && to ? sql`AND a.date >= ${from} AND a.date <= ${to}` : sql``;
    const paymentDateFilter = from && to ? sql`AND p.date >= ${from} AND p.date <= ${to}` : sql``;
    const evalFilter = from ? sql`AND e.date >= ${from} AND e.date <= ${to}` : sql``;

    const [studentCount] = db.all(sql`
      SELECT
        (SELECT COUNT(*) FROM students WHERE status = 'Actif') as active,
        (SELECT COUNT(*) FROM students) as total,
        (SELECT COUNT(*) FROM students WHERE status = 'Actif' AND registration_date >= ${firstOfMonth}) as new_this_month
    `) as { active: number; total: number; new_this_month: number }[];

    const studentsByClass = db.all(sql`
      SELECT c.name, c.capacity, COUNT(s.id) as count
      FROM classes c
      LEFT JOIN students s ON s.class_id = c.id AND s.status = 'Actif'
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY c.name
    `) as { name: string; capacity: number; count: number }[];

    const [attendanceOverall] = db.all(sql`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'présent' OR status = 'congé' THEN 1 ELSE 0 END) as present
      FROM attendance a
      WHERE 1=1 ${dateFilter}
    `) as { total: number; present: number }[];
    const attendanceRate = attendanceOverall.total > 0
      ? Math.round((attendanceOverall.present / attendanceOverall.total) * 100)
      : 0;

    const attendanceByClass = db.all(sql`
      SELECT c.name,
        COUNT(a.id) as total,
        SUM(CASE WHEN a.status = 'présent' OR a.status = 'congé' THEN 1 ELSE 0 END) as present
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

    const [thisWeekTotal] = db.all(sql`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN status = 'présent' OR status = 'congé' THEN 1 ELSE 0 END) as present
      FROM attendance
      WHERE date >= date('now', 'weekday 0', '-7 days')
    `) as { total: number; present: number }[];

    const [lastWeekTotal] = db.all(sql`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN status = 'présent' OR status = 'congé' THEN 1 ELSE 0 END) as present
      FROM attendance
      WHERE date >= date('now', 'weekday 0', '-14 days') AND date < date('now', 'weekday 0', '-7 days')
    `) as { total: number; present: number }[];

    const thisWeekRate = thisWeekTotal.total > 0 ? (thisWeekTotal.present / thisWeekTotal.total) * 100 : 0;
    const lastWeekRate = lastWeekTotal.total > 0 ? (lastWeekTotal.present / lastWeekTotal.total) * 100 : 0;
    const attendanceTrend = lastWeekRate > 0 ? Math.round((thisWeekRate - lastWeekRate) * 10) / 10 : 0;

    const [revenue] = db.all(sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments p
      WHERE status = 'payé' ${paymentDateFilter}
    `) as { total: number }[];

    const [thisMonthRevenue] = db.all(sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE status = 'payé' AND date >= ${firstOfMonth}
    `) as { total: number }[];

    const [lastMonthRevenue] = db.all(sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE status = 'payé' AND date >= ${firstOfPrevMonth} AND date <= ${lastMonthEnd}
    `) as { total: number }[];

    const revenueGrowth = lastMonthRevenue.total > 0
      ? Math.round(((thisMonthRevenue.total - lastMonthRevenue.total) / lastMonthRevenue.total) * 100 * 10) / 10
      : 0;

    const [monthlyAverage] = db.all(sql`
      SELECT COALESCE(AVG(monthly), 0) as avg FROM (
        SELECT SUM(amount) as monthly
        FROM payments p
        WHERE status = 'payé' ${paymentDateFilter}
        GROUP BY substr(date, 1, 7)
      )
    `) as { avg: number }[];

    const [outstanding] = db.all(sql`
      SELECT COALESCE(SUM(due), 0) as total FROM (
        SELECT c.total_fee - COALESCE(SUM(p.amount), 0) as due
        FROM students s
        JOIN classes c ON s.class_id = c.id
        LEFT JOIN payments p ON p.student_id = s.id AND p.status = 'payé'
        WHERE s.status = 'Actif' AND c.total_fee > 0
        GROUP BY s.id
        HAVING c.total_fee - COALESCE(SUM(p.amount), 0) > 0
      )
    `) as { total: number }[];

    const [examStats] = db.all(sql`
      SELECT
        COALESCE(AVG(CASE WHEN g.is_absent = 0 THEN g.score ELSE NULL END), 0) as avg_score,
        COUNT(DISTINCT g.student_id) as graded_students,
        SUM(CASE WHEN g.score >= 10 AND g.is_absent = 0 THEN 1 ELSE 0 END) as passed
      FROM grades g
      JOIN evaluations e ON g.evaluation_id = e.id
      WHERE e.status = 'published' ${evalFilter}
    `) as { avg_score: number; graded_students: number; passed: number }[];

    const passRate = examStats.graded_students > 0
      ? Math.round((examStats.passed / examStats.graded_students) * 100)
      : 0;

    const [teacherCount] = db.all(sql`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
      FROM teachers
    `) as { total: number; active: number }[];

    const [unpaidCount] = db.all(sql`
      SELECT COUNT(*) as count FROM (
        SELECT s.id
        FROM students s
        JOIN classes c ON s.class_id = c.id
        LEFT JOIN payments p ON p.student_id = s.id AND p.status = 'payé'
        WHERE s.status = 'Actif' AND c.total_fee > 0
        GROUP BY s.id
        HAVING c.total_fee - COALESCE(SUM(p.amount), 0) > 0
      )
    `) as { count: number }[];

    const [recentAbsences] = db.all(sql`
      SELECT COUNT(*) as count
      FROM attendance
      WHERE status = 'absent' AND date >= date('now', '-7 days')
    `) as { count: number }[];

    const [upcomingExams] = db.all(sql`
      SELECT COUNT(*) as count
      FROM exams
      WHERE date >= date('now') AND date <= date('now', '+7 days')
    `) as { count: number }[];

    const [growth] = db.all(sql`
      SELECT
        (SELECT COUNT(*) FROM students WHERE status = 'Actif' AND registration_date < ${firstOfMonth}) as prev_month,
        (SELECT COUNT(*) FROM students WHERE status = 'Actif') as current
    `) as { prev_month: number; current: number }[];
    const studentGrowth = growth.prev_month > 0
      ? Math.round(((growth.current - growth.prev_month) / growth.prev_month) * 100 * 10) / 10
      : 0;

    return NextResponse.json({
      ok: true,
      data: {
        students: {
          total: studentCount.active,
          growth: studentGrowth,
          newThisMonth: studentCount.new_this_month,
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
          totalRevenue: revenue.total,
          growth: revenueGrowth,
          monthlyAverage: monthlyAverage.avg,
          outstandingPayments: outstanding.total,
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
          unpaidStudents: unpaidCount.count,
          unpaidAmount: outstanding.total,
          recentAbsences: recentAbsences.count,
          upcomingExams: upcomingExams.count,
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
