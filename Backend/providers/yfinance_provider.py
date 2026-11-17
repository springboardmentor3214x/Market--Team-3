"""
Yahoo Finance Data Provider Implementation (Module 2 Financial Data Provider)
Uses yfinance library with comprehensive error handling, caching, and structure formatting.
"""
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import yfinance as yf
import pandas as pd
from .base_provider import BaseFinancialDataProvider

# Comprehensive stock universe lookup for fast, reliable autocomplete & resolution
COMMON_STOCKS: List[Dict[str, str]] = [
    # NSE / BSE (India)
    {"name": "Infosys Limited", "ticker": "INFY.NS", "exchange": "NSE", "currency": "INR", "keywords": "infosys infy"},
    {"name": "Reliance Industries Ltd", "ticker": "RELIANCE.NS", "exchange": "NSE", "currency": "INR", "keywords": "reliance rspl ril"},
    {"name": "Tata Consultancy Services", "ticker": "TCS.NS", "exchange": "NSE", "currency": "INR", "keywords": "tcs tata consultancy"},
    {"name": "HDFC Bank Limited", "ticker": "HDFCBANK.NS", "exchange": "NSE", "currency": "INR", "keywords": "hdfc hdfcbank"},
    {"name": "ICICI Bank Limited", "ticker": "ICICIBANK.NS", "exchange": "NSE", "currency": "INR", "keywords": "icici icicibank"},
    {"name": "Tata Motors Limited", "ticker": "TATAMOTORS.NS", "exchange": "NSE", "currency": "INR", "keywords": "tata motors tatamotors"},
    {"name": "State Bank of India", "ticker": "SBIN.NS", "exchange": "NSE", "currency": "INR", "keywords": "sbi sbin state bank"},
    {"name": "Bharti Airtel Limited", "ticker": "BHARTIARTL.NS", "exchange": "NSE", "currency": "INR", "keywords": "airtel bharti"},
    {"name": "ITC Limited", "ticker": "ITC.NS", "exchange": "NSE", "currency": "INR", "keywords": "itc"},
    {"name": "Wipro Limited", "ticker": "WIPRO.NS", "exchange": "NSE", "currency": "INR", "keywords": "wipro"},
    {"name": "Larsen & Toubro Ltd", "ticker": "LT.NS", "exchange": "NSE", "currency": "INR", "keywords": "l&t lt larsen"},
    {"name": "Infosys (BSE)", "ticker": "INFY.BO", "exchange": "BSE", "currency": "INR", "keywords": "infosys infy bse"},
    {"name": "Reliance (BSE)", "ticker": "RELIANCE.BO", "exchange": "BSE", "currency": "INR", "keywords": "reliance rspl bse"},
    {"name": "TCS (BSE)", "ticker": "TCS.BO", "exchange": "BSE", "currency": "INR", "keywords": "tcs bse"},

    # US (NASDAQ / NYSE)
    {"name": "Apple Inc.", "ticker": "AAPL", "exchange": "NASDAQ", "currency": "USD", "keywords": "apple aapl"},
    {"name": "Microsoft Corporation", "ticker": "MSFT", "exchange": "NASDAQ", "currency": "USD", "keywords": "microsoft msft"},
    {"name": "NVIDIA Corporation", "ticker": "NVDA", "exchange": "NASDAQ", "currency": "USD", "keywords": "nvidia nvda"},
    {"name": "Alphabet Inc. (Google)", "ticker": "GOOGL", "exchange": "NASDAQ", "currency": "USD", "keywords": "google alphabet googl"},
    {"name": "Amazon.com, Inc.", "ticker": "AMZN", "exchange": "NASDAQ", "currency": "USD", "keywords": "amazon amzn"},
    {"name": "Tesla, Inc.", "ticker": "TSLA", "exchange": "NASDAQ", "currency": "USD", "keywords": "tesla tsla"},
    {"name": "Meta Platforms, Inc.", "ticker": "META", "exchange": "NASDAQ", "currency": "USD", "keywords": "meta facebook"},
    {"name": "JPMorgan Chase & Co.", "ticker": "JPM", "exchange": "NYSE", "currency": "USD", "keywords": "jpmorgan chase jpm"},
    {"name": "Berkshire Hathaway Inc.", "ticker": "BRK-B", "exchange": "NYSE", "currency": "USD", "keywords": "berkshire brk"},
]

class YahooFinanceProvider(BaseFinancialDataProvider):
    """Concrete provider communicating with Yahoo Finance via yfinance."""

    @property
    def provider_name(self) -> str:
        return "Yahoo Finance API (yfinance)"

    def resolve_symbol(self, query: str, market: str = "NSE") -> str:
        """Resolves free-form company name or ticker into provider-compatible ticker."""
        clean = query.strip().upper()

        # If already formatted with an exchange suffix
        if clean.endswith(".NS") or clean.endswith(".BO"):
            return clean

        # Check in common registry
        q_lower = query.strip().lower()
        for item in COMMON_STOCKS:
            if q_lower in item["keywords"] or q_lower == item["name"].lower() or clean == item["ticker"].split(".")[0]:
                if market.upper() == "BSE" and item["exchange"] == "BSE":
                    return item["ticker"]
                if market.upper() == "NSE" and item["exchange"] == "NSE":
                    return item["ticker"]
                if market.upper() in ["NYSE", "NASDAQ"] and item["exchange"] in ["NYSE", "NASDAQ"]:
                    return item["ticker"]
                return item["ticker"]

        # Market-specific defaulting
        if market.upper() == "NSE":
            return f"{clean}.NS"
        elif market.upper() == "BSE":
            return f"{clean}.BO"
        return clean

    def search_symbols(self, query: str, market: str = "NSE") -> List[Dict[str, Any]]:
        """Provides instant autocomplete suggestions for company names or tickers."""
        q_clean = query.strip().lower()
        if not q_clean:
            # Return popular defaults for the chosen market
            m_upper = market.upper()
            return [s for s in COMMON_STOCKS if s["exchange"] == m_upper][:6]

        matches = []
        for stock in COMMON_STOCKS:
            if (
                q_clean in stock["name"].lower()
                or q_clean in stock["ticker"].lower()
                or q_clean in stock["keywords"]
            ):
                matches.append({
                    "ticker": stock["ticker"],
                    "name": stock["name"],
                    "exchange": stock["exchange"],
                    "currency": stock["currency"],
                })

        # If no local registry matches, create a structured candidate
        if not matches:
            resolved = self.resolve_symbol(query, market)
            matches.append({
                "ticker": resolved,
                "name": query.strip().upper(),
                "exchange": market.upper(),
                "currency": "INR" if market.upper() in ["NSE", "BSE"] else "USD",
            })

        return matches[:8]

    def get_profile(self, ticker: str) -> Dict[str, Any]:
        """Retrieves verified company profile, capitalization, sector, and industry."""
        stock = yf.Ticker(ticker)
        try:
            info = stock.info or {}
        except Exception:
            info = {}

        company_name = info.get("longName") or info.get("shortName") or ticker.split(".")[0]
        exchange = info.get("exchange") or ("NSE" if ticker.endswith(".NS") else "BSE" if ticker.endswith(".BO") else "NASDAQ")
        currency = info.get("currency") or ("INR" if ticker.endswith((".NS", ".BO")) else "USD")

        return {
            "company_name": company_name,
            "ticker": ticker,
            "exchange": exchange,
            "currency": currency,
            "sector": info.get("sector", "Not Available"),
            "industry": info.get("industry", "Not Available"),
            "market_cap": info.get("marketCap", None),
            "website": info.get("website", "Not Available"),
            "description": info.get("longBusinessSummary") or info.get("description") or "Company business profile description not available.",
            "data_source": self.provider_name,
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
        }

    def get_historical_ohlcv(self, ticker: str, period: str = "6mo") -> pd.DataFrame:
        """Retrieves raw OHLCV historical dataframe for the specified period."""
        valid_periods = ["1mo", "3mo", "6mo", "1y", "5y", "max"]
        p = period if period in valid_periods else "6mo"

        stock = yf.Ticker(ticker)
        df = stock.history(period=p)
        return df

    def get_financial_statements(self, ticker: str, frequency: str = "annual") -> Dict[str, Any]:
        """
        Retrieves Income Statement, Balance Sheet, and Cash Flow statement.
        Supports both annual and quarterly frequencies.
        Missing data displays 'Not Available'.
        """
        stock = yf.Ticker(ticker)
        is_quarterly = frequency.lower() == "quarterly"

        try:
            if is_quarterly:
                inc_df = stock.quarterly_financials
                bal_df = stock.quarterly_balance_sheet
                cf_df = stock.quarterly_cashflow
            else:
                inc_df = stock.financials
                bal_df = stock.balance_sheet
                cf_df = stock.cashflow
        except Exception:
            inc_df, bal_df, cf_df = None, None, None

        return {
            "frequency": "quarterly" if is_quarterly else "annual",
            "income_statement": self._format_statement(inc_df),
            "balance_sheet": self._format_statement(bal_df),
            "cash_flow": self._format_statement(cf_df),
        }

    def _format_statement(self, df: Optional[pd.DataFrame]) -> Dict[str, Any]:
        """Formats DataFrame metrics into structured, JSON-serializable dictionaries."""
        if df is None or df.empty:
            return {"available": False, "statement": {}, "dates": [], "metrics": []}

        clean_df = df.fillna("Not Available")
        # Format date columns to standard YYYY-MM-DD
        date_cols = [str(col)[:10] for col in clean_df.columns]
        clean_df.columns = date_cols

        statement_dict = clean_df.to_dict()
        metrics = list(clean_df.index)

        return {
            "available": True,
            "dates": date_cols,
            "metrics": metrics,
            "statement": statement_dict,
        }
