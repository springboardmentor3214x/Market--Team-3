import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Calendar, TrendingUp, BarChart2 } from "lucide-react";

const PERIODS = [
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
];

export default function StockPriceChart({
  ohlcvData = [],
  currency = "USD",
  activePeriod = "6mo",
  onPeriodChange,
  loading = false,
  chartLoading = false,
}) {
  const [chartMode, setChartMode] = useState("area"); // 'area' | 'line'

  if (!ohlcvData || ohlcvData.length === 0) {
    return (
      <div className="ws-chart-empty">
        <p>No historical price data available to graph.</p>
      </div>
    );
  }

  // Calculate high/low for YAxis domain padding
  const prices = ohlcvData.map((d) => d.Close).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 100;
  const padding = (maxPrice - minPrice) * 0.05 || 5;

  const latestClose = prices.length ? Number(prices[prices.length - 1]) : 0;
  const firstClose = prices.length ? Number(prices[0]) : 0;
  const priceDiff = latestClose - firstClose;
  const pctChange = firstClose ? ((priceDiff / firstClose) * 100).toFixed(2) : "0.00";
  const isUp = priceDiff >= 0;

  // Custom Glassmorphic Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.Close >= data.Open;
      return (
        <div className="ws-chart-tooltip">
          <div className="ws-tooltip-date">{data.trading_date}</div>
          <div className="ws-tooltip-grid">
            <div>
              <span className="tooltip-label">Close:</span>
              <strong style={{ color: isPositive ? "#00ff87" : "#ef4444" }}>
                {currency} {Number(data.Close).toFixed(2)}
              </strong>
            </div>
            <div>
              <span className="tooltip-label">Open:</span>
              <span>{currency} {Number(data.Open).toFixed(2)}</span>
            </div>
            <div>
              <span className="tooltip-label">High:</span>
              <span>{currency} {Number(data.High).toFixed(2)}</span>
            </div>
            <div>
              <span className="tooltip-label">Low:</span>
              <span>{currency} {Number(data.Low).toFixed(2)}</span>
            </div>
            {data["Adj Close"] && (
              <div>
                <span className="tooltip-label">Adj Close:</span>
                <span>{currency} {Number(data["Adj Close"]).toFixed(2)}</span>
              </div>
            )}
            <div className="tooltip-volume-row">
              <span className="tooltip-label">Volume:</span>
              <span>{Number(data.Volume).toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="ws-chart-card">
      <div className="ws-chart-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div className="ws-chart-title">
            <TrendingUp size={16} color="#00ff87" />
            <span>Interactive Price & Volume Analytics</span>
          </div>
          {prices.length > 0 && (
            <div className="ws-chart-kpi-pill">
              <span className="ws-kpi-val">{currency} {latestClose.toFixed(2)}</span>
              <span className={`ws-kpi-badge ${isUp ? "positive" : "negative"}`}>
                {isUp ? "▲ +" : "▼ "}{pctChange}%
              </span>
            </div>
          )}
        </div>

        {/* Period Selector Buttons (1M, 3M, 6M, 1Y, 5Y) */}
        <div className="ws-period-btn-group">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`ws-period-btn ${activePeriod === p.value ? "active" : ""}`}
              onClick={() => onPeriodChange && onPeriodChange(p.value)}
              disabled={loading}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="ws-chart-wrapper" style={{ width: "100%", height: 320, position: "relative", overflow: "hidden" }}>
        {chartLoading && (
          <div className="ws-chart-loading-overlay">
            <div className="ws-chart-spinner" />
            <span className="ws-chart-loading-text">Updating Chart Data ({activePeriod.toUpperCase()})...</span>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activePeriod}-${ohlcvData.length}-${ohlcvData[0]?.trading_date || ""}`}
            initial={{ opacity: 0, clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}
            animate={{ opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            exit={{ opacity: 0.2, transition: { duration: 0.12 } }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%", height: "100%" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={ohlcvData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff87" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00ff87" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis
                  dataKey="trading_date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => {
                    const parts = String(val).split("-");
                    return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
                  }}
                  minTickGap={35}
                />
                {/* Left Axis: Price */}
                <YAxis
                  yAxisId="price"
                  stroke="#64748b"
                  fontSize={11}
                  domain={[Math.floor(minPrice - padding), Math.ceil(maxPrice + padding)]}
                  tickLine={false}
                  tickFormatter={(val) => `${val}`}
                />
                {/* Right Axis: Volume (hidden scale so bars don't overwhelm) */}
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  domain={[0, (dataMax) => dataMax * 4]}
                  hide={true}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Volume Bars */}
                <Bar
                  yAxisId="volume"
                  dataKey="Volume"
                  fill="rgba(0, 229, 255, 0.22)"
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={650}
                  animationEasing="ease-out"
                />
                {/* Price Area */}
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="Close"
                  stroke="#00ff87"
                  strokeWidth={2.2}
                  fillOpacity={1}
                  fill="url(#priceGradient)"
                  isAnimationActive={true}
                  animationDuration={650}
                  animationEasing="ease-out"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="ws-chart-footer">
        <span className="ws-chart-caption">
          Showing {ohlcvData.length} validated trading sessions ({currency})
        </span>
      </div>
    </div>
  );
}
