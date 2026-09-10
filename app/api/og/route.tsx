import { ImageResponse } from "next/og"

import { ogImageSchema } from "@/lib/validations/og"

// next/og (not the standalone @vercel/og package) so this can run as a
// regular Node serverless function instead of an Edge Function - the
// WASM-based renderer alone is close to Vercel's 1 MB Edge Function limit,
// which broke every deployment regardless of the two embedded fonts removed
// below.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const values = ogImageSchema.parse(Object.fromEntries(url.searchParams))
    const heading =
      values.heading.length > 80
        ? `${values.heading.substring(0, 100)}...`
        : values.heading

    const { mode } = values
    const paint = mode === "dark" ? "#fff" : "#000"
    const fontSize = heading.length > 80 ? "60px" : "80px"

    return new ImageResponse(
      (
        <div
          tw="flex relative flex-col p-12 w-full h-full items-start"
          style={{
            color: paint,
            background:
              mode === "dark"
                ? "linear-gradient(90deg, #000 0%, #111 100%)"
                : "white",
          }}
        >
          <div
            tw="text-5xl font-bold"
            style={{
              background: "linear-gradient(90deg, #6366f1, #a855f7 80%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            TWE Learning
          </div>

          <div tw="flex flex-col flex-1 py-16">
            <div tw="flex text-xl uppercase font-bold tracking-tight">
              {values.type}
            </div>
            <div
              tw="flex leading-[1.15] font-bold"
              style={{ marginLeft: "-3px", fontSize }}
            >
              {heading}
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    )
  } catch {
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}
