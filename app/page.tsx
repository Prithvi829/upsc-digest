"use client";
import { useEffect, useState } from "react";
import type { Digest, DigestStory } from "@/lib/scraper";

const paperColors: Record<string, { bg: string; text: string }> = {
  GS1: { bg: "rgba(154,125,232,0.15)", text: "#b89ff0" },
  GS2: { bg: "rgba(90,143,224,0.15)", text: "#7aaae8" },
  GS3: { bg: "rgba(90,171,122,0.15)", text: "#7acf9a" },
  GS4: { bg: "rgba(201,168,76,0.15)", text: "#d4b76a" },
  Prelims: { bg: "rgba(224,90,90,0.15)", text: "#e88080" },
};

function Badge({ paper }: { paper: string }) {
  const { bg, text } = paperColors[paper];
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 500,
      padding: "2px 9px", borderRadius: 20,
      background: bg, color: text, fontFamily: "var(--font-mono)",
      letterSpacing: "0.02em",
    }}>
      {paper}
    </span>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: 11, color: "var(--text-muted)",
      background: "var(--surface2)", padding: "2px 8px",
      borderRadius: 20, border: "0.5px solid var(--border)",
    }}>
      {label}
    </span>
  );
}

function StoryCard({ story, index }: { story: DigestStory; index: number }) {
  return (
    <a href={story.url} target="_blank" rel="noopener noreferrer"
      className="fade-up"
      style={{
        display: "block",
        background: "var(--surface)",
        border: story.starred
          ? "1px solid rgba(201,168,76,0.35)"
          : "0.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem 1.5rem",
        transition: "border-color 0.2s, transform 0.2s",
        cursor: "pointer",
        textDecoration: "none",
        animationDelay: `${index * 0.06}s`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = story.starred
          ? "rgba(201,168,76,0.7)" : "rgba(255,255,255,0.2)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = story.starred
          ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(14px, 2.2vw, 16px)",
          fontWeight: 600, color: "var(--text)", lineHeight: 1.45, flex: 1,
        }}>
          {story.starred && (
            <span style={{ color: "var(--accent)", marginRight: 6, fontSize: 13 }}>★</span>
          )}
          {story.title}
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, flexShrink: 0 }}>
          {story.gs?.map(p => <Badge key={p} paper={p} />)}
        </div>
      </div>

      {/* Summary */}
      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 12 }}>
        {story.summary}
      </p>

     {false && (
  <div></div>
)}
    </a>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      margin: "2rem 0 1rem",
    }}>
      <span style={{
        fontSize: 10, fontWeight: 500, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--text-dim)",
        fontFamily: "var(--font-mono)", whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
    </div>
  );
}

function groupByPaper(stories: DigestStory[]) {
  const sections: { label: string; stories: DigestStory[] }[] = [
    { label: "Polity & Governance — GS 2", stories: stories.filter(s => s.papers.includes("GS2") && !s.papers.includes("GS3")) },
    { label: "Economy & Technology — GS 3", stories: stories.filter(s => s.papers.includes("GS3")) },
    { label: "History, Culture & Geography — GS 1", stories: stories.filter(s => s.papers.includes("GS1")) },
    { label: "Ethics & Society — GS 4", stories: stories.filter(s => s.papers.includes("GS4")) },
    { label: "Prelims spotlight", stories: stories.filter(s => s.papers.includes("Prelims") && !s.papers.includes("GS2") && !s.papers.includes("GS3")) },
  ];
  return sections.filter(s => s.stories.length > 0);
}

function SkeletonCard() {
  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "1.25rem 1.5rem", border: "0.5px solid var(--border)" }}>
      <div className="skeleton" style={{ height: 18, width: "70%", marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 13, width: "100%", marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 13, width: "80%", marginBottom: 14 }} />
      <div style={{ display: "flex", gap: 6 }}>
        <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 20 }} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDigest = async (date?: string) => {
    try {
      const url = date ? `/api/digest?date=${date}` : "/api/digest";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDigest(data);
    } catch (e) {
      setError("Could not load today's digest. Try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetch("/api/generate");
    await fetchDigest();
  };

  useEffect(() => { fetchDigest(); }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const starred = digest?.stories.filter(s => s.starred) ?? [];
  const sections = digest ? groupByPaper(digest.stories) : [];

  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>

      {/* Header */}
      <header style={{ marginBottom: "2.5rem", paddingBottom: "1.5rem", borderBottom: "0.5px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              UPSC Current Affairs
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 700, color: "var(--text)", lineHeight: 1.15 }}>
              Daily Digest
            </h1>
            {digest && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
                {formatDate(digest.date)} &nbsp;·&nbsp; {digest.stories.length} stories
              </p>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              background: "transparent", border: "0.5px solid var(--border-hover)",
              color: "var(--text-muted)", borderRadius: "var(--radius)",
              padding: "8px 16px", fontSize: 12, cursor: "pointer",
              fontFamily: "var(--font-body)", transition: "all 0.2s",
              opacity: refreshing ? 0.5 : 1,
            }}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(224,90,90,0.1)", border: "0.5px solid rgba(224,90,90,0.3)", borderRadius: "var(--radius)", padding: "1rem 1.25rem", color: "#e88080", marginBottom: "1.5rem", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Content */}
      {!loading && digest && (
        <>
          {/* Starred highlight strip */}
          {starred.length > 0 && (
            <>
              <SectionDivider label="★ High priority for exam" />
              <div style={{ background: "var(--accent-dim)", border: "0.5px solid rgba(201,168,76,0.2)", borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem", marginBottom: "0.5rem" }}>
                {starred.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "4px 0", borderBottom: i < starred.length - 1 ? "0.5px solid rgba(201,168,76,0.1)" : "none" }}>
                    <span style={{ color: "var(--accent)", fontSize: 12 }}>★</span>
                    <a href={s.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, fontFamily: "var(--font-display)", fontWeight: 600 }}>
                      {s.title}
                    </a>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {s.papers.map(p => <Badge key={p} paper={p} />)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.label}>
              <SectionDivider label={section.label} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {section.stories.map((story, i) => (
                  <StoryCard key={i} story={story} index={i} />
                ))}
              </div>
            </div>
          ))}

          {/* Footer */}
          <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "0.5px solid var(--border)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
              Source: Insights IAS &nbsp;·&nbsp; Auto-updated at 6 AM IST
            </p>
            <a href="/archive" style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "underline" }}>
              Past digests →
            </a>
          </div>
        </>
      )}
    </main>
  );
}
