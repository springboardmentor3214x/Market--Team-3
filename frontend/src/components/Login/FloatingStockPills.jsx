import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Activity, Cpu, ShieldCheck, Zap } from "lucide-react";

export default function FloatingStockPills() {
  const stockData = [
    {
      symbol: "NVDA",
      name: "NVIDIA Corp",
      price: "$148.50",
      change: "+6.85%",
      positive: true,
      tag: "AI Alpha",
      style: { top: "40%", right: "24px" },
    },
    {
      symbol: "AAPL",
      name: "Apple Inc",
      price: "$234.80",
      change: "+3.42%",
      positive: true,
      tag: "Breakout",
      style: { top: "50%", right: "24px" },
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc",
      price: "$342.10",
      change: "+4.18%",
      positive: true,
      tag: "Volume Spike",
      style: { top: "60%", right: "24px" },
    },
    {
      symbol: "MSFT",
      name: "Microsoft",
      price: "$428.90",
      change: "+2.31%",
      positive: true,
      tag: "Cloud Surge",
      style: { top: "70%", right: "24px" },
    },
  ];

  return (
    <div className="floating-pills-container">
      {stockData.map((item, idx) => (
        <motion.div
          key={item.symbol}
          className="stock-pill glass-card"
          style={item.style}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4.5 + idx * 0.7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: idx * 0.3,
          }}
          whileHover={{ scale: 1.08, y: -4 }}
        >
          <div className="pill-header">
            <span className="pill-symbol">{item.symbol}</span>
            <span className="pill-tag">{item.tag}</span>
          </div>
          <div className="pill-body">
            <span className="pill-price">{item.price}</span>
            <span className="pill-change">
              <TrendingUp size={13} style={{ marginRight: "3px" }} />
              {item.change}
            </span>
          </div>
        </motion.div>
      ))}

      {/* Floating Real-Time Agent Intelligence Indicator Card */}
      <motion.div
        className="floating-intel-pill glass-card"
        style={{ top: "52%", left: "28px" }}
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="intel-pill-header">
          <div className="agent-pulse-dot" />
          <span className="intel-pill-title">AI AGENT CONSENSUS</span>
          <span className="intel-pill-badge">BULLISH 92%</span>
        </div>
        <div className="intel-pill-sub">
          <Zap size={11} color="#00ff87" style={{ marginRight: "4px" }} />
          <span>4 Agents Reconciled • Alpha High</span>
        </div>
      </motion.div>
    </div>
  );
}
