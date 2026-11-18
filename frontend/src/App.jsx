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
import "./App.css";

function App() {
  // --- Auth State ---
  const alreadyLoggedIn = !!localStorage.getItem("jwt_token");
  const [token, setToken] = useState(localStorage.getItem("jwt_token") || "");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("user_email") || "");

  // --- Cinematic Crossfade Transition State ---
  const [showLogin, setShowLogin] = useState(!alreadyLoggedIn);
  const [showWorkspace, setShowWorkspace] = useState(alreadyLoggedIn);
  const [transitionPhase, setTransitionPhase] = useState("idle"); // idle | fading | done

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

  // Initialize Lenis Smooth Inertial Scrolling
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

  // --- Cinematic Crossfade Login → Workspace ---
  const handleLoginSuccess = (jwtToken, loggedInEmail, loggedInUserId) => {
    localStorage.setItem("jwt_token", jwtToken);
    localStorage.setItem("user_email", loggedInEmail);
    setUserEmail(loggedInEmail);
    setToken(jwtToken);

    // Reset scroll to top immediately
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);

    // Phase 1: Start fade-out of login, fade-in workspace overlay
    setTransitionPhase("fading");
    setShowWorkspace(true);

    // Phase 2: After crossfade completes, remove login from DOM entirely
    setTimeout(() => {
      setShowLogin(false);
      setTransitionPhase("done");
      // Ensure scroll is at top of workspace
      if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
      // Final cleanup
      setTimeout(() => setTransitionPhase("idle"), 100);
    }, 900);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_email");
    setToken("");
    setUserEmail("");
    setStockResult(null);
    setAgentAnalysis(null);
    setTransitionPhase("idle");
    setShowLogin(true);
    setShowWorkspace(false);
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
  // CINEMATIC CROSSFADE — zero jump, zero glitch
  // Login overlays fixed & fades/blurs out while Workspace reveals smoothly
  // ==========================================
  return (
    <div className="app-crossfade-container">
      {/* ===== LOGIN LAYER (crossfades out on success) ===== */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            className={`app-crossfade-layer app-crossfade-login ${
              transitionPhase === "fading" ? "is-fading" : ""
            }`}
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              opacity: transitionPhase === "fading" ? 0 : 1,
              scale: transitionPhase === "fading" ? 1.03 : 1,
              filter: transitionPhase === "fading" ? "blur(10px)" : "blur(0px)",
            }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== WORKSPACE LAYER (reveals smoothly at top) ===== */}
      <AnimatePresence>
        {showWorkspace && (
          <motion.div
            className="app-crossfade-layer app-crossfade-workspace"
            initial={{ opacity: transitionPhase === "fading" ? 0 : 1, y: transitionPhase === "fading" ? 16 : 0 }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
