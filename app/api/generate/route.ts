import { NextRequest, NextResponse } from "next/server";
import { generateDigest } from "@/lib/scraper";
import { saveDigest } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  // protect endpoint with a secret token in production
  const secret = req.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  // allow Vercel cron (no auth header needed) or manual with secret
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const isAuthorised = !cronSecret || isVercelCron || secret === cronSecret;

  if (!isAuthorised) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const digest = await generateDigest();
    await saveDigest(digest);
    return NextResponse.json({
      success: true,
      date: digest.date,
      stories: digest.stories.length,
    });
  } catch (err) {
    console.error("Digest generation failed:", err);
    return NextResponse.json(
      { error: "Generation failed", detail: String(err) },
      { status: 500 }
    );
  }
}
