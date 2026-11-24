import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { X, Activity, TrendingUp, AlertTriangle, ShieldCheck, Info } from "lucide-react";

export default function TechnicalIndicatorsModal({
  isOpen,
  onClose,
  technicalData,
  ticker,
  currency = "INR",
}) {
  const [activeTab, setActiveTab] = useState("overlay"); // 'overlay' | 'rsi' | 'macd'
  const [visibleLines, setVisibleLines] = useState({
    close: true,
    sma_5: true,
    sma_20: true,
    sma_50: true,
    ema_12: true,
    ema_26: false,
  });

  if (!isOpen || !technicalData) return null;

  const series = technicalData.chart_series || [];
  const summary = technicalData.indicators_summary || {};
  const conditions = technicalData.predefined_conditions || [];

  const toggleLine = (lineKey) => {
    setVisibleLines((prev) => ({ ...prev, [lineKey]: !prev[lineKey] }));
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
          style={{ maxWidth: "980px", width: "95%", maxHeight: "92vh", overflowY: "auto" }}
        >
          {/* Header */}
          <div className="ws-card-header" style={{ marginBottom: "14px" }}>
            <div className="ws-card-title">
              <Activity size={18} color="#00e5ff" />
              <span>Module 4: Technical Analysis Agent — {ticker}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                className="ws-count-badge"
                style={{
                  color: summary.primary_trend?.includes("Bullish") || summary.primary_trend?.includes("Upward")
                    ? "#00ff87"
                    : summary.primary_trend?.includes("Bearish") || summary.primary_trend?.includes("Downward")
                    ? "#ef4444"
                    : "#00e5ff",
                  borderColor: "rgba(0, 229, 255, 0.3)",
                }}
              >
                Trend: {summary.primary_trend || "Neutral"}
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

          {/* Module 4 AI Narrative Explanation Box */}
          {technicalData.signal_summary && (
            <div
              style={{
                background: "rgba(0, 229, 255, 0.06)",
                border: "1px solid rgba(0, 229, 255, 0.25)",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <Info size={18} color="#00e5ff" style={{ marginTop: "2px", flexShrink: 0 }} />
              <div>
                <strong style={{ color: "#00e5ff", fontSize: "12px", fontFamily: "var(--ws-font-mono, monospace)" }}>
                  TECHNICAL AGENT MARKET BEHAVIOUR ASSESSMENT:
                </strong>
                <p style={{ margin: "4px 0 0", fontSize: "12px", lineHeight: "1.5", color: "#e2e8f0" }}>
                  {technicalData.signal_summary}
                </p>
              </div>
            </div>
          )}

          {/* Comprehensive Indicator Metrics Grid */}
          <div className="ws-stats-grid" style={{ marginBottom: "16px" }}>
            <div className="ws-stat-card">
              <span className="ws-stat-label">Last Close</span>
              <span className="ws-stat-val">{currency} {summary.current_price?.toFixed(2)}</span>
            </div>
            <div className="ws-stat-card">
              <span className="ws-stat-label">5-Day SMA</span>
              <span className="ws-stat-val" style={{ color: "#fbbf24" }}>
                {summary.sma_5 ? `${currency} ${summary.sma_5.toFixed(2)}` : "N/A (<5d)"}
              </span>
            </div>
            <div className="ws-stat-card">
              <span className="ws-stat-label">20-Day SMA</span>
              <span className="ws-stat-val" style={{ color: "#00e5ff" }}>
                {summary.sma_20 ? `${currency} ${summary.sma_20.toFixed(2)}` : "N/A (<20d)"}
              </span>
            </div>
            <div className="ws-stat-card">
              <span className="ws-stat-label">50-Day SMA</span>
              <span className="ws-stat-val" style={{ color: "#f59e0b" }}>
                {summary.sma_50 ? `${currency} ${summary.sma_50.toFixed(2)}` : "N/A (<50d)"}
              </span>
            </div>
            <div className="ws-stat-card">
              <span className="ws-stat-label">RSI (14-Day)</span>
              <span
                className="ws-stat-val"
                style={{
                  color: summary.rsi_14 >= 70 ? "#ef4444" : summary.rsi_14 <= 30 ? "#00ff87" : "#00e5ff",
                }}
              >
                {summary.rsi_14?.toFixed(1)} <span style={{ fontSize: "10px", color: "#94a3b8" }}>({summary.rsi_condition})</span>
              </span>
            </div>
            <div className="ws-stat-card">
              <span className="ws-stat-label">MACD Momentum</span>
              <span
                className="ws-stat-val"
                style={{
                  color: summary.macd_condition?.includes("Bullish") ? "#00ff87" : "#ef4444",
                  fontSize: "14px",
                }}
              >
                {summary.macd_condition}
              </span>
            </div>
            <div className="ws-stat-card">
              <span className="ws-stat-label">12-Day / 26-Day EMA</span>
              <span className="ws-stat-val" style={{ fontSize: "13px", color: "#c084fc" }}>
                {summary.ema_12?.toFixed(2)} / {summary.ema_26?.toFixed(2)}
              </span>
            </div>
            <div className="ws-stat-card">
              <span className="ws-stat-label">Annualized Volatility</span>
              <span className="ws-stat-val">{summary.historical_volatility_pct}%</span>
            </div>
          </div>

          {/* Chart View Tabs & Line Toggles */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className={`ws-freq-btn ${activeTab === "overlay" ? "active" : ""}`}
                onClick={() => setActiveTab("overlay")}
              >
                Price + Moving Averages (SMA 5/20/50, EMA 12/26)
              </button>
              <button
                type="button"
                className={`ws-freq-btn ${activeTab === "rsi" ? "active" : ""}`}
                onClick={() => setActiveTab("rsi")}
              >
                RSI-14 Momentum Oscillator
              </button>
              <button
                type="button"
                className={`ws-freq-btn ${activeTab === "macd" ? "active" : ""}`}
                onClick={() => setActiveTab("macd")}
              >
                MACD (12, 26, 9) & Histogram
              </button>
            </div>

            {/* Toggle individual lines when on overlay tab */}
            {activeTab === "overlay" && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", marginRight: "4px" }}>Filter:</span>
                {[
                  { key: "close", label: "Close", color: "#00ff87" },
                  { key: "sma_5", label: "5-SMA", color: "#fbbf24" },
                  { key: "sma_20", label: "20-SMA", color: "#00e5ff" },
                  { key: "sma_50", label: "50-SMA", color: "#f59e0b" },
                  { key: "ema_12", label: "12-EMA", color: "#c084fc" },
                  { key: "ema_26", label: "26-EMA", color: "#f472b6" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleLine(item.key)}
                    style={{
                      background: visibleLines[item.key] ? `${item.color}25` : "rgba(255, 255, 255, 0.04)",
                      border: `1px solid ${visibleLines[item.key] ? item.color : "rgba(255, 255, 255, 0.12)"}`,
                      color: visibleLines[item.key] ? item.color : "#64748b",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontFamily: "var(--ws-font-mono, monospace)",
                      cursor: "pointer",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Chart Canvas */}
          <div
            style={{
              width: "100%",
              height: 340,
              background: "rgba(5, 8, 14, 0.65)",
              borderRadius: "10px",
              padding: "14px",
              border: "1px solid var(--ws-border-glass-subtle)",
              marginBottom: "16px",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "overlay" ? (
                <ComposedChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} minTickGap={30} />
                  <YAxis stroke="#64748b" fontSize={10} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 18, 28, 0.95)",
                      border: "1px solid #00ff87",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  {visibleLines.close && (
                    <Line type="monotone" dataKey="close" stroke="#00ff87" strokeWidth={2} dot={false} name="Close" />
                  )}
                  {visibleLines.sma_5 && (
                    <Line type="monotone" dataKey="sma_5" stroke="#fbbf24" strokeWidth={1.5} dot={false} name="5-SMA" />
                  )}
                  {visibleLines.sma_20 && (
                    <Line type="monotone" dataKey="sma_20" stroke="#00e5ff" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="20-SMA" />
                  )}
                  {visibleLines.sma_50 && (
                    <Line type="monotone" dataKey="sma_50" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" name="50-SMA" />
                  )}
                  {visibleLines.ema_12 && (
                    <Line type="monotone" dataKey="ema_12" stroke="#c084fc" strokeWidth={1.2} dot={false} name="12-EMA" />
                  )}
                  {visibleLines.ema_26 && (
                    <Line type="monotone" dataKey="ema_26" stroke="#f472b6" strokeWidth={1.2} dot={false} name="26-EMA" />
                  )}
                </ComposedChart>
              ) : activeTab === "rsi" ? (
                <LineChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} minTickGap={30} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} ticks={[30, 50, 70]} />
                  <ReferenceLine
                    y={70}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    label={{ value: "Overbought (70)", fill: "#ef4444", fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={50}
                    stroke="#64748b"
                    strokeDasharray="2 2"
                    label={{ value: "Neutral (50)", fill: "#64748b", fontSize: 9 }}
                  />
                  <ReferenceLine
                    y={30}
                    stroke="#00ff87"
                    strokeDasharray="3 3"
                    label={{ value: "Oversold (30)", fill: "#00ff87", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 18, 28, 0.95)",
                      border: "1px solid #00e5ff",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Line type="monotone" dataKey="rsi_14" stroke="#00e5ff" strokeWidth={2} dot={false} name="RSI-14" />
                </LineChart>
              ) : (
                <BarChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} minTickGap={30} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 18, 28, 0.95)",
                      border: "1px solid #10b981",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.2)" />
                  <Bar
                    dataKey="macd_hist"
                    fill="#00ff87"
                    name="MACD Histogram"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Predefined Technical Conditions Identified */}
          <div style={{ marginBottom: "14px" }}>
            <h5
              style={{
                fontSize: "12px",
                color: "var(--ws-text-secondary)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                fontFamily: "var(--ws-font-mono, monospace)",
              }}
            >
              Predefined Conditions & Indicator Signals
            </h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              {conditions.map((cond, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: "12px",
                    color: "var(--ws-text-primary)",
                    padding: "8px 12px",
                    background: "rgba(0, 229, 255, 0.04)",
                    borderLeft: "3px solid #00e5ff",
                    borderRadius: "4px",
                  }}
                >
                  {cond}
                </li>
              ))}
            </ul>
          </div>

          {/* Module 4 Mandatory Legal & Risk Disclaimer */}
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(245, 158, 11, 0.06)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              borderRadius: "6px",
            }}
          >
            <p style={{ margin: 0, fontSize: "11px", color: "#fbbf24", fontStyle: "italic", lineHeight: "1.4" }}>
              {technicalData.disclaimer ||
                "Important: Technical indicators help us understand historical market conditions. They do not guarantee future stock price movements or provide certain predictions."}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
