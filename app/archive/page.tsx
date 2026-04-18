"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ArchivePage() {
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/digest?list=1")
      .then(r => r.json())
      .then(d => { setDates(d.dates || []); setLoading(false); });
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
      <header style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "0.5px solid var(--border)" }}>
        <Link href="/" style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
          ← Back to today
        </Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, marginTop: 12 }}>
          Past Digests
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>30-day archive for revision</p>
      </header>

      {loading ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading archive...</p>
      ) : dates.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No past digests yet — check back tomorrow.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {dates.map((date, i) => (
            <Link key={date} href={`/?date=${date}`}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "var(--surface)", border: "0.5px solid var(--border)",
                borderRadius: "var(--radius)", padding: "0.9rem 1.25rem",
                transition: "border-color 0.2s",
                animation: `fadeUp 0.4s ease ${i * 0.04}s forwards`,
                opacity: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-hover)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <span style={{ fontSize: 14, color: "var(--text)", fontFamily: "var(--font-display)", fontWeight: 600 }}>
                {formatDate(date)}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                {date} →
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
