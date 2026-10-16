import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Returns the logged-in user's session, or null. Server-only.
// cache() makes repeated calls in the same request (layout + page) hit the database once.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
