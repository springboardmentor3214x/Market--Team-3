import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Radio, AlertCircle, Calendar, Newspaper } from "lucide-react";

export default function NewsAnalysisModal({ isOpen, onClose, newsData, ticker }) {
  if (!isOpen || !newsData) return null;

  const articles = newsData.articles || [];
  const breakdown = newsData.sentiment_breakdown || {};

  return (
    <AnimatePresence>
      <div className="ws-modal-backdrop" onClick={onClose}>
        <motion.div
          className="ws-modal-content ws-glass-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 25 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{ maxWidth: "880px", width: "95%", maxHeight: "90vh", overflowY: "auto" }}
        >
          {/* Header */}
          <div className="ws-card-header" style={{ marginBottom: "16px" }}>
            <div className="ws-card-title">
              <Radio size={18} color="#10b981" />
              <span>Verified News Intelligence & Sentiment — {ticker}</span>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Sentiment Summary Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "rgba(0, 255, 135, 0.05)",
              border: "1px solid var(--ws-border-glass-subtle)",
              borderRadius: "10px",
              marginBottom: "18px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", color: "var(--ws-text-muted)", display: "block" }}>OVERALL SENTIMENT</span>
              <strong style={{ fontSize: "16px", color: newsData.overall_sentiment_label === "Bullish" ? "#00ff87" : newsData.overall_sentiment_label === "Bearish" ? "#ef4444" : "#38bdf8" }}>
                {newsData.overall_sentiment_label} (Score: {newsData.average_sentiment_score})
              </strong>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <span className="ws-count-badge" style={{ color: "#00ff87", borderColor: "rgba(0, 255, 135, 0.3)" }}>
                Positive: {breakdown.Positive || 0}
              </span>
              <span className="ws-count-badge" style={{ color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }}>
                Negative: {breakdown.Negative || 0}
              </span>
              <span className="ws-count-badge">
                Neutral: {breakdown.Neutral || 0}
              </span>
            </div>
          </div>

          {/* Conflicting reports alert */}
          {newsData.conflicting_reports_flag && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "8px",
                marginBottom: "16px",
                color: "#f59e0b",
                fontSize: "12px",
              }}
            >
              <AlertCircle size={16} />
              <span>{newsData.conflicting_notes}</span>
            </div>
          )}

          {/* Article List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {articles.map((art) => (
              <div
                key={art.id}
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "rgba(5, 8, 14, 0.6)",
                  border: "1px solid var(--ws-border-glass-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
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
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff87")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ws-text-primary)")}
                  >
                    <span>{art.title}</span>
                    <ExternalLink size={13} color="#00ff87" />
                  </a>

                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      textTransform: "uppercase",
                      fontFamily: "var(--ws-font-mono)",
                      background:
                        art.sentiment === "Positive"
                          ? "rgba(0, 255, 135, 0.12)"
                          : art.sentiment === "Negative"
                          ? "rgba(239, 68, 68, 0.12)"
                          : "rgba(100, 116, 139, 0.15)",
                      color:
                        art.sentiment === "Positive"
                          ? "#00ff87"
                          : art.sentiment === "Negative"
                          ? "#ef4444"
                          : "#94a3b8",
                      border: `1px solid ${
                        art.sentiment === "Positive"
                          ? "rgba(0, 255, 135, 0.3)"
                          : art.sentiment === "Negative"
                          ? "rgba(239, 68, 68, 0.3)"
                          : "rgba(100, 116, 139, 0.3)"
                      }`,
                    }}
                  >
                    {art.sentiment} ({art.sentiment_score > 0 ? `+${art.sentiment_score}` : art.sentiment_score})
                  </span>
                </div>

                <p style={{ fontSize: "12px", color: "var(--ws-text-secondary)", margin: "4px 0" }}>
                  {art.summary}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--ws-text-muted)" }}>
                  <span>Publisher: <strong style={{ color: "var(--ws-text-secondary)" }}>{art.publisher}</strong> • Category: <strong style={{ color: "var(--ws-accent-cyan)" }}>{art.event_category}</strong></span>
                  <span>{new Date(art.published_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
