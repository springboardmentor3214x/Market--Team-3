import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import LoginPage from "./components/Login/LoginPage";
import Workspace from "./components/Workspace/Workspace";
import {
  fetchWorkspace,
  savePreferences,
  addStockToWatchlist,
  searchStockData,
  fetchMultiAgentAnalysis,
} from "./api";
import { ChevronDown } from "lucide-react";
import "./App.css";

function App() {
  // --- Auth State ---
  const alreadyLoggedIn = !!localStorage.getItem("jwt_token");
  const [token, setToken] = useState(localStorage.getItem("jwt_token") || "");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("user_email") || "");

  // --- Transition State ---
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loginHidden, setLoginHidden] = useState(alreadyLoggedIn);
  const workspaceRef = useRef(null);

  // --- Workspace State ---
  const [market, setMarket] = useState("NSE");
  const [period, setPeriod] = useState("6mo");
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);

  // --- Market Data State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockResult, setStockResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [activeStatement, setActiveStatement] = useState("income_statement");

  // --- Module 3: Specialized AI Agent State ---
  const [agentAnalysis, setAgentAnalysis] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // Initialize Lenis Smooth Inertial Scrolling (Matches video reference)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.8,
    });
    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.lenis;
    };
  }, []);

  // Load workspace data
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
    if (token) loadUserWorkspace();
  }, [token]);

  // --- Smooth Scroll Transition Handler ---
  const handleLoginSuccess = (jwtToken, loggedInEmail, loggedInUserId) => {
    localStorage.setItem("jwt_token", jwtToken);
    localStorage.setItem("user_email", loggedInEmail);
    setUserEmail(loggedInEmail);
    setToken(jwtToken);
    setIsTransitioning(true);

    // Wait for workspace to render, then smoothly scroll with Lenis
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (window.lenis && workspaceRef.current) {
          window.lenis.scrollTo(workspaceRef.current, {
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        } else if (workspaceRef.current) {
          workspaceRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
        // After scroll completes, hide login and snap to top
        setTimeout(() => {
          setLoginHidden(true);
          setIsTransitioning(false);
          requestAnimationFrame(() => {
            if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
            else window.scrollTo(0, 0);
          });
        }, 1400);
      }, 200);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_email");
    setToken("");
    setUserEmail("");
    setStockResult(null);
    setAgentAnalysis(null);
    setLoginHidden(false);
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  };

  const handlePreferenceSave = async () => {
    try {
      await savePreferences(market, period);
      alert(`Preferences saved: Market (${market}), Period (${period})`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRunAgentAnalysis = async (tickerOverride = null, marketOverride = null, periodOverride = null) => {
    const t = tickerOverride || stockResult?.source_metadata?.ticker || searchQuery;
    const m = marketOverride || stockResult?.source_metadata?.exchange || market;
    const p = periodOverride || period;
    if (!t) return;

    setAgentLoading(true);
    try {
      const data = await fetchMultiAgentAnalysis(t, m, p);
      setAgentAnalysis(data);
    } catch (err) {
      console.error("Multi-Agent analysis error:", err);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleStockSearch = async (e, customQuery = null, customMarket = null, customPeriod = null) => {
    if (e) e.preventDefault();
    const q = customQuery || searchQuery;
    const m = customMarket || market;
    const p = customPeriod || period;
    if (!q.trim()) return;

    setLoading(true);
    setSearchError("");
    try {
      const result = await searchStockData(q, m, p);
      setStockResult(result);
      loadUserWorkspace();

      // Trigger Module 3 Multi-Agent Research Swarm concurrently
      const resolvedTicker = result.source_metadata?.ticker || q;
      const resolvedMarket = result.source_metadata?.exchange || m;
      handleRunAgentAnalysis(resolvedTicker, resolvedMarket, p);
    } catch (err) {
      setSearchError(err.message);
      setStockResult(null);
      setAgentAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

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
  // SINGLE RENDER PATH — no component remounting
  // Login is hidden via CSS when loginHidden=true
  // ==========================================
  return (
    <div className="app-scroll-container">
      {/* ===== SECTION 1: LOGIN (hidden after transition) ===== */}
      {!loginHidden && (
        <section className="app-scroll-section">
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        </section>
      )}

      {/* ===== TRANSITION BANNER ===== */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="scroll-transition-banner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="scroll-pulse-dot" />
            <span>Initializing Research Workspace</span>
            <ChevronDown size={18} className="bounce-arrow" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== SECTION 2: WORKSPACE ===== */}
      {token && (
        <section ref={workspaceRef} className="app-scroll-section">
          <Workspace
            userEmail={userEmail}
            onLogout={handleLogout}
            market={market}
            setMarket={setMarket}
            period={period}
            setPeriod={setPeriod}
            onPreferenceSave={handlePreferenceSave}
            watchlist={watchlist}
            history={history}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onStockSearch={handleStockSearch}
            loading={loading}
            stockResult={stockResult}
            searchError={searchError}
            onAddToWatchlist={handleAddToWatchlist}
            activeStatement={activeStatement}
            setActiveStatement={setActiveStatement}
            agentAnalysis={agentAnalysis}
            agentLoading={agentLoading}
            onRunAgentAnalysis={handleRunAgentAnalysis}
          />
        </section>
      )}
    </div>
  );
}

export default App;
