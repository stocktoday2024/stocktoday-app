import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArticleEditor } from "@/components/editorial/ArticleEditor";

export default async function NewArticlePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/editorial/login");
  }

  const userRole = session.user.role || "EDITOR";

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 1040 }}>
      <ArticleEditor userRole={userRole} />
    </div>
  );
}
