import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// DATABASE_URL lives in the web app's env file, not in this package.
config({ path: "../../apps/web/.env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
