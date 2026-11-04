import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminClientDashboard } from "@/components/admin/AdminClientDashboard";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const role = session.user.role as string;
  if (role !== "ADMIN") {
    redirect("/editorial");
  }

  return <AdminClientDashboard currentUser={session.user} />;
}

