import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

const g = globalThis as unknown as { __pwbSql?: Sql };

/**
 * Supabase Postgres via the *transaction pooler* (port 6543) — the right mode
 * for serverless. That mode has no prepared statements, hence `prepare: false`.
 * Lazy so `next build` doesn't need DATABASE_URL.
 */
export function sql(): Sql {
  if (!g.__pwbSql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    const local = /@(localhost|127\.0\.0\.1)/.test(url);
    g.__pwbSql = postgres(url, {
      prepare: false,
      max: 1, // one connection per serverless instance; the pooler fans out
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: local ? false : "require",
      // int8 (count(), bigserial) → JS number so ids/counts never become strings
      types: { bigint: { to: 20, from: [20], parse: Number, serialize: (x: unknown) => String(x) } },
    });
  }
  return g.__pwbSql;
}

/** Tagged-template query returning typed rows. JS arrays become SQL arrays. */
export async function q<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const db = sql();
  const params = values.map((v) => (Array.isArray(v) ? db.array(v as never[]) : v));
  return (await db(strings, ...(params as never[]))) as unknown as T[];
}

/** JSON/JSONB parameter. (Never `JSON.stringify(x)::jsonb` — postgres.js would double-encode it.) */
export const json = (v: unknown) => sql().json(v as never);

/** Run a trusted (static) SQL string — used by migrations and the CSV export whitelist. */
export async function raw<T = Record<string, unknown>>(query: string): Promise<T[]> {
  return (await sql().unsafe(query)) as unknown as T[];
}
