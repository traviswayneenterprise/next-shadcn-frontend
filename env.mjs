import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    GITHUB_OAUTH_TOKEN: z.string().min(1),
    INTERNAL_DOCS_TOKEN: z.string().optional(),
    INTERNAL_API_URL: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    GITHUB_OAUTH_TOKEN: process.env.GITHUB_OAUTH_TOKEN,
    INTERNAL_DOCS_TOKEN: process.env.INTERNAL_DOCS_TOKEN,
    INTERNAL_API_URL: process.env.INTERNAL_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
