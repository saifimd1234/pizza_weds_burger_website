/**
 * Applies db/schema.sql then db/analytics.sql to DATABASE_URL.
 *   npm run db:migrate
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (see .env.example)");
  const local = /@(localhost|127\.0\.0\.1)/.test(url);
  const sql = postgres(url, { prepare: false, max: 1, ssl: local ? false : "require", onnotice: () => {} });
  try {
    for (const f of ["schema.sql", "analytics.sql"]) {
      await sql.unsafe(readFileSync(join(process.cwd(), "db", f), "utf8"));
      console.log(`✔ applied db/${f}`);
    }
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
