import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/guards/admin.guard";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireAdmin();
  if (!userId) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
