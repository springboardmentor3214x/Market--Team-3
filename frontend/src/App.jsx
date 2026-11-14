import React, { useState, useEffect } from "react";
import {
  registerUser,
  loginUser,
  fetchWorkspace,
  savePreferences,
  addStockToWatchlist,
  searchStockData,
} from "./api";
import "./App.css";

function App() {
  // --- Auth State (Module 1) ---
  const [token, setToken] = useState(localStorage.getItem("jwt_token") || "");
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState({ type: "", text: "" });

  // --- Workspace State (Module 1) ---
  const [userEmail, setUserEmail] = useState(localStorage.getItem("user_email") || "");
  const [market, setMarket] = useState("NSE");
  const [period, setPeriod] = useState("6mo");
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);

  // --- Market Data State (Module 2) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockResult, setStockResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [activeStatement, setActiveStatement] = useState("income_statement");

  // Load workspace data when user logs in
  const loadUserWorkspace = async () => {
    try {
      const data = await fetchWorkspace();
      if (data.preferences) {
        setMarket(data.preferences.preferred_market || "NSE");
        setPeriod(data.preferences.analysis_period || "6mo");
      }
      setWatchlist(data.watchlist || []);
      setHistory(data.research_history || []);
    } catch (err) {
      handleLogout();
    }
  };

  useEffect(() => {
    if (token) {
      loadUserWorkspace();
    }
  }, [token]);

  // --- Module 1: Registration & Login Handler ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthMessage({ type: "", text: "" });

    if (password.length < 6) {
      setAuthMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    try {
      if (isLoginView) {
        const res = await loginUser(email, password);
        localStorage.setItem("jwt_token", res.access_token);
        localStorage.setItem("user_email", res.email);
        setUserEmail(res.email);
        setToken(res.access_token);
      } else {
        await registerUser(email, password);
        setAuthMessage({
          type: "success",
          text: "Registration successful! Please log in with your credentials.",
        });
        setIsLoginView(true);
      }
    } catch (err) {
      setAuthMessage({ type: "error", text: err.message });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_email");
    setToken("");
    setStockResult(null);
  };

  // --- Module 1: Save User Preferences ---
  const handlePreferenceSave = async () => {
    try {
      await savePreferences(market, period);
      alert(`Preferences saved: Market (${market}), Period (${period})`);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Module 2: Search Stock & Collect Validated Data ---
  const handleStockSearch = async (e, customQuery = null, customMarket = null) => {
    if (e) e.preventDefault();
    const q = customQuery || searchQuery;
    const m = customMarket || market;
    if (!q.trim()) return;

    setLoading(true);
    setSearchError("");
    try {
      const result = await searchStockData(q, m, period);
      setStockResult(result);
      loadUserWorkspace(); // Refresh user's research history
    } catch (err) {
      setSearchError(err.message);
      setStockResult(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Module 1: Add Current Stock to Watchlist ---
  const handleAddToWatchlist = async () => {
    if (!stockResult) return;
    try {
      const meta = stockResult.source_metadata;
      await addStockToWatchlist(meta.ticker, meta.company_name, meta.exchange);
      loadUserWorkspace();
      alert(`${meta.company_name} added to your watchlist!`);
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================================
  // VIEW 1: LOGIN & REGISTRATION SCREEN
  // ==========================================
  if (!token) {
    return (
      <div className="auth-container">
        <h2>{isLoginView ? "Sign In to Research Workspace" : "Create Account"}</h2>
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>
          AI-Powered Multi-Agent Stock Research Analyst
        </p>

        {authMessage.text && (
          <div className={authMessage.type === "error" ? "alert-error" : "alert-success"}>
            {authMessage.text}
          </div>
        )}

        <form onSubmit={handleAuthSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="ankit@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="Enter password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn" style={{ width: "100%", marginTop: "20px" }}>
            {isLoginView ? "Login" : "Register"}
          </button>
        </form>

        <p style={{ marginTop: "16px", fontSize: "14px", textAlign: "center", color: "#94a3b8" }}>
          {isLoginView ? "New user? " : "Already have an account? "}
          <span
            style={{ color: "#38bdf8", cursor: "pointer", fontWeight: 600 }}
            onClick={() => {
              setIsLoginView(!isLoginView);
              setAuthMessage({ type: "", text: "" });
            }}
          >
            {isLoginView ? "Create an account" : "Login here"}
          </span>
        </p>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: PROTECTED RESEARCH WORKSPACE
  // ==========================================
  const statementObj =
    stockResult?.financial_statements?.[activeStatement]?.statement || {};
  const statementDates = Object.keys(statementObj);
  const statementMetrics =
    statementDates.length > 0 ? Object.keys(statementObj[statementDates[0]] || {}) : [];

  return (
    <div>
      {/* Top Navbar */}
      <nav className="navbar">
        <h1>Multi-Agent Stock Research Analyst</h1>
        <div className="user-bar">
          <span style={{ fontSize: "14px", color: "#94a3b8" }}>{userEmail}</span>
          <button className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="workspace-grid">
        {/* LEFT SIDEBAR: Module 1 (Preferences, Watchlist, Research History) */}
        <div>
          {/* 1. User Preferences */}
          <div className="card">
            <h3>User Preferences</h3>
            <div className="form-group">
              <label style={{ fontSize: "13px" }}>Preferred Market</label>
              <select value={market} onChange={(e) => setMarket(e.target.value)}>
                <option value="NSE">NSE (India - INR)</option>
                <option value="BSE">BSE (India - INR)</option>
                <option value="NYSE">NYSE (US - USD)</option>
                <option value="NASDAQ">NASDAQ (US - USD)</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: "13px" }}>Analysis Period</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="1mo">1 Month</option>
                <option value="3mo">3 Months</option>
                <option value="6mo">6 Months</option>
                <option value="1y">1 Year</option>
                <option value="5y">5 Years</option>
              </select>
            </div>
            <button
              className="btn"
              style={{ width: "100%", marginTop: "14px" }}
              onClick={handlePreferenceSave}
            >
              Save Default Preferences
            </button>
          </div>

          {/* 2. Saved Watchlist */}
          <div className="card">
            <h3>Saved Watchlist ({watchlist.length})</h3>
            {watchlist.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#64748b" }}>No stocks saved yet.</p>
            ) : (
              watchlist.map((item) => (
                <div
                  key={item.id}
                  className="list-item"
                  onClick={() => {
                    setSearchQuery(item.ticker_symbol);
                    handleStockSearch(null, item.ticker_symbol, item.exchange);
                  }}
                >
                  <strong>{item.company_name}</strong>
                  <span>{item.ticker_symbol}</span>
                </div>
              ))
            )}
          </div>

          {/* 3. User-Specific Research History */}
          <div className="card">
            <h3>Recent Research History</h3>
            {history.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#64748b" }}>No recent searches.</p>
            ) : (
              history.slice(0, 8).map((h) => (
                <div
                  key={h.id}
                  className="list-item"
                  onClick={() => {
                    setSearchQuery(h.ticker_symbol);
                    handleStockSearch(null, h.ticker_symbol, h.exchange);
                  }}
                >
                  <span>{h.company_name}</span>
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>{h.ticker_symbol}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN AREA: Module 2 (Stock Search, OHLCV, Validation & Financials) */}
        <div>
          {/* Stock Search Bar */}
          <div className="card">
            <h3>Search Publicly Traded Company (Module 2)</h3>
            <form className="search-bar" onSubmit={handleStockSearch}>
              <input
                type="text"
                placeholder="Enter Company Name or Ticker (e.g., Infosys, INFY, Reliance, TCS, AAPL)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Collecting Data..." : "Search & Collect Data"}
              </button>
            </form>
            {searchError && <div className="alert-error">{searchError}</div>}
          </div>

          {/* Search Results Display */}
          {stockResult && (
            <>
              {/* Company Profile & Source Tracking */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ color: "#38bdf8" }}>
                      {stockResult.source_metadata.company_name} ({stockResult.source_metadata.ticker})
                    </h2>
                    <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "4px" }}>
                      Sector: {stockResult.company_profile.sector} | Industry:{" "}
                      {stockResult.company_profile.industry}
                    </p>
                  </div>
                  <button className="btn btn-outline" onClick={handleAddToWatchlist}>
                    + Add to Watchlist
                  </button>
                </div>

                {/* Data Source & Timestamp Tracking (Requirement 5) */}
                <div className="badge-row">
                  <span className="badge">
                    Exchange: <strong>{stockResult.source_metadata.exchange}</strong>
                  </span>
                  <span className="badge">
                    Currency: <strong>{stockResult.source_metadata.currency}</strong>
                  </span>
                  <span className="badge">
                    Source: <strong>{stockResult.source_metadata.data_source}</strong>
                  </span>
                  <span className="badge">
                    Retrieved At:{" "}
                    <strong>
                      {new Date(stockResult.source_metadata.retrieved_at).toLocaleString()}
                    </strong>
                  </span>
                </div>

                <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5" }}>
                  {stockResult.company_profile.description?.slice(0, 420)}...
                </p>
              </div>

              {/* Data Validation Report (Requirement 6) */}
              <div className="card">
                <h3>Data Quality & Validation Summary</h3>
                <div className="badge-row">
                  <span className="badge">
                    Initial Rows: <strong>{stockResult.validation_summary.initial_records}</strong>
                  </span>
                  <span className="badge">
                    Valid OHLCV Rows:{" "}
                    <strong style={{ color: "#4ade80" }}>
                      {stockResult.validation_summary.valid_records_returned}
                    </strong>
                  </span>
                  <span className="badge">
                    Duplicates Removed:{" "}
                    <strong>{stockResult.validation_summary.duplicates_removed}</strong>
                  </span>
                  <span className="badge">
                    Missing Values Handled:{" "}
                    <strong>{stockResult.validation_summary.missing_values_filled}</strong>
                  </span>
                  <span className="badge">
                    Inconsistent Rows Dropped:{" "}
                    <strong>{stockResult.validation_summary.inconsistent_rows_dropped}</strong>
                  </span>
                </div>
              </div>

              {/* Historical OHLCV Data Table (Requirements 2 & 3) */}
              <div className="card">
                <h3>
                  Historical OHLCV Prices ({stockResult.source_metadata.currency})
                </h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Trading Date</th>
                        <th>Open</th>
                        <th>High</th>
                        <th>Low</th>
                        <th>Close</th>
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
                            <td>{row.Open}</td>
                            <td>{row.High}</td>
                            <td>{row.Low}</td>
                            <td>
                              <strong>{row.Close}</strong>
                            </td>
                            <td>{row.Volume.toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Statements (Requirement 4) */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3>Financial Statements</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className={`btn ${activeStatement === "income_statement" ? "" : "btn-outline"}`}
                      onClick={() => setActiveStatement("income_statement")}
                    >
                      Income Statement
                    </button>
                    <button
                      className={`btn ${activeStatement === "balance_sheet" ? "" : "btn-outline"}`}
                      onClick={() => setActiveStatement("balance_sheet")}
                    >
                      Balance Sheet
                    </button>
                    <button
                      className={`btn ${activeStatement === "cash_flow" ? "" : "btn-outline"}`}
                      onClick={() => setActiveStatement("cash_flow")}
                    >
                      Cash Flow
                    </button>
                  </div>
                </div>

                {statementDates.length === 0 ? (
                  <p style={{ marginTop: "12px", color: "#94a3b8" }}>
                    Financial statement data not available for this company.
                  </p>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Metric</th>
                          {statementDates.map((d) => (
                            <th key={d}>{d}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {statementMetrics.slice(0, 15).map((metric) => (
                          <tr key={metric}>
                            <td>{metric}</td>
                            {statementDates.map((d) => (
                              <td key={d}>
                                {Number(statementObj[d][metric] || 0).toLocaleString()}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;