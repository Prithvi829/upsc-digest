import { NextRequest, NextResponse } from "next/server";
import { getDigest, getLatestDigest, listDigestDates } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const listMode = req.nextUrl.searchParams.get("list") === "1";

  if (listMode) {
    const dates = await listDigestDates();
    return NextResponse.json({ dates });
  }

  try {
    const digest = date ? await getDigest(date) : await getLatestDigest();

    if (!digest) {
      // No digest in KV — generate on the fly
      const { generateDigest } = await import("@/lib/scraper");
      const { saveDigest } = await import("@/lib/storage");
      const fresh = await generateDigest();
      await saveDigest(fresh);
      return NextResponse.json(fresh);
    }

    return NextResponse.json(digest);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch digest", detail: String(err) },
      { status: 500 }
    );
  }
}
