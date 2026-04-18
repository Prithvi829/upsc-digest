import * as cheerio from "cheerio";
import { scoreStory, getGSTag } from "./ranker";

export type DigestStory = {
  title: string;
  url: string;
  source: string;
  summary: string;
  score?: number;
  gs?: string[];
  starred?: boolean;
};

export type Digest = {
  date: string;
  stories: DigestStory[];
};

export async function generateDigest(): Promise<Digest> {
  const insights = await scrapeInsights();
  const drishti = await scrapeDrishti();
  const express = await scrapeIndianExpress();

  console.log("INSIGHTS:", insights.length);
  console.log("DRISHTI:", drishti.length);
  console.log("EXPRESS:", express.length);

  const allStories = [...insights, ...drishti, ...express];

  const ranked = allStories
  .map((story) => {
    const score = scoreStory(story.title);

    return {
      ...story,
      score,
      gs: getGSTag(story.title),
      starred: score >= 3, // ⭐ logic
    };
  })
  .filter((s) => s.score !== undefined)
  .sort((a, b) => (b.score! - a.score!));

  const seen = new Set<string>();

  const unique = ranked.filter((s) => {
    const key = s.title.toLowerCase().slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const date = new Date().toISOString().split("T")[0];

  return {
    date,
    stories: unique.slice(0, 8),
  };
}

// ------------------ INSIGHTS IAS ------------------
async function scrapeInsights(): Promise<DigestStory[]> {
  const url = "https://www.insightsonindia.com/current-affairs-upsc/";

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    next: { revalidate: 0 },
  });

  const html = await res.text();
  const $ = cheerio.load(html);

  const stories: DigestStory[] = [];

  $("article").each((_, el) => {
    const title = $(el).find("h2, h3").first().text().trim();
    const link = $(el).find("a").first().attr("href");

    if (!title || title.length < 10) return;

    stories.push({
      title,
      url: link || "",
      source: "Insights IAS",
      summary: "Click to read full article",
    });

    if (stories.length >= 50) return false;
  });

  return stories;
}

// ------------------ DRISHTI IAS ------------------
async function scrapeDrishti(): Promise<DigestStory[]> {
  const url = "https://www.drishtiias.com/current-affairs-news-analysis-editorials";

  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const stories: DigestStory[] = [];

  $("h3").each((_, el) => {
    const title = $(el).text().trim();
    const link = $(el).find("a").attr("href");

    if (!title || title.length < 20) return;

    stories.push({
      title,
      url: link ? "https://www.drishtiias.com" + link : "",
      source: "Drishti IAS",
      summary: "Click to read full article",
    });

    if (stories.length >= 20) return false;
  });

  return stories;
}

// ------------------ INDIAN EXPRESS ------------------
async function scrapeIndianExpress(): Promise<DigestStory[]> {
  const url = "https://indianexpress.com/section/explained/";

  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const stories: DigestStory[] = [];

  $("h2").each((_, el) => {
    const title = $(el).text().trim();
    const link = $(el).find("a").attr("href");

    if (!title || title.length < 20) return;

    stories.push({
      title,
      url: link || "",
      source: "Indian Express",
      summary: "Click to read full article",
    });

    if (stories.length >= 20) return false;
  });

  return stories;
}
console.log("INSIGHTS:", insights.length);
console.log("DRISHTI:", drishti.length);
console.log("EXPRESS:", express.length);