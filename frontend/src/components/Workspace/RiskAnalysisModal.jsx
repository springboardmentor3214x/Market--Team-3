import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, AlertTriangle, ArrowDownRight, Compass, ShieldCheck } from "lucide-react";

export default function RiskAnalysisModal({ isOpen, onClose, riskData, ticker }) {
  if (!isOpen || !riskData) return null;

  const crossConflict = riskData.cross_agent_divergence || {};
  const scenarios = riskData.scenarios || {};

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
              <ShieldAlert size={18} color="#38bdf8" />
              <span>Multi-Factor Risk Assessment — {ticker}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                className="ws-count-badge"
                style={{
                  color: riskData.overall_risk_level === "High" ? "#ef4444" : riskData.overall_risk_level === "Elevated" ? "#f59e0b" : "#00ff87",
                  borderColor: riskData.overall_risk_level === "High" ? "rgba(239, 68, 68, 0.4)" : "rgba(0, 255, 135, 0.4)",
                }}
              >
                Risk Level: {riskData.overall_risk_level} (Score: {riskData.risk_score}/100)
              </span>
              <button className="modal-close-btn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Cross-Agent Conflict Alert Banner (Requirement 4) */}
          {crossConflict.has_conflict ? (
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <AlertTriangle size={18} color="#ef4444" />
                <strong style={{ color: "#ef4444", fontSize: "14px" }}>
                  Cross-Agent Divergence Detected: {crossConflict.conflict_type}
                </strong>
                <span className="ws-agent-tag" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.4)" }}>
                  Severity: {crossConflict.severity}
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--ws-text-primary)", margin: 0 }}>
                {crossConflict.description}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                background: "rgba(0, 255, 135, 0.05)",
                border: "1px solid rgba(0, 255, 135, 0.2)",
                borderRadius: "8px",
                marginBottom: "16px",
                color: "#00ff87",
                fontSize: "12px",
              }}
            >
              <ShieldCheck size={16} />
              <span>Cross-Agent Alignment Confirmed: Technical trend, fundamental health, and news sentiment are mutually consistent.</span>
            </div>
          )}

          {/* Key Quantitative Risk Metrics */}
          <div className="ws-stats-grid" style={{ marginBottom: "20px" }}>
            <div className="ws-stat-card">
              <span className="ws-stat-label">Maximum Peak-to-Trough Drawdown</span>
              <span className="ws-stat-val" style={{ color: "#ef4444" }}>
                {riskData.maximum_drawdown_pct}%
              </span>
            </div>
            <div className="ws-stat-card">
              <span className="ws-stat-label">Annualized Volatility</span>
              <span className="ws-stat-val">{riskData.historical_volatility_pct}%</span>
            </div>
            {riskData.var_95_daily_pct && (
              <div className="ws-stat-card">
                <span className="ws-stat-label">Daily Value-at-Risk (95% VaR)</span>
                <span className="ws-stat-val">±{riskData.var_95_daily_pct}%</span>
              </div>
            )}
          </div>

          {/* Financial & Sector Risks */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div style={{ background: "rgba(5, 8, 14, 0.6)", padding: "14px", borderRadius: "10px", border: "1px solid var(--ws-border-glass-subtle)" }}>
              <h5 style={{ fontSize: "12px", color: "var(--ws-accent-cyan)", marginBottom: "8px", textTransform: "uppercase" }}>
                Identified Balance-Sheet Risks
              </h5>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                {riskData.financial_risks.map((r, i) => (
                  <li key={i} style={{ fontSize: "12px", color: "var(--ws-text-secondary)" }}>
                    • {r}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: "rgba(5, 8, 14, 0.6)", padding: "14px", borderRadius: "10px", border: "1px solid var(--ws-border-glass-subtle)" }}>
              <h5 style={{ fontSize: "12px", color: "var(--ws-accent-green)", marginBottom: "8px", textTransform: "uppercase" }}>
                Macro & Industry Factors
              </h5>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                {riskData.sector_risks.map((s, i) => (
                  <li key={i} style={{ fontSize: "12px", color: "var(--ws-text-secondary)" }}>
                    • {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Three Scenarios */}
          <div style={{ background: "rgba(5, 8, 14, 0.6)", padding: "16px", borderRadius: "10px", border: "1px solid var(--ws-border-glass-subtle)" }}>
            <h5 style={{ fontSize: "12px", color: "var(--ws-text-primary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Alternative Market Scenarios & Catalyst Modeling
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
              <div>
                <strong style={{ color: "#00ff87" }}>Bull Case: </strong>
                <span style={{ color: "var(--ws-text-secondary)" }}>{scenarios.bull_case}</span>
              </div>
              <div>
                <strong style={{ color: "#38bdf8" }}>Base Case: </strong>
                <span style={{ color: "var(--ws-text-secondary)" }}>{scenarios.base_case}</span>
              </div>
              <div>
                <strong style={{ color: "#ef4444" }}>Bear Case: </strong>
                <span style={{ color: "var(--ws-text-secondary)" }}>{scenarios.bear_case}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
