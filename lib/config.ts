export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  },
  api_v2: {
    baseUrl: process.env.NEXT_PUBLIC_API_v2_BASE_URL || "http://localhost:8001",
  },
} as const;
