import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WorkspaceScene3D from "./WorkspaceScene3D";
import StockSearchBar from "./StockSearchBar";
import StockPriceChart from "./StockPriceChart";
import FinancialStatementsView from "./FinancialStatementsView";
import AIAgentCards from "./AIAgentCards";
import AnimatedCounter from "./AnimatedCounter";
import TiltCard from "./TiltCard";
import CustomSelect from "./CustomSelect";
import {
  TrendingUp,
  Cpu,
  Bookmark,
  History,
  Globe,
  LogOut,
  ShieldCheck,
  CheckCircle,
  BarChart2,
  ExternalLink,
  Zap,
  Info,
  Trash2,
  Check,
} from "lucide-react";
import "./Workspace.css";

export default function Workspace({
  userEmail,
  onLogout,
  market,
  setMarket,
  period,
  setPeriod,
  onPreferenceSave,
  watchlist,
  history,
  searchQuery,
  setSearchQuery,
  onStockSearch,
  loading,
  stockResult,
  searchError,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  agentAnalysis,
  agentLoading,
  onRunAgentAnalysis,
  chartLoading = false,
  onFastPeriodChange,
}) {
  const [descExpanded, setDescExpanded] = useState(false);

  const currentTicker = stockResult?.source_metadata?.ticker;
  const isSavedInWatchlist = watchlist?.some(
    (item) =>
      item.ticker_symbol?.toUpperCase() === currentTicker?.toUpperCase() ||
      item.ticker_symbol?.split(".")[0]?.toUpperCase() === currentTicker?.split(".")[0]?.toUpperCase()
  );

  const formatDescription = (text, expanded) => {
    if (!text) return "";
    if (expanded || text.length <= 350) return text;
    const cut = text.lastIndexOf(" ", 350);
    return (cut > 0 ? text.slice(0, cut) : text.slice(0, 350)) + "...";
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (onFastPeriodChange) {
      onFastPeriodChange(newPeriod);
    } else if (stockResult?.source_metadata?.ticker) {
      onStockSearch(null, stockResult.source_metadata.ticker, stockResult.source_metadata.exchange, newPeriod);
    }
  };

  const formatMarketCap = (marketCap, currency) => {
    if (!marketCap) return "Not Available";
    const num = Number(marketCap);
    if (currency === "INR") {
      // Format in Crores (1 Crore = 10,000,000)
      const crores = num / 1e7;
      return `₹ ${crores.toLocaleString(undefined, { maximumFractionDigits: 2 })} Cr`;
    }
    // US / Global: Billions / Trillions
    if (num >= 1e12) {
      return `$ ${(num / 1e12).toFixed(2)} T`;
    }
    if (num >= 1e9) {
      return `$ ${(num / 1e9).toFixed(2)} B`;
    }
    return `$ ${(num / 1e6).toFixed(2)} M`;
  };

  return (
    <div className="workspace-root">
      {/* 1. Immersive 3D Interactive WebGL Scene */}
      <WorkspaceScene3D />

      {/* 2. Ambient Radiance & Cyber Grid Overlay (Matches Login) */}
      <div className="workspace-ambient">
        <div className="ws-glow ws-glow-top" />
        <div className="ws-glow ws-glow-center" />
        <div className="ws-glow ws-glow-bottom" />
        <div className="ws-glow ws-glow-deep" />
        <div className="ws-grid-overlay" />
      </div>

      {/* 3. Foreground Content with Framer Motion Animation */}
      <div className="workspace-content">
        {/* Top Navigation Bar */}
        <motion.nav
          className="workspace-navbar"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="ws-nav-brand">
            <div className="ws-brand-icon-box">
              <Cpu size={20} color="#00ff87" />
            </div>
            <div className="ws-brand-text">
              <span className="ws-brand-title">MARKET INTELLIGENCE AI</span>
              <span className="ws-brand-subtitle">
                MULTI-AGENT RESEARCH ENGINE
              </span>
            </div>
            <div className="ws-status-badge">
              <span className="ws-live-pulse" />
              <span>v2.4 ONLINE</span>
            </div>
          </div>

          <div className="ws-nav-actions">
            <div className="ws-user-pill">
              <div className="ws-user-avatar">
                {userEmail ? userEmail.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="ws-user-email">{userEmail}</span>
            </div>
            <motion.button
              className="ws-btn-logout"
              onClick={onLogout}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </motion.button>
          </div>
        </motion.nav>

        {/* Workspace Main Grid */}
        <main className="workspace-main">
          {/* =================================================================
              LEFT SIDEBAR: MODULE 1 (User Hub: Preferences, Watchlist, History)
              ================================================================= */}
          <motion.aside
            className="workspace-sidebar"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          >
            {/* 1. User Preferences Card */}
            <div className="ws-glass-card">
              <div className="ws-card-header">
                <div className="ws-card-title">
                  <Globe size={16} className="ws-card-title-icon" />
                  <span>User Preferences</span>
                </div>
              </div>

              <div className="ws-form-group">
                <label className="ws-form-label">Default Target Market</label>
                <CustomSelect
                  value={market}
                  onChange={(val) => setMarket(val)}
                  options={[
                    { value: "NSE", label: "NSE (India - INR)", sublabel: "National Stock Exchange of India" },
                    { value: "BSE", label: "BSE (India - INR)", sublabel: "Bombay Stock Exchange" },
                    { value: "NYSE", label: "NYSE (US - USD)", sublabel: "New York Stock Exchange" },
                    { value: "NASDAQ", label: "NASDAQ (US - USD)", sublabel: "National Association of Securities Dealers" },
                  ]}
                />
              </div>

              <div className="ws-form-group">
                <label className="ws-form-label">Analysis Period</label>
                <CustomSelect
                  value={period}
                  onChange={(val) => handlePeriodChange(val)}
                  options={[
                    { value: "1mo", label: "1 Month", sublabel: "Short-term swing analysis" },
                    { value: "3mo", label: "3 Months", sublabel: "Quarterly performance trend" },
                    { value: "6mo", label: "6 Months", sublabel: "Standard semi-annual view" },
                    { value: "1y", label: "1 Year", sublabel: "Annual historical pattern" },
                    { value: "5y", label: "5 Years", sublabel: "Macro cyclical long-term" },
                  ]}
                />
              </div>

              <motion.button
                className="ws-btn-primary"
                onClick={onPreferenceSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle size={15} />
                <span>Save Default Preferences</span>
              </motion.button>
            </div>

            {/* 2. Saved Watchlist Card */}
            <div className="ws-glass-card">
              <div className="ws-card-header">
                <div className="ws-card-title">
                  <Bookmark size={16} className="ws-card-title-icon" />
                  <span>Saved Watchlist</span>
                </div>
                <span className="ws-count-badge">{watchlist.length}</span>
              </div>

              {watchlist.length === 0 ? (
                <div className="ws-empty-text">
                  <p>No stocks saved to watchlist yet.</p>
                  <span style={{ fontSize: "11px", color: "var(--ws-text-muted)" }}>
                    Search a company and click "+ Add to Watchlist"
                  </span>
                </div>
              ) : (
                <div className="ws-list-container">
                  {watchlist.map((item) => (
                    <motion.div
                      key={item.id}
                      className="ws-list-item"
                      onClick={() => {
                        setSearchQuery(item.ticker_symbol);
                        onStockSearch(null, item.ticker_symbol, item.exchange);
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="ws-list-left">
                        <div className="ws-list-dot" />
                        <span className="ws-list-name">{item.company_name}</span>
                      </div>
                      <div className="ws-list-right">
                        <span className="ws-list-ticker">{item.ticker_symbol}</span>
                        <button
                          type="button"
                          className="ws-watchlist-del-btn"
                          title="Remove from favorites"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onRemoveFromWatchlist) {
                              onRemoveFromWatchlist(item.id, item.ticker_symbol);
                            }
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Recent Research History Card */}
            <div className="ws-glass-card">
              <div className="ws-card-header">
                <div className="ws-card-title">
                  <History size={16} className="ws-card-title-icon" />
                  <span>Research History</span>
                </div>
                <span className="ws-count-badge">{history.length}</span>
              </div>

              {history.length === 0 ? (
                <div className="ws-empty-text">
                  <p>No recent searches recorded.</p>
                </div>
              ) : (
                <div className="ws-list-container">
                  {history.slice(0, 7).map((h) => (
                    <motion.div
                      key={h.id}
                      className="ws-list-item"
                      onClick={() => {
                        setSearchQuery(h.ticker_symbol);
                        onStockSearch(null, h.ticker_symbol, h.exchange);
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="ws-list-left">
                        <span className="ws-list-name">{h.company_name}</span>
                      </div>
                      <span className="ws-list-ticker">{h.ticker_symbol}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>

          {/* =================================================================
              RIGHT MAIN AREA: MODULE 2 (Stock Search, Recharts, Validation, Financials)
              ================================================================= */}
          <motion.div
            className="workspace-body"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            {/* 1. Publicly Traded Company Search with Autocomplete (Requirement 3) */}
            <StockSearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={onStockSearch}
              loading={loading}
              market={market}
              setMarket={setMarket}
              searchError={searchError}
            />

            {/* AI Agent Swarm Architecture (Requirement 5) */}
            {!stockResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <AIAgentCards
                  agentAnalysis={agentAnalysis}
                  agentLoading={agentLoading}
                  onRunAnalysis={onRunAgentAnalysis}
                  ticker={searchQuery}
                  currency={market === "NSE" || market === "BSE" ? "INR" : "USD"}
                />
              </motion.div>
            )}

            {/* 2. Stock Result Sections */}
            <AnimatePresence>
              {stockResult && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Company Profile Header Card (Requirement 6 & 9) */}
                  <motion.div
                    className="ws-glass-card"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                  >
                    <div className="ws-company-header">
                      <div className="ws-company-title-area">
                        <h2>
                          <span>{stockResult.source_metadata.company_name}</span>
                          <span className="ticker-highlight">
                            ({stockResult.source_metadata.ticker})
                          </span>
                        </h2>
                        <p className="ws-company-sector">
                          Sector:{" "}
                          <strong style={{ color: "var(--ws-text-primary)" }}>
                            {stockResult.company_profile.sector || "Not Available"}
                          </strong>{" "}
                          | Industry:{" "}
                          <strong style={{ color: "var(--ws-text-primary)" }}>
                            {stockResult.company_profile.industry || "Not Available"}
                          </strong>
                        </p>
                      </div>

                      {isSavedInWatchlist ? (
                        <motion.button
                          className="ws-btn-outline ws-btn-watchlist in-watchlist"
                          onClick={() => {
                            if (onRemoveFromWatchlist) {
                              const match = watchlist?.find(
                                (item) =>
                                  item.ticker_symbol?.toUpperCase() === currentTicker?.toUpperCase() ||
                                  item.ticker_symbol?.split(".")[0]?.toUpperCase() === currentTicker?.split(".")[0]?.toUpperCase()
                              );
                              onRemoveFromWatchlist(match?.id, currentTicker);
                            }
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          title="Click to remove from favorites"
                        >
                          <Check size={14} color="#00ff87" />
                          <span>Saved in Watchlist (Remove)</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          className="ws-btn-outline"
                          onClick={onAddToWatchlist}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          <Bookmark size={14} />
                          <span>+ Add to Watchlist</span>
                        </motion.button>
                      )}
                    </div>

                    {/* Key Corporate Metrics Badges (Requirement 6) */}
                    <div className="ws-badge-row">
                      <span className="ws-badge">
                        Exchange: <strong>{stockResult.source_metadata.exchange}</strong>
                      </span>
                      <span className="ws-badge">
                        Currency: <strong>{stockResult.source_metadata.currency}</strong>
                      </span>
                      <span className="ws-badge">
                        Market Cap:{" "}
                        <strong style={{ color: "var(--ws-accent-green)" }}>
                          {formatMarketCap(
                            stockResult.company_profile.market_cap,
                            stockResult.source_metadata.currency
                          )}
                        </strong>
                      </span>
                      {stockResult.company_profile.website && stockResult.company_profile.website !== "Not Available" && (
                        <a
                          href={stockResult.company_profile.website}
                          target="_blank"
                          rel="noreferrer"
                          className="ws-badge ws-website-link"
                        >
                          Website: <strong>{stockResult.company_profile.website.replace(/^https?:\/\//, "")}</strong>
                          <ExternalLink size={12} style={{ marginLeft: 4 }} />
                        </a>
                      )}
                    </div>

                    {/* Data Source & Timestamp Tracking (Requirement 9) */}
                    <div className="ws-tracking-pill">
                      <div className="ws-live-pulse" />
                      <span>Data Provider: <strong>{stockResult.source_metadata.data_source}</strong></span>
                      <span className="ws-tracking-divider">•</span>
                      <span>UTC Retrieved: <strong>{new Date(stockResult.source_metadata.retrieved_at).toUTCString()}</strong></span>
                      {stockResult.source_metadata.source_url && (
                        <>
                          <span className="ws-tracking-divider">•</span>
                          <a
                            href={stockResult.source_metadata.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="ws-source-link"
                          >
                            Source Link <ExternalLink size={11} />
                          </a>
                        </>
                      )}
                    </div>

                    {stockResult.company_profile.description && (
                      <div className="ws-company-desc">
                        <p style={{ margin: 0 }}>
                          {formatDescription(stockResult.company_profile.description, descExpanded)}
                        </p>
                        {stockResult.company_profile.description.length > 350 && (
                          <button
                            type="button"
                            className="ws-read-more-btn"
                            onClick={() => setDescExpanded((prev) => !prev)}
                          >
                            {descExpanded ? "Show Less ↑" : "Show More Description ↓"}
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>

                  {/* 3. Interactive Recharts Price & Volume Chart (Requirement 1 & 4) */}
                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <StockPriceChart
                      ohlcvData={stockResult.ohlcv_data}
                      currency={stockResult.source_metadata.currency}
                      activePeriod={period}
                      onPeriodChange={handlePeriodChange}
                      loading={loading}
                      chartLoading={chartLoading}
                    />
                  </motion.div>

                  {/* Multi-Agent Swarm Section (Requirement 5) */}
                  <AIAgentCards
                    agentAnalysis={agentAnalysis}
                    agentLoading={agentLoading}
                    onRunAnalysis={() =>
                      onRunAgentAnalysis(
                        stockResult.source_metadata.ticker,
                        stockResult.source_metadata.exchange,
                        period
                      )
                    }
                    ticker={stockResult.source_metadata.ticker}
                    currency={stockResult.source_metadata.currency}
                  />

                  {/* 4. Data Validation & Quality Summary Card (Requirement 8) */}
                  <motion.div
                    className="ws-glass-card"
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <div className="ws-card-header">
                      <div className="ws-card-title">
                        <ShieldCheck size={16} className="ws-card-title-icon" />
                        <span>Data Quality & Validation Audit</span>
                      </div>
                      <span
                        className={`ws-count-badge ${
                          stockResult.validation_summary.status === "PASS" ? "status-pass" : ""
                        }`}
                      >
                        Status: {stockResult.validation_summary.status}
                      </span>
                    </div>

                    <div className="ws-stats-grid">
                      <div className="ws-stat-card">
                        <span className="ws-stat-label">Initial Downloaded</span>
                        <span className="ws-stat-val">
                          <AnimatedCounter value={stockResult.validation_summary.initial_records} />
                        </span>
                      </div>

                      <div className="ws-stat-card">
                        <span className="ws-stat-label">Valid OHLCV Records</span>
                        <span className="ws-stat-val positive">
                          <AnimatedCounter value={stockResult.validation_summary.valid_records_returned} />
                        </span>
                      </div>

                      <div className="ws-stat-card">
                        <span className="ws-stat-label">Duplicate Dates Filtered</span>
                        <span className="ws-stat-val">
                          <AnimatedCounter value={stockResult.validation_summary.duplicates_removed} />
                        </span>
                      </div>

                      <div className="ws-stat-card">
                        <span className="ws-stat-label">Invalid Dates Dropped</span>
                        <span className="ws-stat-val">
                          <AnimatedCounter value={stockResult.validation_summary.invalid_dates_dropped || 0} />
                        </span>
                      </div>

                      <div className="ws-stat-card">
                        <span className="ws-stat-label">Missing Values Detected</span>
                        <span className="ws-stat-val">
                          <AnimatedCounter
                            value={
                              stockResult.validation_summary.missing_values_detected ||
                              stockResult.validation_summary.missing_values_filled ||
                              0
                            }
                          />
                        </span>
                      </div>

                      <div className="ws-stat-card">
                        <span className="ws-stat-label">Inconsistent Prices Dropped</span>
                        <span className="ws-stat-val">
                          <AnimatedCounter value={stockResult.validation_summary.inconsistent_rows_dropped} />
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* 5. Historical OHLCV Data Table (Requirement 5) */}
                  <motion.div
                    className="ws-glass-card"
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <div className="ws-card-header">
                      <div className="ws-card-title">
                        <BarChart2 size={16} className="ws-card-title-icon" />
                        <span>
                          Structured OHLCV Historical Prices ({stockResult.source_metadata.currency})
                        </span>
                      </div>
                      <span className="ws-count-badge">
                        <AnimatedCounter value={stockResult.ohlcv_data.length} /> Trading Days
                      </span>
                    </div>

                    <div className="ws-table-container">
                      <table className="ws-table">
                        <thead>
                          <tr>
                            <th>Trading Date</th>
                            <th>Open</th>
                            <th>High</th>
                            <th>Low</th>
                            <th>Close</th>
                            <th>Adj Close</th>
                            <th>Volume</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockResult.ohlcv_data
                            .slice()
                            .reverse()
                            .slice(0, 30)
                            .map((row, idx) => (
                              <tr key={idx}>
                                <td>{row.trading_date}</td>
                                <td>{Number(row.Open).toFixed(2)}</td>
                                <td>{Number(row.High).toFixed(2)}</td>
                                <td>{Number(row.Low).toFixed(2)}</td>
                                <td className="highlight-price">
                                  {Number(row.Close).toFixed(2)}
                                </td>
                                <td>{row["Adj Close"] ? Number(row["Adj Close"]).toFixed(2) : "-"}</td>
                                <td>{Number(row.Volume).toLocaleString()}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>

                  {/* 6. Corporate Financial Statements (Annual & Quarterly) (Requirement 7) */}
                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <FinancialStatementsView
                      financialStatements={stockResult.financial_statements}
                      ticker={stockResult.source_metadata.ticker}
                      currency={stockResult.source_metadata.currency}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
