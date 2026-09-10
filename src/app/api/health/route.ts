import { jsonCacheHeaders } from "@/lib/cache-config";

export const revalidate = 86_400;

export async function GET() {
  // Avoid DB pings on every uptime monitor tick — opt in via env on paid plans.
  if (process.env.ENABLE_DB_HEALTH !== "true") {
    return Response.json(
      { ok: true, db: "skipped" },
      { headers: jsonCacheHeaders() },
    );
  }

  try {
    const { db } = await import("@/db");
    const { sql } = await import("drizzle-orm");
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: "connected" }, { headers: jsonCacheHeaders() });
  } catch {
    return Response.json(
      { ok: false, db: "error" },
      { status: 500, headers: jsonCacheHeaders(60) },
    );
  }
}
