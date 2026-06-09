import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/guards/api-admin.guard";
import { findAllUsers, createUser, updateUser, deleteUser, findUserByEmail } from "@/lib/repositories/user.repository";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error } = await requireApiAdmin();
    if (error) return error;

    const users = await findAllUsers();
    return NextResponse.json({
      ok: true,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        createdAt: u.createdAt?.getTime() ?? null,
      })),
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

const createUserSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis").max(254),
  fullName: z.string().min(1, "Le nom complet est requis").max(200),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(128),
  role: z.enum(["admin", "manager"]),
});

export async function POST(request: Request) {
  try {
    const { error } = await requireApiAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Données invalides.", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const existing = await findUserByEmail(parsed.data.username);
    if (existing) {
      return NextResponse.json({ ok: false, message: "Ce nom d'utilisateur existe déjà." }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const created = await createUser({
      email: parsed.data.username,
      fullName: parsed.data.fullName,
      passwordHash,
      role: parsed.data.role,
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: created.id,
        email: created.email,
        fullName: created.fullName,
        role: created.role,
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
