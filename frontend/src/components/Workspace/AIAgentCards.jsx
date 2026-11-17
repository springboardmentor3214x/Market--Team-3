import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Activity, Radio, ShieldAlert, Cpu, Sparkles, CheckCircle2, Clock } from "lucide-react";
import TiltCard from "./TiltCard";

const AGENTS = [
  {
    id: "fundamental",
    name: "Fundamental Analysis Agent",
    icon: TrendingUp,
    role: "Financial Statements & Valuation",
    description: "Evaluates balance sheets, cash flow ratios, and enterprise valuation multiples.",
    status: "Standby",
    statusDetail: "Awaiting Module 3 Engine",
    color: "#00ff87",
    tag: "LangGraph Agent 1",
  },
  {
    id: "technical",
    name: "Technical Analysis Agent",
    icon: Activity,
    role: "Price Action & Momentum Signals",
    description: "Synthesizes OHLCV trendlines, moving averages, and market volume structures.",
    status: "Standby",
    statusDetail: "Awaiting Module 3 Engine",
    color: "#00e5ff",
    tag: "LangGraph Agent 2",
  },
  {
    id: "sentiment",
    name: "News & Sentiment Agent",
    icon: Radio,
    role: "Market Mood & Macro Feeds",
    description: "Aggregates real-time news headlines, SEC filings, and regulatory sentiment feeds.",
    status: "Standby",
    statusDetail: "Scheduled for Module 4",
    color: "#10b981",
    tag: "LangGraph Agent 3",
  },
  {
    id: "risk",
    name: "Risk Management Agent",
    icon: ShieldAlert,
    role: "Volatility & Drawdown Protection",
    description: "Cross-checks beta variance, drawdown limits, and portfolio exposure thresholds.",
    status: "Standby",
    statusDetail: "Scheduled for Module 5",
    color: "#38bdf8",
    tag: "LangGraph Agent 4",
  },
];

export default function AIAgentCards() {
  return (
    <div className="ws-agents-section">
      <div className="ws-card-header" style={{ marginBottom: "16px" }}>
        <div className="ws-card-title">
          <Cpu size={16} className="ws-card-title-icon" />
          <span>Multi-Agent Research Swarm Architecture</span>
        </div>
        <span className="ws-count-badge">4 Specialized Agents</span>
      </div>

      <div className="ws-agents-grid">
        {AGENTS.map((agent, index) => {
          const IconComponent = agent.icon;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            >
              <TiltCard className="ws-glass-card ws-agent-card">
                <div className="ws-agent-top">
                  <div
                    className="ws-agent-icon-box"
                    style={{
                      background: `rgba(0, 255, 135, 0.08)`,
                      borderColor: `rgba(0, 255, 135, 0.25)`,
                    }}
                  >
                    <IconComponent size={20} color={agent.color} className="ws-agent-pulse-icon" />
                  </div>
                  <span className="ws-agent-tag">{agent.tag}</span>
                </div>

                <h4 className="ws-agent-name">{agent.name}</h4>
                <div className="ws-agent-role">{agent.role}</div>
                <p className="ws-agent-desc">{agent.description}</p>

                <div className="ws-agent-status-bar">
                  <div className="ws-agent-status-left">
                    <span className="ws-agent-idle-dot" />
                    <span className="ws-agent-status-text">{agent.status}</span>
                  </div>
                  <span className="ws-agent-detail">{agent.statusDetail}</span>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
