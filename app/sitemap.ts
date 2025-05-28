// app/sitemap.ts
import { MetadataRoute } from "next";
import { Pool } from "pg";
import { config } from "@/lib/config";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { rows } = await pool.query<{ symbol: string; date: Date }>(
    'SELECT DISTINCT symbol, MAX(date) as date FROM public."screener.concall" WHERE parsed = true GROUP BY symbol'
  );

  console.log(rows);

  return rows.map(({ symbol, date }) => ({
    url: `${config.frontend.baseUrl}/${encodeURIComponent(symbol)}/concall`,
    // TODO: Include the last_updated_date from the database to automatically re-index content changes.
    // lastModified: date,
    changeFrequency: "daily",
    priority: 0.8,
  }));
}
