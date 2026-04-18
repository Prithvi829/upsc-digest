export const UPSC_KEYWORDS = [
  "india", "government", "policy", "economy", "environment",
  "climate", "supreme court", "parliament", "constitution",
  "defence", "security", "technology", "ai", "space", "isro",
  "health", "education", "scheme", "international", "relations"
];

export function scoreStory(title: string): number {
  let score = 0;
  const lower = title.toLowerCase();

  for (const keyword of UPSC_KEYWORDS) {
    if (lower.includes(keyword)) score += 2;
  }

  if (lower.includes("india")) score += 1;

  return score;
}

export function getGSTag(title: string): string[] {
  const t = title.toLowerCase();
  const tags: string[] = [];

  if (t.includes("history") || t.includes("culture"))
    tags.push("GS1");

  if (t.includes("constitution") || t.includes("parliament") || t.includes("governance"))
    tags.push("GS2");

  if (t.includes("economy") || t.includes("environment") || t.includes("technology"))
    tags.push("GS3");

  if (t.includes("ethics") || t.includes("integrity"))
    tags.push("GS4");

  return tags.length ? tags : ["GS3"];
}