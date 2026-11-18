import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Activity,
  Radio,
  ShieldAlert,
  Cpu,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import TiltCard from "./TiltCard";
import TechnicalIndicatorsModal from "./TechnicalIndicatorsModal";
import NewsAnalysisModal from "./NewsAnalysisModal";
import RiskAnalysisModal from "./RiskAnalysisModal";

export default function AIAgentCards({
  agentAnalysis = null,
  agentLoading = false,
  onRunAnalysis,
  ticker = "",
  currency = "INR",
}) {
  const [activeModal, setActiveModal] = useState(null); // 'technical' | 'news' | 'risk' | null

  const fundamental = agentAnalysis?.fundamental;
  const technical = agentAnalysis?.technical;
  const news = agentAnalysis?.news;
  const risk = agentAnalysis?.risk;

  const AGENTS = [
    {
      id: "fundamental",
      name: "Fundamental Analysis Agent",
      icon: TrendingUp,
      role: "Financial Statements & Valuation",
      description: fundamental
        ? fundamental.summary_explanation
        : "Evaluates balance sheets, cash flow ratios, and enterprise valuation multiples.",
      status: fundamental ? "Analyzed" : agentLoading ? "Analyzing..." : "Standby",
      statusDetail: fundamental
        ? `Rating: ${fundamental.rating} (${fundamental.overall_fundamental_score}/100)`
        : "Autonomous Agent Ready",
      color: "#00ff87",
      tag: "Agent #1",
      chips: fundamental
        ? [
            fundamental.ratios.pe_ratio ? `P/E: ${fundamental.ratios.pe_ratio}x` : null,
            fundamental.ratios.roe ? `ROE: ${fundamental.ratios.roe}%` : null,
            fundamental.ratios.operating_margin ? `Op Margin: ${fundamental.ratios.operating_margin}%` : null,
          ].filter(Boolean)
        : [],
      hasModal: false,
    },
    {
      id: "technical",
      name: "Technical Analysis Agent",
      icon: Activity,
      role: "Price Action & Momentum Signals",
      description: technical
        ? technical.signal_summary
        : "Synthesizes OHLCV trendlines, moving averages, and market volume structures.",
      status: technical ? "Analyzed" : agentLoading ? "Analyzing..." : "Standby",
      statusDetail: technical
        ? `Trend: ${technical.indicators_summary.primary_trend}`
        : "Autonomous Agent Ready",
      color: "#00e5ff",
      tag: "Agent #2",
      chips: technical
        ? [
            `RSI-14: ${technical.indicators_summary.rsi_14} (${technical.indicators_summary.rsi_condition})`,
            `MACD: ${technical.indicators_summary.macd_condition}`,
            `Vol: ${technical.indicators_summary.historical_volatility_pct}%`,
          ]
        : [],
      hasModal: true,
      modalKey: "technical",
    },
    {
      id: "sentiment",
      name: "News & Sentiment Agent",
      icon: Radio,
      role: "Market Mood & Macro Feeds",
      description: news
        ? news.summary_explanation
        : "Aggregates real-time news headlines, SEC filings, and regulatory sentiment feeds.",
      status: news ? "Analyzed" : agentLoading ? "Analyzing..." : "Standby",
      statusDetail: news
        ? `Sentiment: ${news.overall_sentiment_label} (${news.total_articles_analyzed} articles)`
        : "Autonomous Agent Ready",
      color: "#10b981",
      tag: "Agent #3",
      chips: news
        ? [
            `Sentiment: ${news.overall_sentiment_label}`,
            `Articles: ${news.total_articles_analyzed}`,
            news.conflicting_reports_flag ? "⚠️ Conflicting News" : "Consistent Feeds",
          ]
        : [],
      hasModal: true,
      modalKey: "news",
    },
    {
      id: "risk",
      name: "Risk Management Agent",
      icon: ShieldAlert,
      role: "Volatility & Drawdown Protection",
      description: risk
        ? risk.summary_explanation
        : "Cross-checks beta variance, drawdown limits, and portfolio exposure thresholds.",
      status: risk ? "Analyzed" : agentLoading ? "Analyzing..." : "Standby",
      statusDetail: risk
        ? `Risk: ${risk.overall_risk_level} (Score: ${risk.risk_score}/100)`
        : "Autonomous Agent Ready",
      color: "#38bdf8",
      tag: "Agent #4",
      chips: risk
        ? [
            `Max Drawdown: ${risk.maximum_drawdown_pct}%`,
            `Risk Level: ${risk.overall_risk_level}`,
            risk.cross_agent_divergence.has_conflict ? "⚠️ Cross-Agent Conflict" : "Aligned",
          ]
        : [],
      hasModal: true,
      modalKey: "risk",
    },
  ];

  return (
    <div className="ws-agents-section">
      {/* Header bar */}
      <div className="ws-card-header" style={{ marginBottom: "16px" }}>
        <div className="ws-card-title">
          <Cpu size={16} className="ws-card-title-icon" />
          <span>Specialized Financial Analysis AI Agents</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {onRunAnalysis && (
            <motion.button
              type="button"
              className="ws-btn-outline"
              onClick={() => onRunAnalysis()}
              disabled={agentLoading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ padding: "6px 14px", fontSize: "11px", height: "auto" }}
            >
              <RotateCcw size={12} className={agentLoading ? "ws-spin" : ""} />
              <span>{agentLoading ? "Executing Swarm..." : "Run Multi-Agent Deep Dive"}</span>
            </motion.button>
          )}

          <div className="ws-agents-header-badge">
            <span className={agentLoading ? "ws-live-pulse" : "ws-live-pulse"} />
            <span>{agentAnalysis ? "4 Agents Active" : "4 Specialized Agents"}</span>
          </div>
        </div>
      </div>

      {/* Cross-Agent Conflict Alert Banner (If detected by Risk Agent) */}
      {risk?.cross_agent_divergence?.has_conflict && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="ws-glass-card"
          style={{
            marginBottom: "16px",
            borderColor: "rgba(239, 68, 68, 0.4)",
            background: "rgba(239, 68, 68, 0.08)",
            padding: "12px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={18} color="#ef4444" />
            <strong style={{ color: "#ef4444", fontSize: "13px" }}>
              Risk Agent Alert: {risk.cross_agent_divergence.conflict_type}
            </strong>
          </div>
          <p style={{ margin: "4px 0 0 26px", fontSize: "12px", color: "var(--ws-text-primary)" }}>
            {risk.cross_agent_divergence.description}
          </p>
        </motion.div>
      )}

      {/* Agent Cards Grid */}
      <div className="ws-agents-grid">
        {AGENTS.map((agent, index) => {
          const IconComponent = agent.icon;
          const isAnalyzed = agent.status === "Analyzed";

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              animate={{
                y: [0, -5, 0],
              }}
              transition-animate={{
                repeat: Infinity,
                duration: 4.5,
                ease: "easeInOut",
                delay: index * 0.7,
              }}
            >
              <TiltCard
                className="ws-glass-card ws-agent-card ws-agent-animated-card"
                maxTilt={10}
                glareColor={`rgba(${index % 2 === 0 ? "0, 255, 135" : "0, 229, 255"}, 0.18)`}
                onClick={() => {
                  if (agent.hasModal && isAnalyzed) {
                    setActiveModal(agent.modalKey);
                  }
                }}
                style={{ cursor: agent.hasModal && isAnalyzed ? "pointer" : "default" }}
              >
                {/* Border glow beam */}
                <div
                  className="ws-agent-border-glow"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)`,
                  }}
                />

                <div className="ws-agent-top">
                  <div
                    className="ws-agent-icon-box"
                    style={{
                      background: `rgba(0, 255, 135, 0.08)`,
                      borderColor: isAnalyzed ? agent.color : `rgba(0, 255, 135, 0.3)`,
                      transform: "translateZ(20px)",
                    }}
                  >
                    <IconComponent
                      size={20}
                      color={agent.color}
                      className={agentLoading ? "ws-agent-pulse-icon" : ""}
                    />
                  </div>
                  <span
                    className="ws-agent-tag"
                    style={{
                      transform: "translateZ(15px)",
                      color: isAnalyzed ? agent.color : "var(--ws-accent-green)",
                      borderColor: isAnalyzed ? `rgba(0, 255, 135, 0.4)` : "rgba(0, 255, 135, 0.2)",
                    }}
                  >
                    {isAnalyzed ? "Active Analysis" : agent.tag}
                  </span>
                </div>

                <h4 className="ws-agent-name" style={{ transform: "translateZ(18px)" }}>
                  {agent.name}
                </h4>
                <div className="ws-agent-role" style={{ transform: "translateZ(12px)" }}>
                  {agent.role}
                </div>
                <p className="ws-agent-desc">{agent.description}</p>

                {/* Metrics Chips */}
                {agent.chips.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                    {agent.chips.map((chip, cIdx) => (
                      <span
                        key={cIdx}
                        style={{
                          fontSize: "10px",
                          fontFamily: "var(--ws-font-mono)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          background: "rgba(0, 255, 135, 0.06)",
                          border: "1px solid var(--ws-border-glass-subtle)",
                          color: "var(--ws-text-primary)",
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}

                {/* Status Bar */}
                <div className="ws-agent-status-bar" style={{ transform: "translateZ(14px)" }}>
                  <div className="ws-agent-status-left">
                    <div className="ws-agent-radar-box">
                      <span
                        className="ws-agent-radar-ping"
                        style={{
                          borderColor: isAnalyzed ? "#00ff87" : "#38bdf8",
                        }}
                      />
                      <span
                        className="ws-agent-idle-dot"
                        style={{
                          backgroundColor: isAnalyzed ? "#00ff87" : "#38bdf8",
                          boxShadow: `0 0 8px ${isAnalyzed ? "rgba(0, 255, 135, 0.9)" : "rgba(56, 189, 248, 0.9)"}`,
                        }}
                      />
                    </div>
                    <span
                      className="ws-agent-status-text"
                      style={{
                        color: isAnalyzed ? "#00ff87" : "#38bdf8",
                      }}
                    >
                      {agent.status}
                    </span>
                  </div>

                  {agent.hasModal && isAnalyzed ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: agent.color, fontSize: "11px" }}>
                      <span>View Deep Dive</span>
                      <ChevronRight size={13} />
                    </div>
                  ) : (
                    <span className="ws-agent-detail">{agent.statusDetail}</span>
                  )}
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>

      {/* Modals for Deep Dive Details */}
      <TechnicalIndicatorsModal
        isOpen={activeModal === "technical"}
        onClose={() => setActiveModal(null)}
        technicalData={technical}
        ticker={ticker}
        currency={currency}
      />

      <NewsAnalysisModal
        isOpen={activeModal === "news"}
        onClose={() => setActiveModal(null)}
        newsData={news}
        ticker={ticker}
      />

      <RiskAnalysisModal
        isOpen={activeModal === "risk"}
        onClose={() => setActiveModal(null)}
        riskData={risk}
        ticker={ticker}
      />
    </div>
  );
}
