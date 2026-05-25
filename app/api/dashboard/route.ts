import { NextRequest, NextResponse } from "next/server";
import { countStudents, findAllStudents } from "@/lib/repositories/student.repository";
import { findAllClasses } from "@/lib/repositories/class.repository";
import { getPaymentStats } from "@/lib/repositories/payment.repository";
import { countEnrollmentsByYear } from "@/lib/repositories/enrollment.repository";
import { findAttendanceStats } from "@/lib/repositories/attendance.repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalStudents, classes, paymentStats, enrollmentStats, attendanceRate] = await Promise.all([
      countStudents(),
      findAllClasses(),
      getPaymentStats(),
      countEnrollmentsByYear(),
      findAttendanceStats(),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        totalStudents,
        totalClasses: classes.length,
        totalRevenue: paymentStats.totalRevenue,
        totalPayments: paymentStats.totalPayments,
        totalEnrollments: enrollmentStats.total,
        attendanceRate: attendanceRate.rate,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
