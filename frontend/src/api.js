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

// --- MODULE 1: AUTH & WORKSPACE APIS ---

export const registerUser = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Registration failed");
  return data;
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Invalid credentials");
  return data;
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

// --- MODULE 2: STOCK SEARCH & MARKET DATA API ---

export const searchStockData = async (query, market, period) => {
  const params = new URLSearchParams({ query, market, period });
  const res = await fetch(`${API_BASE_URL}/api/market/search?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Stock not found");
  return data;
};