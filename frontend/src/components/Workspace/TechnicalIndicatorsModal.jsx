import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  BarChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { X, Activity, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";

export default function TechnicalIndicatorsModal({ isOpen, onClose, technicalData, ticker, currency = "INR" }) {
  const [activeTab, setActiveTab] = useState("overlay"); // 'overlay' | 'rsi' | 'macd'

  if (!isOpen || !technicalData) return null;

  const series = technicalData.chart_series || [];
  const summary = technicalData.indicators_summary || {};
  const conditions = technicalData.predefined_conditions || [];

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
          style={{ maxWidth: "900px", width: "95%", maxHeight: "90vh", overflowY: "auto" }}
        >
          {/* Header */}
          <div className="ws-card-header" style={{ marginBottom: "16px" }}>
            <div className="ws-card-title">
              <Activity size={18} color="#00e5ff" />
              <span>Technical Indicators Deep Dive — {ticker}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="ws-count-badge" style={{ color: "#00e5ff", borderColor: "rgba(0, 229, 255, 0.3)" }}>
                Trend: {summary.primary_trend || "Neutral"}
              </span>
              <button className="modal-close-btn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="ws-stats-grid" style={{ marginBottom: "20px" }}>
            <div className="ws-stat-card">
              <span className="ws-stat-label">Last Close</span>
              <span className="ws-stat-val">{currency} {summary.current_price?.toFixed(2)}</span>
            </div>
            <div className="ws-stat-card">
              <span className="ws-stat-label">RSI (14-Day)</span>
              <span className="ws-stat-val" style={{ color: summary.rsi_14 > 70 ? "#ef4444" : summary.rsi_14 < 30 ? "#00ff87" : "#00e5ff" }}>
                {summary.rsi_14?.toFixed(1)} <span style={{ fontSize: "11px", color: "var(--ws-text-muted)" }}>({summary.rsi_condition})</span>
              </span>
            </div>
            <div className="ws-stat-card">
              <span className="ws-stat-label">MACD Signal</span>
              <span className="ws-stat-val positive" style={{ fontSize: "16px" }}>
                {summary.macd_condition}
              </span>
            </div>
            <div className="ws-stat-card">
              <span className="ws-stat-label">Annualized Volatility</span>
              <span className="ws-stat-val">{summary.historical_volatility_pct}%</span>
            </div>
          </div>

          {/* Chart View Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button
              className={`ws-freq-btn ${activeTab === "overlay" ? "active" : ""}`}
              onClick={() => setActiveTab("overlay")}
            >
              Price + Moving Averages (SMA 20/50, EMA 12)
            </button>
            <button
              className={`ws-freq-btn ${activeTab === "rsi" ? "active" : ""}`}
              onClick={() => setActiveTab("rsi")}
            >
              RSI-14 Momentum Oscillator
            </button>
            <button
              className={`ws-freq-btn ${activeTab === "macd" ? "active" : ""}`}
              onClick={() => setActiveTab("macd")}
            >
              MACD Histogram (12, 26, 9)
            </button>
          </div>

          {/* Chart Canvas */}
          <div style={{ width: "100%", height: 320, background: "rgba(5, 8, 14, 0.6)", borderRadius: "10px", padding: "12px", border: "1px solid var(--ws-border-glass-subtle)" }}>
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "overlay" ? (
                <ComposedChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} minTickGap={30} />
                  <YAxis stroke="#64748b" fontSize={10} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ background: "rgba(10, 18, 28, 0.95)", border: "1px solid #00ff87", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Line type="monotone" dataKey="close" stroke="#00ff87" strokeWidth={2} dot={false} name="Close" />
                  <Line type="monotone" dataKey="sma_20" stroke="#00e5ff" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="SMA 20" />
                  <Line type="monotone" dataKey="sma_50" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" name="SMA 50" />
                  <Line type="monotone" dataKey="ema_12" stroke="#a855f7" strokeWidth={1.2} dot={false} name="EMA 12" />
                </ComposedChart>
              ) : activeTab === "rsi" ? (
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} minTickGap={30} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} ticks={[30, 50, 70]} />
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Overbought (70)", fill: "#ef4444", fontSize: 10 }} />
                  <ReferenceLine y={30} stroke="#00ff87" strokeDasharray="3 3" label={{ value: "Oversold (30)", fill: "#00ff87", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "rgba(10, 18, 28, 0.95)", border: "1px solid #00e5ff", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Line type="monotone" dataKey="rsi_14" stroke="#00e5ff" strokeWidth={2} dot={false} name="RSI-14" />
                </LineChart>
              ) : (
                <BarChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} minTickGap={30} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ background: "rgba(10, 18, 28, 0.95)", border: "1px solid #10b981", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.2)" />
                  <Bar dataKey="macd_hist" fill="#00ff87" name="MACD Histogram" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Predefined Conditions Identified */}
          <div style={{ marginTop: "18px" }}>
            <h5 style={{ fontSize: "12px", color: "var(--ws-text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Predefined Pattern & Indicator Signals
            </h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              {conditions.map((cond, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: "12px",
                    color: "var(--ws-text-primary)",
                    padding: "8px 12px",
                    background: "rgba(0, 255, 135, 0.04)",
                    borderLeft: "3px solid #00ff87",
                    borderRadius: "4px",
                  }}
                >
                  {cond}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Descriptive Disclaimer */}
          <p style={{ marginTop: "16px", fontSize: "11px", color: "var(--ws-text-muted)", fontStyle: "italic" }}>
            {technicalData.disclaimer}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
