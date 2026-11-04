import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EditorialClientDashboard } from "@/components/editorial/EditorialClientDashboard";

export default async function EditorialDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/editorial/login");
  }

  const role = session.user.role as string;
  if (role !== "EDITOR" && role !== "ADMIN") {
    redirect("/editorial/login");
  }

  return <EditorialClientDashboard initialUser={session.user} />;
}
