import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Activity,
  Radio,
  ShieldAlert,
  Cpu,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  RotateCcw,
  Layers,
  Terminal,
} from "lucide-react";
import TiltCard from "./TiltCard";
import TechnicalIndicatorsModal from "./TechnicalIndicatorsModal";
import NewsAnalysisModal from "./NewsAnalysisModal";

export default function AIAgentCards({
  agentAnalysis = null,
  agentLoading = false,
  onRunAnalysis,
  ticker = "",
  currency = "INR",
  activeAgentId = "fundamental",
  onSelectAgent = () => {},
}) {
  const [techModalOpen, setTechModalOpen] = useState(false);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const fundamental = agentAnalysis?.fundamental;
  const technical = agentAnalysis?.technical;
  const news = agentAnalysis?.news;
  const risk = agentAnalysis?.risk;

  const AGENTS = [
    {
      id: "fundamental",
      number: "01",
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
      layerName: "01 // FUNDAMENTAL VALUATION & BALANCE SHEET",
      telemetry: fundamental
        ? `Valuation Score: ${fundamental.overall_fundamental_score}/100 | Quality Rating: ${fundamental.rating} | Enterprise Multiple: Healthy`
        : "Standby: Autonomous DCF, P/E multiples, and Balance Sheet solvency matrix ready to execute.",
      chips: fundamental
        ? [
            fundamental.ratios.pe_ratio ? `P/E: ${fundamental.ratios.pe_ratio}x` : null,
            fundamental.ratios.roe ? `ROE: ${fundamental.ratios.roe}%` : null,
            fundamental.ratios.operating_margin ? `Op Margin: ${fundamental.ratios.operating_margin}%` : null,
          ].filter(Boolean)
        : ["P/E Valuation", "ROE Capital", "Operating Margin"],
    },
    {
      id: "technical",
      number: "02",
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
      layerName: "02 // TECHNICAL PRICE ACTION & MOMENTUM SIGNALS",
      telemetry: technical
        ? `Primary Trend: ${technical.indicators_summary.primary_trend} | RSI-14: ${technical.indicators_summary.rsi_14} | Volatility: ${technical.indicators_summary.historical_volatility_pct}%`
        : "Standby: Multi-timeframe OHLCV vector engine with RSI-14, MACD, and breakout detection.",
      chips: technical
        ? [
            technical.indicators_summary.sma_5 ? `5-SMA: ${technical.indicators_summary.sma_5.toFixed(2)}` : null,
            technical.indicators_summary.sma_20 ? `20-SMA: ${technical.indicators_summary.sma_20.toFixed(2)}` : null,
            technical.indicators_summary.sma_50 ? `50-SMA: ${technical.indicators_summary.sma_50.toFixed(2)}` : null,
            `RSI-14: ${technical.indicators_summary.rsi_14?.toFixed(1)} (${technical.indicators_summary.rsi_condition})`,
            `MACD: ${technical.indicators_summary.macd_condition}`,
            `Vol: ${technical.indicators_summary.historical_volatility_pct}%`,
          ].filter(Boolean)
        : ["5-Day SMA", "20-Day SMA", "50-Day SMA", "RSI Momentum", "MACD Histogram"],
    },
    {
      id: "sentiment",
      number: "03",
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
      color: "#2dd4bf",
      tag: "Agent #3",
      layerName: "03 // NEWS HEADLINES & REGULATORY MACRO SENTIMENT",
      telemetry: news
        ? `Sentiment Score: ${news.average_sentiment_score ?? news.overall_sentiment_score ?? 0} (${news.overall_sentiment_label}) | Feeds: ${news.total_articles_analyzed} parsed | Conflict: ${news.conflicting_reports_flag ? "Detected" : "None"}`
        : "Standby: Real-time NLP sentiment parsing across financial wires, press releases, and macro feeds.",
      chips: news
        ? [
            `Sentiment: ${news.overall_sentiment_label}`,
            `Articles: ${news.total_articles_analyzed}`,
            news.official_announcements_count ? `${news.official_announcements_count} Official` : null,
            news.conflicting_reports_flag ? "⚠️ Conflicting News" : "Consistent Feeds",
          ].filter(Boolean)
        : ["Sentiment NLP", "Macro Wire Feeds", "Regulatory Reports"],
    },
    {
      id: "risk",
      number: "04",
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
      color: "#f59e0b",
      tag: "Agent #4",
      layerName: "04 // VOLATILITY DRAWDOWN & RISK AUDIT",
      telemetry: risk
        ? `Risk Level: ${risk.overall_risk_level} (Score: ${risk.risk_score}/100) | Max Drawdown: ${risk.maximum_drawdown_pct}% | Quorum Conflict: ${risk.cross_agent_divergence.has_conflict ? "YES" : "NO"}`
        : "Standby: Beta volatility boundaries, Monte Carlo tail risk, and maximum drawdown safety rails.",
      chips: risk
        ? [
            `Max Drawdown: ${risk.maximum_drawdown_pct}%`,
            `Risk Level: ${risk.overall_risk_level}`,
            risk.cross_agent_divergence.has_conflict ? "⚠️ Cross-Agent Conflict" : "Aligned",
          ]
        : ["Max Drawdown", "Beta Boundary", "Multi-Agent Quorum"],
    },
  ];

  const activeIndex = Math.max(
    0,
    AGENTS.findIndex((a) => a.id === activeAgentId)
  );
  const currentAgent = AGENTS[activeIndex] || AGENTS[0];

  const handlePrevAgent = () => {
    const nextIdx = (activeIndex - 1 + AGENTS.length) % AGENTS.length;
    onSelectAgent(AGENTS[nextIdx].id);
  };

  const handleNextAgent = () => {
    const nextIdx = (activeIndex + 1) % AGENTS.length;
    onSelectAgent(AGENTS[nextIdx].id);
  };

  return (
    <div className="ws-agents-section">
      {/* Header bar */}
      <div className="ws-card-header" style={{ marginBottom: "14px" }}>
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
            marginBottom: "14px",
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

      {/* Interactive Agent Work Box Switcher & Written Telemetry Console */}
      <div
        className="ws-agent-switcher-console"
        style={{
          background: "rgba(5, 10, 18, 0.78)",
          border: `1px solid ${currentAgent.color}40`,
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "18px",
          backdropFilter: "blur(14px)",
          boxShadow: `0 10px 25px rgba(0, 0, 0, 0.5), 0 0 18px ${currentAgent.color}20`,
          transition: "border-color 0.4s ease, box-shadow 0.4s ease",
        }}
      >
        {/* Top Control Bar: Tabs + Navigation Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          {/* Agent Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {AGENTS.map((agent) => {
              const isSelected = agent.id === activeAgentId;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => onSelectAgent(agent.id)}
                  style={{
                    background: isSelected
                      ? `rgba(${agent.id === "risk" ? "245, 158, 11" : agent.id === "technical" ? "0, 229, 255" : agent.id === "sentiment" ? "45, 212, 191" : "0, 255, 135"}, 0.16)`
                      : "rgba(255, 255, 255, 0.03)",
                    border: isSelected
                      ? `1px solid ${agent.color}`
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    color: isSelected ? agent.color : "#94a3b8",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "var(--ws-font-mono, monospace)",
                    fontWeight: isSelected ? 600 : 400,
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.25s ease",
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: agent.color,
                      opacity: isSelected ? 1 : 0.4,
                      boxShadow: isSelected ? `0 0 6px ${agent.color}` : "none",
                    }}
                  />
                  <span>{agent.number} // {agent.name.split(" ")[0].toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          {/* Previous / Next Agent Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={handlePrevAgent}
              title="Previous Agent"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#f8fafc",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "11px",
                fontFamily: "var(--ws-font-mono, monospace)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s ease",
              }}
            >
              <ChevronLeft size={13} />
              <span>PREV</span>
            </button>

            <button
              type="button"
              onClick={handleNextAgent}
              title="Next Agent"
              style={{
                background: `rgba(${currentAgent.id === "risk" ? "245, 158, 11" : currentAgent.id === "technical" ? "0, 229, 255" : currentAgent.id === "sentiment" ? "45, 212, 191" : "0, 255, 135"}, 0.15)`,
                border: `1px solid ${currentAgent.color}`,
                color: currentAgent.color,
                borderRadius: "6px",
                padding: "4px 12px",
                fontSize: "11px",
                fontFamily: "var(--ws-font-mono, monospace)",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                boxShadow: `0 0 10px ${currentAgent.color}30`,
                transition: "all 0.25s ease",
              }}
            >
              <span>NEXT AGENT</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* The Written Thing: Dynamic Real-Time Agent Telemetry Console */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAgent.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "8px 12px",
              background: "rgba(0, 0, 0, 0.35)",
              borderLeft: `3px solid ${currentAgent.color}`,
              borderRadius: "4px",
            }}
          >
            <Terminal size={14} color={currentAgent.color} style={{ marginTop: "2px", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "11px",
                  fontFamily: "var(--ws-font-mono, monospace)",
                  color: currentAgent.color,
                  marginBottom: "2px",
                }}
              >
                <strong>3D LINKED // {currentAgent.layerName}</strong>
                <span style={{ opacity: 0.4 }}>|</span>
                <span style={{ color: "#94a3b8" }}>STATUS: {currentAgent.status.toUpperCase()}</span>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#cbd5e1",
                  lineHeight: "1.4",
                  fontFamily: "var(--ws-font-sans, sans-serif)",
                }}
              >
                {currentAgent.telemetry}
              </div>
            </div>
            {currentAgent.id === "technical" && technical && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTechModalOpen(true);
                }}
                style={{
                  background: "rgba(0, 229, 255, 0.18)",
                  border: "1px solid #00e5ff",
                  color: "#00e5ff",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontFamily: "var(--ws-font-mono, monospace)",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                  alignSelf: "center",
                  boxShadow: "0 0 10px rgba(0, 229, 255, 0.25)",
                }}
              >
                <Activity size={13} />
                <span>Open Module 4 Studio</span>
              </button>
            )}
            {currentAgent.id === "sentiment" && news && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setNewsModalOpen(true);
                }}
                style={{
                  background: "rgba(45, 212, 191, 0.18)",
                  border: "1px solid #2dd4bf",
                  color: "#2dd4bf",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontFamily: "var(--ws-font-mono, monospace)",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                  alignSelf: "center",
                  boxShadow: "0 0 10px rgba(45, 212, 191, 0.25)",
                }}
              >
                <Radio size={13} />
                <span>Open Module 5 Studio</span>
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Agent Cards Grid with Clickable Interactive Selection */}
      <div className="ws-agents-grid">
        {AGENTS.map((agent, index) => {
          const IconComponent = agent.icon;
          const isAnalyzed = agent.status === "Analyzed";
          const isSelected = agent.id === activeAgentId;

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
              animate={{
                y: isSelected ? -4 : 0,
                scale: isSelected ? 1.015 : 0.99,
              }}
              onClick={() => onSelectAgent(agent.id)}
              style={{
                cursor: "pointer",
                position: "relative",
              }}
            >
              <TiltCard
                className={`ws-glass-card ws-agent-card ws-agent-animated-card ${
                  isSelected ? "ws-agent-card-selected" : ""
                }`}
                maxTilt={8}
                glareColor={`rgba(${
                  agent.id === "risk"
                    ? "245, 158, 11"
                    : agent.id === "technical"
                    ? "0, 229, 255"
                    : agent.id === "sentiment"
                    ? "45, 212, 191"
                    : "0, 255, 135"
                }, 0.22)`}
                style={{
                  border: isSelected
                    ? `1.5px solid ${agent.color}`
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: isSelected
                    ? `0 14px 35px rgba(0, 0, 0, 0.6), 0 0 24px ${agent.color}35`
                    : "0 8px 24px rgba(0, 0, 0, 0.35)",
                  transition: "border 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                {/* Border glow beam */}
                <div
                  className="ws-agent-border-glow"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)`,
                    opacity: isSelected ? 1 : 0.4,
                  }}
                />

                <div className="ws-agent-top">
                  <div
                    className="ws-agent-icon-box"
                    style={{
                      background: `rgba(${
                        agent.id === "risk"
                          ? "245, 158, 11"
                          : agent.id === "technical"
                          ? "0, 229, 255"
                          : agent.id === "sentiment"
                          ? "45, 212, 191"
                          : "0, 255, 135"
                      }, 0.12)`,
                      borderColor: isSelected ? agent.color : `rgba(0, 255, 135, 0.3)`,
                      transform: "translateZ(20px)",
                      boxShadow: isSelected ? `0 0 12px ${agent.color}40` : "none",
                    }}
                  >
                    <IconComponent
                      size={20}
                      color={agent.color}
                      className={agentLoading ? "ws-agent-pulse-icon" : ""}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: "9px",
                          fontFamily: "var(--ws-font-mono, monospace)",
                          background: `${agent.color}25`,
                          border: `1px solid ${agent.color}`,
                          color: agent.color,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        IN FOCUS
                      </span>
                    )}
                    {agent.id === "technical" && technical && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTechModalOpen(true);
                        }}
                        title="Open Module 4 Technical Analysis Studio & Charts"
                        style={{
                          fontSize: "9px",
                          fontFamily: "var(--ws-font-mono, monospace)",
                          background: "rgba(0, 229, 255, 0.22)",
                          border: "1px solid #00e5ff",
                          color: "#00e5ff",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          letterSpacing: "0.06em",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        📊 CHARTS
                      </button>
                    )}
                    {agent.id === "sentiment" && news && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewsModalOpen(true);
                        }}
                        title="Open Module 5 News & Sentiment Studio"
                        style={{
                          fontSize: "9px",
                          fontFamily: "var(--ws-font-mono, monospace)",
                          background: "rgba(45, 212, 191, 0.22)",
                          border: "1px solid #2dd4bf",
                          color: "#2dd4bf",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          letterSpacing: "0.06em",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        📰 NEWS INTEL
                      </button>
                    )}
                    <span
                      className="ws-agent-tag"
                      style={{
                        transform: "translateZ(15px)",
                        color: isSelected ? agent.color : isAnalyzed ? agent.color : "var(--ws-accent-green)",
                        borderColor: isSelected ? agent.color : isAnalyzed ? `${agent.color}50` : "rgba(0, 255, 135, 0.2)",
                      }}
                    >
                      {isAnalyzed ? "Active Analysis" : agent.tag}
                    </span>
                  </div>
                </div>

                <h4
                  className="ws-agent-name"
                  style={{
                    transform: "translateZ(18px)",
                    color: isSelected ? "#ffffff" : "#f1f5f9",
                  }}
                >
                  {agent.name}
                </h4>
                <div
                  className="ws-agent-role"
                  style={{
                    transform: "translateZ(12px)",
                    color: isSelected ? agent.color : "#94a3b8",
                  }}
                >
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
                          background: isSelected ? `${agent.color}15` : "rgba(0, 255, 135, 0.06)",
                          border: isSelected ? `1px solid ${agent.color}40` : "1px solid var(--ws-border-glass-subtle)",
                          color: isSelected ? "#f8fafc" : "var(--ws-text-primary)",
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
                          borderColor: agent.color,
                        }}
                      />
                      <span
                        className="ws-agent-idle-dot"
                        style={{
                          backgroundColor: agent.color,
                          boxShadow: `0 0 8px ${agent.color}`,
                        }}
                      />
                    </div>
                    <span
                      className="ws-agent-status-text"
                      style={{
                        color: agent.color,
                      }}
                    >
                      {agent.status}
                    </span>
                  </div>

                  <span className="ws-agent-status-detail">
                    {agent.statusDetail}
                  </span>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>

      {/* Module 4 Technical Analysis Agent Interactive Studio Modal */}
      {technical && (
        <TechnicalIndicatorsModal
          isOpen={techModalOpen}
          onClose={() => setTechModalOpen(false)}
          technicalData={technical}
          ticker={ticker || technical.ticker}
          currency={currency || technical.currency}
        />
      )}

      {/* Module 5 News & Sentiment Analysis Agent Interactive Studio Modal */}
      {news && (
        <NewsAnalysisModal
          isOpen={newsModalOpen}
          onClose={() => setNewsModalOpen(false)}
          newsData={news}
          ticker={ticker || news.ticker}
        />
      )}
    </div>
  );
}
