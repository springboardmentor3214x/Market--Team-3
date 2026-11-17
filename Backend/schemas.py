"""
Pydantic Schemas (API Input/Output Structure)
Covers Module 1 (Auth, Preferences, Watchlist) and Module 2 (Stock Search, Profile, OHLCV, Financials, Validation).
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any

# ==========================================
# MODULE 1 SCHEMAS
# ==========================================

class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class PreferenceUpdateSchema(BaseModel):
    preferred_market: str = "NSE"
    analysis_period: str = "6mo"

class WatchlistCreateSchema(BaseModel):
    ticker_symbol: str
    company_name: str
    exchange: Optional[str] = "NSE"


# ==========================================
# MODULE 2 SCHEMAS: STOCK SEARCH & MARKET DATA
# ==========================================

class StockSearchResult(BaseModel):
    ticker: str
    name: str
    exchange: str
    currency: str

class CompanyProfile(BaseModel):
    company_name: str
    ticker: str
    exchange: str
    currency: str
    sector: Optional[str] = "Not Available"
    industry: Optional[str] = "Not Available"
    market_cap: Optional[float] = None
    website: Optional[str] = "Not Available"
    description: Optional[str] = "Description not available."
    data_source: str = "Yahoo Finance API (yfinance)"
    retrieved_at: str

class OHLCVRecord(BaseModel):
    trading_date: str
    Open: float
    High: float
    Low: float
    Close: float
    Adj_Close: Optional[float] = None
    Volume: int

class ValidationSummary(BaseModel):
    initial_records: int
    valid_records_returned: int
    duplicates_removed: int
    invalid_dates_dropped: int
    missing_values_detected: int
    inconsistent_rows_dropped: int
    status: str

class FinancialStatementTable(BaseModel):
    available: bool
    dates: List[str] = []
    metrics: List[str] = []
    statement: Dict[str, Any] = {}

class FinancialStatementsResponse(BaseModel):
    frequency: str = "annual"
    income_statement: FinancialStatementTable
    balance_sheet: FinancialStatementTable
    cash_flow: FinancialStatementTable

class CompleteStockDataResponse(BaseModel):
    source_metadata: Dict[str, Any]
    company_profile: CompanyProfile
    ohlcv_data: List[Dict[str, Any]]
    validation_summary: ValidationSummary
    financial_statements: Dict[str, Any]
