// app/sitemap.ts
import { MetadataRoute } from "next";
import { Pool } from "pg";
import { config } from "@/lib/config";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [concallRows, mdaRows, hierarchyRows] = await Promise.all([
    pool.query<{ symbol: string; date: Date }>(
      'SELECT DISTINCT symbol, MAX(date) as date FROM public."screener.concall" WHERE parsed = true GROUP BY symbol'
    ),
    pool.query<{ symbol: string }>(
      `SELECT DISTINCT symbol 
       FROM public."screener.annual_report" 
       WHERE parsed = true 
         AND skipped = false
         AND risk_factors IS NOT NULL
         AND json_array_length(risk_factors) > 0`
    ),
    pool.query<{ symbol: string }>(
      `SELECT DISTINCT symbol
       FROM public."screener.annual_report"
       WHERE hierarchy_parsed = true
         AND hierarchy IS NOT NULL` 
    ),
  ]);

  const concallUrls = concallRows.rows.map(({ symbol }) => ({
    url: `${config.frontend.baseUrl}/${encodeURIComponent(symbol)}/concall`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const mdaUrls = mdaRows.rows.map(({ symbol }) => ({
    url: `${config.frontend.baseUrl}/${encodeURIComponent(symbol)}/mda`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const hierarchyUrls = hierarchyRows.rows.map(({ symbol }) => ({
    url: `${config.frontend.baseUrl}/${encodeURIComponent(symbol)}/hierarchy`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...concallUrls, ...mdaUrls, ...hierarchyUrls];
}