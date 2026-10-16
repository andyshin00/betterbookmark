import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_NAME } from "@betterbookmark/shared";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/session";

// Shared layout for /sign-in and /sign-up. Logged-in users don't need these pages.
export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="text-2xl font-semibold tracking-tight">
        {APP_NAME}
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
