import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/models/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:edumali_db/data.db",
  },
});
