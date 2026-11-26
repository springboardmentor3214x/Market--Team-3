import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Radio,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Newspaper,
  CheckCircle2,
  Building2,
  Sparkles,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  Scale,
  RefreshCw,
} from "lucide-react";

export default function NewsAnalysisModal({ isOpen, onClose, newsData, ticker }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("ALL"); // ALL, Positive, Negative, Neutral
  const [sourceFilter, setSourceFilter] = useState("ALL"); // ALL, official, news
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  if (!isOpen || !newsData) return null;

  const articles = newsData.articles || [];
  const breakdown = newsData.sentiment_breakdown || {};
  const companyName = newsData.company_name || ticker;
  const corporateEvents = newsData.corporate_events_detailed || [];
  const conflictingReports = newsData.conflicting_reports || [];

  // Extract unique categories for filter dropdown
  const availableCategories = useMemo(() => {
    const cats = new Set();
    articles.forEach((a) => {
      if (a.event_category) cats.add(a.event_category);
    });
    return Array.from(cats);
  }, [articles]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = art.title?.toLowerCase().includes(query);
        const matchesSummary = art.summary?.toLowerCase().includes(query);
        const matchesPublisher = art.publisher?.toLowerCase().includes(query);
        const matchesCat = art.event_category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSummary && !matchesPublisher && !matchesCat) {
          return false;
        }
      }

      // Sentiment filter
      if (sentimentFilter !== "ALL" && art.sentiment !== sentimentFilter) {
        return false;
      }

      // Source type filter
      if (sourceFilter === "official" && !art.is_official_announcement) {
        return false;
      }
      if (sourceFilter === "news" && art.is_official_announcement) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "ALL" && art.event_category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [articles, searchTerm, sentimentFilter, sourceFilter, categoryFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setSentimentFilter("ALL");
    setSourceFilter("ALL");
    setCategoryFilter("ALL");
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === "Positive" || sentiment === "Bullish") return "#00ff87";
    if (sentiment === "Negative" || sentiment === "Bearish") return "#ef4444";
    return "#38bdf8";
  };

  const getSentimentBg = (sentiment) => {
    if (sentiment === "Positive" || sentiment === "Bullish") return "rgba(0, 255, 135, 0.12)";
    if (sentiment === "Negative" || sentiment === "Bearish") return "rgba(239, 68, 68, 0.12)";
    return "rgba(56, 189, 248, 0.12)";
  };

  const getSentimentBorder = (sentiment) => {
    if (sentiment === "Positive" || sentiment === "Bullish") return "rgba(0, 255, 135, 0.35)";
    if (sentiment === "Negative" || sentiment === "Bearish") return "rgba(239, 68, 68, 0.35)";
    return "rgba(56, 189, 248, 0.35)";
  };

  return (
    <AnimatePresence>
      <div className="ws-modal-backdrop" onClick={onClose} style={{ zIndex: 1000 }}>
        <motion.div
          className="ws-modal-content ws-glass-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 25 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{ maxWidth: "1020px", width: "95%", maxHeight: "92vh", overflowY: "auto" }}
        >
          {/* Header */}
          <div className="ws-card-header" style={{ marginBottom: "16px" }}>
            <div className="ws-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Radio size={20} color="#2dd4bf" className="ws-pulse-icon" />
              <span>
                Module 5: News & Sentiment Intelligence Studio —{" "}
                <span style={{ color: "#2dd4bf" }}>{ticker}</span>
                {companyName && companyName !== ticker && (
                  <span style={{ fontSize: "13px", color: "var(--ws-text-secondary)", fontWeight: 400, marginLeft: "6px" }}>
                    ({companyName})
                  </span>
                )}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                className="ws-count-badge"
                style={{
                  color: getSentimentColor(newsData.overall_sentiment_label),
                  borderColor: getSentimentBorder(newsData.overall_sentiment_label),
                  background: getSentimentBg(newsData.overall_sentiment_label),
                }}
              >
                Market Mood: {newsData.overall_sentiment_label}
              </span>
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#cbd5e1",
                  borderRadius: "6px",
                  padding: "4px",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Top Sentiment HUD Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            {/* Overall Score */}
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(15, 23, 42, 0.75)",
                border: "1px solid var(--ws-border-glass-subtle)",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "11px", color: "var(--ws-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                AGGREGATE SENTIMENT SCORE
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <strong
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    fontFamily: "var(--ws-font-mono)",
                    color: getSentimentColor(newsData.overall_sentiment_label),
                  }}
                >
                  {newsData.average_sentiment_score > 0 ? `+${newsData.average_sentiment_score}` : newsData.average_sentiment_score}
                </strong>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: getSentimentColor(newsData.overall_sentiment_label),
                  }}
                >
                  {newsData.overall_sentiment_label}
                </span>
              </div>
              <span style={{ fontSize: "10px", color: "var(--ws-text-muted)" }}>
                Calculated across {newsData.total_articles_analyzed} verified publications
              </span>
            </div>

            {/* Sentiment Breakdown Badges */}
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(15, 23, 42, 0.75)",
                border: "1px solid var(--ws-border-glass-subtle)",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "11px", color: "var(--ws-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                SENTIMENT POLARITY
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setSentimentFilter(sentimentFilter === "Positive" ? "ALL" : "Positive")}
                  style={{
                    padding: "4px 9px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "var(--ws-font-mono)",
                    cursor: "pointer",
                    border: "1px solid rgba(0, 255, 135, 0.3)",
                    background: sentimentFilter === "Positive" ? "rgba(0, 255, 135, 0.25)" : "rgba(0, 255, 135, 0.08)",
                    color: "#00ff87",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <TrendingUp size={12} /> Positive: {breakdown.Positive || 0}
                </button>
                <button
                  type="button"
                  onClick={() => setSentimentFilter(sentimentFilter === "Negative" ? "ALL" : "Negative")}
                  style={{
                    padding: "4px 9px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "var(--ws-font-mono)",
                    cursor: "pointer",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    background: sentimentFilter === "Negative" ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.08)",
                    color: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <TrendingDown size={12} /> Negative: {breakdown.Negative || 0}
                </button>
                <button
                  type="button"
                  onClick={() => setSentimentFilter(sentimentFilter === "Neutral" ? "ALL" : "Neutral")}
                  style={{
                    padding: "4px 9px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "var(--ws-font-mono)",
                    cursor: "pointer",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    background: sentimentFilter === "Neutral" ? "rgba(148, 163, 184, 0.25)" : "rgba(148, 163, 184, 0.08)",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Minus size={12} /> Neutral: {breakdown.Neutral || 0}
                </button>
              </div>
            </div>

            {/* Source Classification Badges */}
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(15, 23, 42, 0.75)",
                border: "1px solid var(--ws-border-glass-subtle)",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "11px", color: "var(--ws-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                SOURCE AUTHENTICITY
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setSourceFilter(sourceFilter === "official" ? "ALL" : "official")}
                  style={{
                    padding: "4px 9px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "var(--ws-font-mono)",
                    cursor: "pointer",
                    border: "1px solid rgba(99, 102, 241, 0.4)",
                    background: sourceFilter === "official" ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.1)",
                    color: "#818cf8",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Building2 size={12} /> Official: {newsData.official_announcements_count || 0}
                </button>
                <button
                  type="button"
                  onClick={() => setSourceFilter(sourceFilter === "news" ? "ALL" : "news")}
                  style={{
                    padding: "4px 9px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "var(--ws-font-mono)",
                    cursor: "pointer",
                    border: "1px solid rgba(56, 189, 248, 0.4)",
                    background: sourceFilter === "news" ? "rgba(56, 189, 248, 0.3)" : "rgba(56, 189, 248, 0.1)",
                    color: "#38bdf8",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Newspaper size={12} /> News Media: {newsData.news_reports_count || 0}
                </button>
              </div>
            </div>
          </div>

          {/* Conflicting Reports Alert Box */}
          {newsData.conflicting_reports_flag && (
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                borderRadius: "10px",
                marginBottom: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f59e0b", fontWeight: 600, fontSize: "13px" }}>
                <AlertCircle size={17} />
                <span>Conflicting News Reports Identified</span>
              </div>
              <p style={{ fontSize: "12px", color: "#e2e8f0", margin: 0, lineHeight: 1.5 }}>
                {newsData.conflicting_notes}
              </p>
              {conflictingReports.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                  {conflictingReports.map((cr, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 12px",
                        background: "rgba(0, 0, 0, 0.35)",
                        borderRadius: "8px",
                        fontSize: "11px",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <span style={{ color: "#00ff87", fontWeight: 600 }}>Perspective A ({cr.source_a_name}):</span>
                        <div style={{ color: "#cbd5e1", marginTop: "2px" }}>{cr.source_a_claim}</div>
                        <a
                          href={cr.source_a_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#2dd4bf", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px" }}
                        >
                          Source Link <ExternalLink size={10} />
                        </a>
                      </div>
                      <div>
                        <span style={{ color: "#ef4444", fontWeight: 600 }}>Perspective B ({cr.source_b_name}):</span>
                        <div style={{ color: "#cbd5e1", marginTop: "2px" }}>{cr.source_b_claim}</div>
                        <a
                          href={cr.source_b_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#2dd4bf", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px" }}
                        >
                          Source Link <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Uncertain Information Alert */}
          {newsData.uncertain_reports_flag && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                background: "rgba(217, 119, 6, 0.1)",
                border: "1px solid rgba(217, 119, 6, 0.3)",
                borderRadius: "8px",
                marginBottom: "16px",
                color: "#fbbf24",
                fontSize: "12px",
              }}
            >
              <AlertTriangle size={16} />
              <span>{newsData.uncertain_notes}</span>
            </div>
          )}

          {/* Corporate Events Summary Highlights */}
          {corporateEvents.length > 0 && (
            <div style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontSize: "12px", fontWeight: 600, color: "var(--ws-text-primary)" }}>
                <Sparkles size={14} color="#2dd4bf" />
                <span>Important Corporate Events Identified</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
                {corporateEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "12px",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid var(--ws-border-glass-subtle)",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: "4px",
                          background: "rgba(45, 212, 191, 0.15)",
                          color: "#2dd4bf",
                          border: "1px solid rgba(45, 212, 191, 0.3)",
                        }}
                      >
                        {evt.category}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: getSentimentColor(evt.sentiment),
                        }}
                      >
                        {evt.sentiment}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--ws-text-primary)" }}>
                      {evt.headline}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--ws-text-secondary)", lineHeight: 1.4 }}>
                      💡 <strong style={{ color: "#38bdf8" }}>Business Relevance:</strong> {evt.significance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              marginBottom: "14px",
              flexWrap: "wrap",
            }}
          >
            {/* Search Input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(5, 8, 14, 0.8)",
                border: "1px solid var(--ws-border-glass-subtle)",
                borderRadius: "8px",
                padding: "6px 12px",
                flex: "1 1 240px",
              }}
            >
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search headlines, keywords, publishers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#f8fafc",
                  fontSize: "12px",
                  width: "100%",
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: 0 }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Quick Category Filter */}
            {availableCategories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid var(--ws-border-glass-subtle)",
                  borderRadius: "8px",
                  color: "#cbd5e1",
                  fontSize: "11px",
                  padding: "6px 10px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            {/* Active Filters Clear Button */}
            {(searchTerm || sentimentFilter !== "ALL" || sourceFilter !== "ALL" || categoryFilter !== "ALL") && (
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  borderRadius: "6px",
                  fontSize: "11px",
                  padding: "6px 10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <RefreshCw size={11} /> Reset Filters
              </button>
            )}
          </div>

          {/* Article Count / Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", fontSize: "11px", color: "var(--ws-text-muted)" }}>
            <span>
              Showing {filteredArticles.length} of {articles.length} news items
            </span>
            <span>All articles deduplicated & verified against corporate identifiers</span>
          </div>

          {/* Article List */}
          {filteredArticles.length === 0 ? (
            <div
              style={{
                padding: "36px 16px",
                textAlign: "center",
                background: "rgba(5, 8, 14, 0.5)",
                border: "1px dashed var(--ws-border-glass-subtle)",
                borderRadius: "10px",
                color: "var(--ws-text-muted)",
              }}
            >
              <AlertCircle size={24} style={{ margin: "0 auto 8px auto", opacity: 0.6 }} />
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--ws-text-secondary)" }}>
                No articles match your active filter
              </div>
              <p style={{ fontSize: "11px", marginTop: "4px" }}>
                Try adjusting your search query, sentiment filter, or category selection.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  marginTop: "12px",
                  background: "rgba(45, 212, 191, 0.15)",
                  border: "1px solid #2dd4bf",
                  color: "#2dd4bf",
                  borderRadius: "6px",
                  padding: "5px 12px",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: art.is_official_announcement
                      ? "rgba(15, 23, 42, 0.75)"
                      : "rgba(5, 8, 14, 0.65)",
                    border: art.is_conflicting
                      ? "1px solid rgba(245, 158, 11, 0.45)"
                      : art.is_official_announcement
                      ? "1px solid rgba(99, 102, 241, 0.35)"
                      : "1px solid var(--ws-border-glass-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    transition: "border 0.2s ease",
                  }}
                >
                  {/* Article Badges Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {/* Official Announcement vs News Report Badge */}
                      {art.is_official_announcement ? (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "5px",
                            textTransform: "uppercase",
                            fontFamily: "var(--ws-font-mono)",
                            background: "rgba(99, 102, 241, 0.18)",
                            color: "#818cf8",
                            border: "1px solid rgba(99, 102, 241, 0.4)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Building2 size={11} /> Official Disclosure
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "5px",
                            textTransform: "uppercase",
                            fontFamily: "var(--ws-font-mono)",
                            background: "rgba(56, 189, 248, 0.15)",
                            color: "#38bdf8",
                            border: "1px solid rgba(56, 189, 248, 0.3)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Newspaper size={11} /> Financial News
                        </span>
                      )}

                      {/* Verification Status */}
                      {art.verification_status === "Unconfirmed Rumor" ? (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "2px 7px",
                            borderRadius: "5px",
                            background: "rgba(245, 158, 11, 0.15)",
                            color: "#f59e0b",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <AlertTriangle size={10} /> Unconfirmed
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "2px 7px",
                            borderRadius: "5px",
                            background: "rgba(0, 255, 135, 0.08)",
                            color: "#00ff87",
                            border: "1px solid rgba(0, 255, 135, 0.2)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      )}

                      {/* Event Category Tag */}
                      {art.event_category && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "2px 7px",
                            borderRadius: "5px",
                            background: "rgba(255, 255, 255, 0.05)",
                            color: "var(--ws-text-secondary)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          {art.event_category}
                        </span>
                      )}
                    </div>

                    {/* Sentiment Pill */}
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: "6px",
                        textTransform: "uppercase",
                        fontFamily: "var(--ws-font-mono)",
                        background: getSentimentBg(art.sentiment),
                        color: getSentimentColor(art.sentiment),
                        border: `1px solid ${getSentimentBorder(art.sentiment)}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {art.sentiment} ({art.sentiment_score > 0 ? `+${art.sentiment_score}` : art.sentiment_score})
                    </span>
                  </div>

                  {/* Headline / Title */}
                  <a
                    href={art.source_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--ws-text-primary)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "flex-start",
                      gap: "6px",
                      lineHeight: 1.4,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#2dd4bf")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ws-text-primary)")}
                  >
                    <span>{art.title}</span>
                    <ExternalLink size={13} color="#2dd4bf" style={{ flexShrink: 0, marginTop: "3px" }} />
                  </a>

                  {/* Meaningful Summary */}
                  <p style={{ fontSize: "12px", color: "var(--ws-text-secondary)", margin: "2px 0", lineHeight: 1.5 }}>
                    {art.summary}
                  </p>

                  {/* Business Impact / Relevance Callout */}
                  {art.business_impact && (
                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        background: "rgba(45, 212, 191, 0.06)",
                        borderLeft: "3px solid #2dd4bf",
                        fontSize: "11px",
                        color: "#cbd5e1",
                        lineHeight: 1.45,
                      }}
                    >
                      💡 <strong style={{ color: "#2dd4bf" }}>Business Relevance:</strong> {art.business_impact}
                    </div>
                  )}

                  {/* Sentiment Drivers Keywords */}
                  {art.keywords && art.keywords.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "2px" }}>
                      <span style={{ fontSize: "10px", color: "var(--ws-text-muted)" }}>Key Signals:</span>
                      {art.keywords.map((kw, kidx) => (
                        <span
                          key={kidx}
                          style={{
                            fontSize: "9px",
                            fontFamily: "var(--ws-font-mono)",
                            padding: "1px 6px",
                            borderRadius: "4px",
                            background: "rgba(255, 255, 255, 0.05)",
                            color: "var(--ws-text-secondary)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                          }}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Info Row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "11px",
                      color: "var(--ws-text-muted)",
                      paddingTop: "6px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                      marginTop: "2px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <span>
                      Publisher: <strong style={{ color: "var(--ws-text-secondary)" }}>{art.publisher}</strong>
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={11} /> {new Date(art.published_date).toLocaleDateString()}
                      </span>
                      <a
                        href={art.source_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#2dd4bf",
                          textDecoration: "none",
                          fontSize: "10px",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        Read Original ↗
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compliance Disclaimer Footer */}
          <div
            style={{
              marginTop: "20px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(15, 23, 42, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              color: "var(--ws-text-muted)",
            }}
          >
            <Scale size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
            <span>
              <strong>Module 5 Research Disclaimer:</strong> This agent analyzes financial news, official disclosures, and contextual sentiment for informational stock research. It does not provide stock price forecasts or investment recommendations.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
