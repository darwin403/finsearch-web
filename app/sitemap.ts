// app/sitemap.ts
import { MetadataRoute } from "next";
import { Pool } from "pg";

// Initialize DB connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all tickers from the database
  const { rows: tickers } = await pool.query(
    'SELECT symbol,date FROM public."screener.concall" where parsed = True'
  );

  console.log(tickers);

  return [];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";

  // Map tickers to sitemap entries
  return tickers.map(({ ticker }) => ({
    url: `${baseUrl}/app/${ticker}`,
    lastModified: new Date(),
  }));
}
