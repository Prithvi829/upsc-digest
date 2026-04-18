import { Redis } from "@upstash/redis";
import type { Digest } from "./scraper";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function saveDigest(digest: Digest): Promise<void> {
  const key = `digest:${digest.date}`;
  await redis.set(key, JSON.stringify(digest), { ex: 60 * 60 * 24 * 30 });
  await redis.set("digest:latest", digest.date);
}

export async function getDigest(date: string): Promise<Digest | null> {
  const key = `digest:${date}`;
  const raw = await redis.get<string>(key);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : (raw as Digest);
}

export async function getLatestDigest(): Promise<Digest | null> {
  const date = await redis.get<string>("digest:latest");
  if (!date) return null;
  return getDigest(date);
}

export async function listDigestDates(): Promise<string[]> {
  const keys = await redis.keys("digest:20*");
  return keys
    .map((k: string) => k.replace("digest:", ""))
    .sort()
    .reverse()
    .slice(0, 30);
}