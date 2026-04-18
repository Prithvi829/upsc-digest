import * as cheerio from "cheerio";

export type GsPaper = "GS1" | "GS2" | "GS3" | "GS4" | "Prelims";

export interface DigestStory {
  title: string;
  summary: string;
  tags: string[];
  papers: GsPaper[];
  starred: boolean;
  source: string;
  url: string;
}

export interface Digest {
  date: string;
  stories: DigestStory[];
  generatedAt: string;
}

// keyword → GS paper mapping
const paperMap: { keywords: string[]; paper: GsPaper }[] = [
  {
    keywords: [
      "polity", "constitution", "parliament", "supreme court", "election",
      "governance", "bill", "act", "amendment", "fundamental rights",
      "federalism", "panchayat", "judiciary", "lok sabha", "rajya sabha",
      "president", "governor", "delimitation", "reservation", "tribunal",
    ],
    paper: "GS2",
  },
  {
    keywords: [
      "economy", "gdp", "inflation", "rbi", "budget", "tax", "infrastructure",
      "agriculture", "industry", "trade", "exports", "imports", "startup",
      "msme", "semiconductor", "manufacturing", "energy", "ev", "cafe",
      "fuel", "digital", "space", "isro", "technology", "cyber", "ai",
      "environment", "climate", "biodiversity", "forest", "pollution",
      "wildlife", "carbon", "emission", "river", "ocean", "species",
    ],
    paper: "GS3",
  },
  {
    keywords: [
      "foreign policy", "bilateral", "treaty", "un", "nato", "brics", "sco",
      "asean", "g20", "imf", "world bank", "china", "pakistan", "us",
      "russia", "diplomacy", "sanctions", "international", "global",
    ],
    paper: "GS2",
  },
  {
    keywords: [
      "history", "culture", "art", "heritage", "geography", "disaster",
      "cyclone", "earthquake", "flood", "society", "tribe", "religion",
      "festival", "language", "migration", "urbanisation",
    ],
    paper: "GS1",
  },
  {
    keywords: [
      "ethics", "integrity", "corruption", "transparency", "accountability",
      "civil service", "values", "attitude", "emotional intelligence",
    ],
    paper: "GS4",
  },
  {
    keywords: [
      "prelims", "species", "place in news", "index", "report", "rank",
      "scheme", "mission", "portal", "app", "award", "summit",
    ],
    paper: "Prelims",
  },
];

// starred topics — high-value for exam
const starredKeywords = [
  "constitution", "amendment", "supreme court", "rbi", "budget",
  "climate", "environment", "foreign policy", "brics", "election",
  "delimitation", "reservation", "isro", "semiconductor",
];

function inferPapers(text: string): GsPaper[] {
  const lower = text.toLowerCase();
  const found = new Set<GsPaper>();
  for (const { keywords, paper } of paperMap) {
    if (keywords.some((kw) => lower.includes(kw))) {
      found.add(paper);
    }
  }
  return found.size > 0 ? Array.from(found).slice(0, 2) : ["GS2"];
}

function inferStarred(text: string): boolean {
  const lower = text.toLowerCase();
  return starredKeywords.some((kw) => lower.includes(kw));
}

function extractTags(text: string): string[] {
  const lower = text.toLowerCase();
  const allTags = [
    "Constitution", "Parliament", "Supreme Court", "Election Commission",
    "RBI", "Budget", "Climate", "Environment", "ISRO", "Semiconductor",
    "BRICS", "SCO", "G20", "Delimitation", "Women's Reservation",
    "Federalism", "Polity", "Economy", "Biodiversity", "Cyber Security",
    "Agriculture", "Infrastructure", "Foreign Policy", "India-China",
    "Tribal", "Language", "Art & Culture", "Governance", "Social Sector",
  ];
  return allTags
    .filter((tag) => lower.includes(tag.toLowerCase()))
    .slice(0, 4);
}

// Scrape insightsonindia current affairs for today
async function scrapeInsights(): Promise<DigestStory[]> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const url = `https://www.insightsonindia.com/${year}/${month}/${day}/upsc-current-affairs-${day}-${getMonthName(today.getMonth())}-${year}/`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; UPSCDigestBot/1.0)" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    // fallback: scrape the homepage listing
    return scrapeInsightsHomepage();
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const stories: DigestStory[] = [];

  // Extract h2/h3 headings as story titles with following paragraph as summary
  $("h2, h3").each((_, el) => {
    const title = $(el).text().trim();
    if (title.length < 20 || title.length > 200) return;
    if (
      title.toLowerCase().includes("instalinks") ||
      title.toLowerCase().includes("quiz") ||
      title.toLowerCase().includes("click here")
    )
      return;

    const summary =
      $(el).next("p").text().trim().slice(0, 280) ||
      $(el).nextAll("p").first().text().trim().slice(0, 280);

    if (!summary || summary.length < 30) return;

    stories.push({
      title,
      summary: summary + (summary.length === 280 ? "..." : ""),
      tags: extractTags(title + " " + summary),
      papers: inferPapers(title + " " + summary),
      starred: inferStarred(title + " " + summary),
      source: "Insights IAS",
      url,
    });

    if (stories.length >= 10) return false;
  });

  return stories.slice(0, 8);
}

async function scrapeInsightsHomepage(): Promise<DigestStory[]> {
  const url = "https://www.insightsonindia.com/current-affairs-upsc/";
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; UPSCDigestBot/1.0)" },
    next: { revalidate: 0 },
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const stories: DigestStory[] = [];

  $("article, .post").each((_, el) => {
    const title = $(el).find("h2, h3, .entry-title").first().text().trim();
    const summary = $(el).find("p").first().text().trim().slice(0, 280);
    const link =
      $(el).find("a").first().attr("href") ||
      "https://www.insightsonindia.com";

    if (!title || title.length < 15) return;

    stories.push({
      title,
      summary: summary || "Click to read the full story.",
      tags: extractTags(title),
      papers: inferPapers(title),
      starred: inferStarred(title),
      source: "Insights IAS",
      url: link,
    });

    if (stories.length >= 8) return false;
  });

  return stories;
}

function getMonthName(monthIndex: number): string {
  return [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ][monthIndex];
}

export async function generateDigest(): Promise<Digest> {
  const stories = await scrapeInsights();

  // Ensure at least some starred stories
  if (stories.filter((s) => s.starred).length === 0 && stories.length > 0) {
    stories[0].starred = true;
    if (stories[2]) stories[2].starred = true;
  }

  return {
    date: new Date().toISOString().split("T")[0],
    stories,
    generatedAt: new Date().toISOString(),
  };
}
