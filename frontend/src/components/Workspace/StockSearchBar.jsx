import React, { useState, useEffect, useRef } from "react";
import { Search, Zap, X, ChevronRight, Globe, AlertCircle } from "lucide-react";
import { searchStocksAutocomplete } from "../../api";

const QUICK_STOCKS = [
  { ticker: "INFY.NS", label: "Infosys", exchange: "NSE" },
  { ticker: "RELIANCE.NS", label: "Reliance", exchange: "NSE" },
  { ticker: "TCS.NS", label: "TCS", exchange: "NSE" },
  { ticker: "AAPL", label: "Apple", exchange: "NASDAQ" },
  { ticker: "NVDA", label: "NVIDIA", exchange: "NASDAQ" },
  { ticker: "TSLA", label: "Tesla", exchange: "NASDAQ" },
  { ticker: "MSFT", label: "Microsoft", exchange: "NASDAQ" },
];

export default function StockSearchBar({
  searchQuery,
  setSearchQuery,
  onSearch,
  loading,
  market,
  setMarket,
  searchError,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const searchWrapperRef = useRef(null);

  // Debounce search query for real-time autocomplete
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch suggestions when debouncedQuery changes
  useEffect(() => {
    let isCancelled = false;
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await searchStocksAutocomplete(debouncedQuery, market);
        if (!isCancelled) {
          setSuggestions(results || []);
        }
      } catch (err) {
        if (!isCancelled) setSuggestions([]);
      }
    };

    fetchSuggestions();
    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, market]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item) => {
    setSearchQuery(item.ticker);
    setIsDropdownOpen(false);
    onSearch(null, item.ticker, item.exchange);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    onSearch(e);
  };

  return (
    <div className="ws-search-card" ref={searchWrapperRef}>
      <div className="ws-card-header">
        <div className="ws-card-title">
          <Search size={16} className="ws-card-title-icon" />
          <span>Stock Search & Market Intelligence</span>
        </div>
        <div className="ws-market-pill-selector">
          {["NSE", "BSE", "NYSE", "NASDAQ"].map((m) => (
            <button
              key={m}
              type="button"
              className={`ws-market-tab ${market === m ? "active" : ""}`}
              onClick={() => setMarket(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <form className="ws-search-form" onSubmit={handleSubmit}>
        <div className="ws-search-input-wrapper">
          <Search size={18} className="ws-search-icon" />
          <input
            type="text"
            className="ws-search-input"
            placeholder={`Search by company name or ticker in ${market} (e.g. INFY, Reliance, AAPL, MSFT)...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0 || searchQuery.trim()) {
                setIsDropdownOpen(true);
              }
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className="ws-search-clear-btn"
              onClick={() => {
                setSearchQuery("");
                setSuggestions([]);
              }}
            >
              <X size={14} />
            </button>
          )}

          {/* Autocomplete Dropdown List */}
          {isDropdownOpen && suggestions.length > 0 && (
            <div className="ws-autocomplete-dropdown">
              <div className="ws-dropdown-header">Suggestions matching "{debouncedQuery}"</div>
              {suggestions.map((item) => (
                <div
                  key={item.ticker}
                  className="ws-autocomplete-item"
                  onClick={() => handleSelectSuggestion(item)}
                >
                  <div className="ws-auto-left">
                    <span className="ws-auto-name">{item.name}</span>
                    <span className="ws-auto-exchange">
                      {item.exchange} • {item.currency}
                    </span>
                  </div>
                  <div className="ws-auto-right">
                    <span className="ws-auto-ticker">{item.ticker}</span>
                    <ChevronRight size={14} color="#64748b" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="ws-btn-primary ws-search-submit-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="ws-spinner-dot" />
              <span>Collecting Data...</span>
            </>
          ) : (
            <>
              <Zap size={16} />
              <span>Search & Collect Data</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Alpha Ticker Badges */}
      <div className="ws-suggestions-row">
        <span className="ws-suggestion-label">Quick Alpha:</span>
        {QUICK_STOCKS.map((item) => (
          <button
            key={item.ticker}
            type="button"
            className="ws-suggestion-pill"
            onClick={() => {
              setSearchQuery(item.ticker);
              onSearch(null, item.ticker, item.exchange);
            }}
          >
            {item.label} ({item.exchange})
          </button>
        ))}
      </div>

      {/* Meaningful Error Handling Banner */}
      {searchError && (
        <div className="ws-alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{searchError}</span>
        </div>
      )}
    </div>
  );
}
