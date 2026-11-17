/**
 * API Service Layer (Connects React Frontend to FastAPI Backend)
 * Automatically attaches JWT Bearer token for protected endpoints.
 */
const API_BASE_URL = "http://127.0.0.1:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("jwt_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ==========================================
// MODULE 1: AUTH & WORKSPACE APIS
// ==========================================

export const registerUser = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    return data;
  } catch (err) {
    if (err.message && err.message.includes("Failed to fetch")) {
      throw new Error(
        "Unable to connect to backend at http://127.0.0.1:8000. Please ensure the FastAPI server is running."
      );
    }
    throw err;
  }
};

export const loginUser = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Invalid credentials");
    return data;
  } catch (err) {
    if (err.message && err.message.includes("Failed to fetch")) {
      throw new Error(
        "Unable to connect to backend at http://127.0.0.1:8000. Please ensure the FastAPI server is running."
      );
    }
    throw err;
  }
};

export const fetchWorkspace = async () => {
  const res = await fetch(`${API_BASE_URL}/api/user/workspace`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to load workspace");
  return data;
};

export const savePreferences = async (preferred_market, analysis_period) => {
  const res = await fetch(`${API_BASE_URL}/api/user/preferences`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ preferred_market, analysis_period }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to update preferences");
  return data;
};

export const addStockToWatchlist = async (ticker_symbol, company_name, exchange) => {
  const res = await fetch(`${API_BASE_URL}/api/user/watchlist`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ticker_symbol, company_name, exchange }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to add to watchlist");
  return data;
};

// ==========================================
// MODULE 2: STOCK SEARCH & MARKET DATA APIS
// ==========================================

export const searchStocksAutocomplete = async (query, market = "NSE") => {
  const params = new URLSearchParams({ q: query, market });
  const res = await fetch(`${API_BASE_URL}/api/stocks/search?${params.toString()}`);
  if (!res.ok) return [];
  return res.json();
};

export const fetchStockProfile = async (ticker, market = "NSE") => {
  const params = new URLSearchParams({ market });
  const res = await fetch(`${API_BASE_URL}/api/stocks/${encodeURIComponent(ticker)}/profile?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch company profile");
  return data;
};

export const fetchStockHistory = async (ticker, period = "6mo", market = "NSE") => {
  const params = new URLSearchParams({ period, market });
  const res = await fetch(`${API_BASE_URL}/api/stocks/${encodeURIComponent(ticker)}/history?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch price history");
  return data;
};

export const fetchStockFinancials = async (ticker, frequency = "annual", market = "NSE") => {
  const params = new URLSearchParams({ frequency, market });
  const res = await fetch(`${API_BASE_URL}/api/stocks/${encodeURIComponent(ticker)}/financials?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch financial statements");
  return data;
};

export const fetchStockValidation = async (ticker, period = "6mo", market = "NSE") => {
  const params = new URLSearchParams({ period, market });
  const res = await fetch(`${API_BASE_URL}/api/stocks/${encodeURIComponent(ticker)}/validate?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch validation summary");
  return data;
};

export const searchStockData = async (query, market, period) => {
  const params = new URLSearchParams({ query, market, period });
  const res = await fetch(`${API_BASE_URL}/api/market/search?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Stock not found");
  return data;
};
