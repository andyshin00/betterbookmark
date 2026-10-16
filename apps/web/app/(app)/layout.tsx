import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_NAME } from "@betterbookmark/shared";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { getSession } from "@/lib/session";

// Every page inside app/(app)/ requires a logged-in user.
// This check runs on the server, so it can't be skipped from the browser.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          {APP_NAME}
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserMenu name={session.user.name} email={session.user.email} />
        </div>
      </header>
      <main className="flex flex-1 flex-col p-4">{children}</main>
    </div>
  );
}
