import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome, {session.user.name}
      </h1>
      <p className="text-muted-foreground">
        Your bookmarks will show up here (Phase 3).
      </p>
    </div>
  );
}
