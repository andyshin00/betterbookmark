import { APP_NAME } from "@betterbookmark/shared";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
      <Button>Get started</Button>
    </main>
  );
}
