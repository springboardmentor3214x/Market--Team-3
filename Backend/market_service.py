"""
Market Data Collection & Validation Service (Module 2)
- Supports NSE, BSE, NYSE, NASDAQ.
- Collects Historical OHLCV Data, Company Profile, and Financial Statements.
- Performs Data Validation: Missing Values, Duplicate Dates, and Logical Consistency.
"""
from datetime import datetime, timezone
import yfinance as yf
import pandas as pd
from fastapi import HTTPException

# Common Company Names to Ticker Mapping (Team can add more companies here)
COMPANY_TO_TICKER = {
    "infosys": "INFY",
    "reliance": "RELIANCE",
    "reliance industries": "RELIANCE",
    "tata consultancy services": "TCS",
    "tcs": "TCS",
    "hdfc bank": "HDFCBANK",
    "tata motors": "TATAMOTORS",
    "apple": "AAPL",
    "microsoft": "MSFT",
    "google": "GOOGL",
    "alphabet": "GOOGL",
}

def resolve_ticker(query: str, market: str) -> str:
    """Company name ya symbol ko market ke hisaab se sahi ticker mein badalta hai."""
    clean_query = query.strip().lower()
    base_ticker = COMPANY_TO_TICKER.get(clean_query, query.strip().upper())

    if base_ticker.endswith(".NS") or base_ticker.endswith(".BO"):
        return base_ticker

    market_upper = market.upper()
    if market_upper == "NSE":
        return f"{base_ticker}.NS"
    elif market_upper == "BSE":
        return f"{base_ticker}.BO"
    return base_ticker  # NYSE aur NASDAQ ke liye direct symbol (e.g., AAPL, MSFT)

def validate_and_clean_ohlcv(df: pd.DataFrame) -> dict:
    """
    Module 2 Requirement 6: Data Validation
    A. Missing Values handle karna
    B. Duplicate Dates hatana
    C. Logical Consistency check karna (Low <= Open, Close <= High)
    """
    if df is None or df.empty:
        return {"records": [], "validation_report": {"status": "No data available"}}

    df = df.reset_index()
    date_col = "Date" if "Date" in df.columns else df.columns[0]
    df["trading_date"] = pd.to_datetime(df[date_col]).dt.strftime("%Y-%m-%d")

    initial_count = len(df)

    # B. Duplicate Dates Removal
    df = df.drop_duplicates(subset=["trading_date"], keep="last")
    duplicates_removed = initial_count - len(df)

    # A. Missing Values Handling
    ohlcv_cols = ["Open", "High", "Low", "Close", "Volume"]
    missing_values_count = int(df[ohlcv_cols].isna().sum().sum())
    df[ohlcv_cols] = df[ohlcv_cols].ffill().bfill()
    df = df.dropna(subset=ohlcv_cols)

    # C. Logical Consistency Validation (High >= Low, Open/Close within High-Low range)
    consistent_mask = (
        (df["High"] >= df["Low"]) &
        (df["Open"] >= df["Low"]) & (df["Open"] <= df["High"]) &
        (df["Close"] >= df["Low"]) & (df["Close"] <= df["High"]) &
        (df["Volume"] >= 0)
    )
    inconsistent_removed = int((~consistent_mask).sum())
    df = df[consistent_mask]

    clean_records = (
        df[["trading_date", "Open", "High", "Low", "Close", "Volume"]]
        .round(2)
        .to_dict(orient="records")
    )

    return {
        "records": clean_records,
        "validation_report": {
            "initial_records": initial_count,
            "valid_records_returned": len(clean_records),
            "duplicates_removed": duplicates_removed,
            "missing_values_filled": missing_values_count,
            "inconsistent_rows_dropped": inconsistent_removed,
        }
    }

def format_financial_table(df: pd.DataFrame) -> dict:
    """Income Statement, Balance Sheet aur Cash Flow ko JSON-friendly banata hai."""
    if df is None or df.empty:
        return {"available": False, "statement": {}}
    clean_df = df.fillna(0)
    clean_df.columns = [str(col)[:10] for col in clean_df.columns]
    return {"available": True, "statement": clean_df.to_dict()}

def fetch_complete_stock_data(query: str, market: str = "NSE", period: str = "6mo") -> dict:
    """Module 2 ka main function jo stock data fetch aur validate karta hai."""
    ticker_symbol = resolve_ticker(query, market)
    stock = yf.Ticker(ticker_symbol)

    hist_df = stock.history(period=period)
    if hist_df.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Stock data not found for '{query}' ({ticker_symbol}) in {market}. Please check company name or ticker."
        )

    validated_ohlcv = validate_and_clean_ohlcv(hist_df)
    info = stock.info or {}

    return {
        "source_metadata": {
            "company_name": info.get("longName") or info.get("shortName") or query.upper(),
            "ticker": ticker_symbol,
            "exchange": info.get("exchange", market.upper()),
            "currency": info.get("currency", "INR" if market.upper() in ["NSE", "BSE"] else "USD"),
            "data_source": "Yahoo Finance API (yfinance)",
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        },
        "company_profile": {
            "company_name": info.get("longName", query.upper()),
            "sector": info.get("sector", "Not Available"),
            "industry": info.get("industry", "Not Available"),
            "website": info.get("website", "Not Available"),
            "description": info.get("longBusinessSummary", "Company profile description not available.")
        },
        "ohlcv_data": validated_ohlcv["records"],
        "validation_summary": validated_ohlcv["validation_report"],
        "financial_statements": {
            "income_statement": format_financial_table(stock.financials),
            "balance_sheet": format_financial_table(stock.balance_sheet),
            "cash_flow": format_financial_table(stock.cashflow),
        }
    }