"""
Market Data Service (Module 2 Orchestration Layer)
Connects FastAPI routes with the Financial Data Provider Abstraction,
executes Pandas/NumPy validation, and handles database persistence.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from providers import active_provider, validate_and_clean_ohlcv
import models

def resolve_ticker(query: str, market: str = "NSE") -> str:
    """Uses the active financial provider to resolve queries to valid tickers."""
    return getattr(active_provider, "resolve_symbol", lambda q, m: q.upper())(query, market)

def search_stocks(query: str, market: str = "NSE") -> List[Dict[str, Any]]:
    """Returns autocomplete suggestions for stock searches."""
    return active_provider.search_symbols(query=query, market=market)

def get_company_profile(query: str, market: str = "NSE") -> Dict[str, Any]:
    """Retrieves verified company profile information."""
    ticker = resolve_ticker(query, market)
    profile = active_provider.get_profile(ticker)
    return profile

def get_historical_ohlcv_data(query: str, period: str = "6mo", market: str = "NSE") -> Dict[str, Any]:
    """Retrieves and validates OHLCV historical dataset."""
    ticker = resolve_ticker(query, market)
    raw_df = active_provider.get_historical_ohlcv(ticker, period)
    if raw_df is None or raw_df.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Historical stock data not found for '{query}' ({ticker}) in {market}."
        )

    validated_result = validate_and_clean_ohlcv(raw_df)
    return {
        "ticker": ticker,
        "period": period,
        "records": validated_result["records"],
        "validation_summary": validated_result["validation_summary"],
    }

def get_financial_statements(query: str, frequency: str = "annual", market: str = "NSE") -> Dict[str, Any]:
    """Retrieves Income Statement, Balance Sheet, and Cash Flow."""
    ticker = resolve_ticker(query, market)
    statements = active_provider.get_financial_statements(ticker, frequency)
    return statements

def fetch_and_persist_stock_data(
    query: str,
    market: str = "NSE",
    period: str = "6mo",
    user_id: Optional[int] = None,
    db: Optional[Session] = None,
) -> Dict[str, Any]:
    """
    Unified Module 2 Pipeline:
    1. Resolves Ticker across NSE, BSE, NYSE, NASDAQ.
    2. Collects Company Profile (Sector, Industry, Market Cap, Website, Description).
    3. Retrieves Historical OHLCV for selected period.
    4. Validates data with Pandas/NumPy (duplicates, missing, logical rules).
    5. Collects Financial Statements (Annual & Quarterly supported).
    6. Persists data to PostgreSQL/SQLite (Stock, HistoricalPrice, DataRetrievalLog).
    7. Tracks Source and UTC Timestamp.
    """
    ticker = resolve_ticker(query, market)
    raw_df = active_provider.get_historical_ohlcv(ticker, period)
    if raw_df is None or raw_df.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Stock data not found for '{query}' ({ticker}) in {market}. Please verify company name or ticker symbol."
        )

    profile = active_provider.get_profile(ticker)
    validated = validate_and_clean_ohlcv(raw_df)
    financials = active_provider.get_financial_statements(ticker, frequency="annual")
    quarterly_financials = active_provider.get_financial_statements(ticker, frequency="quarterly")

    # Construct complete payload
    complete_payload = {
        "source_metadata": {
            "company_name": profile["company_name"],
            "ticker": ticker,
            "exchange": profile["exchange"],
            "currency": profile["currency"],
            "data_source": active_provider.provider_name,
            "source_url": f"https://finance.yahoo.com/quote/{ticker}",
            "retrieved_at": profile["retrieved_at"],
        },
        "company_profile": profile,
        "ohlcv_data": validated["records"],
        "validation_summary": validated["validation_summary"],
        "financial_statements": {
            "annual": financials,
            "quarterly": quarterly_financials,
            # Backward-compatible direct statement object for existing workspace tabs
            "income_statement": financials["income_statement"],
            "balance_sheet": financials["balance_sheet"],
            "cash_flow": financials["cash_flow"],
        },
    }

    # Database Persistence if DB session is supplied
    if db is not None:
        try:
            # 1. Upsert Stock record
            stock_record = db.query(models.Stock).filter_by(ticker=ticker).first()
            if not stock_record:
                stock_record = models.Stock(
                    ticker=ticker,
                    company_name=profile["company_name"],
                    exchange=profile["exchange"],
                    currency=profile["currency"],
                    sector=profile.get("sector"),
                    industry=profile.get("industry"),
                    market_cap=profile.get("market_cap"),
                    website=profile.get("website"),
                    description=profile.get("description"),
                )
                db.add(stock_record)
                db.commit()
                db.refresh(stock_record)
            else:
                stock_record.company_name = profile["company_name"]
                stock_record.market_cap = profile.get("market_cap")
                stock_record.website = profile.get("website")
                stock_record.sector = profile.get("sector")
                stock_record.industry = profile.get("industry")
                db.commit()

            # 2. Persist recent OHLCV records (avoiding duplicates via date query)
            existing_dates = {
                d[0] for d in db.query(models.HistoricalPrice.trading_date)
                .filter_by(stock_id=stock_record.id)
                .all()
            }

            new_price_objects = []
            for rec in validated["records"]:
                if rec["trading_date"] not in existing_dates:
                    new_price_objects.append(
                        models.HistoricalPrice(
                            stock_id=stock_record.id,
                            trading_date=rec["trading_date"],
                            open_price=rec["Open"],
                            high_price=rec["High"],
                            low_price=rec["Low"],
                            close_price=rec["Close"],
                            adjusted_close=rec.get("Adj Close", rec["Close"]),
                            volume=rec["Volume"],
                        )
                    )
            if new_price_objects:
                db.bulk_save_objects(new_price_objects)
                db.commit()

            # 3. Log retrieval event in DataRetrievalLog
            retrieval_log = models.DataRetrievalLog(
                stock_id=stock_record.id,
                user_id=user_id,
                provider=active_provider.provider_name,
                source_url=complete_payload["source_metadata"]["source_url"],
                records_retrieved=len(validated["records"]),
                validation_status=validated["validation_summary"]["status"],
            )
            db.add(retrieval_log)
            db.commit()

        except Exception as e:
            db.rollback()
            # Non-blocking log if DB write fails, API still returns data
            print(f"[Module 2 DB Warning] Could not persist stock data: {e}")

    return complete_payload

# Alias for backward compatibility
fetch_complete_stock_data = fetch_and_persist_stock_data
