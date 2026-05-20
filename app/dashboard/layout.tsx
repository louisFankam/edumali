import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/guards/auth.guard";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireAuth();
  if (!userId) {
    redirect("/login");
  }

  return <>{children}</>;
}
