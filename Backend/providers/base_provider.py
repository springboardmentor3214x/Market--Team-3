"""
Base Financial Data Provider Interface (Module 2 Provider Abstraction)
Enables swapping Yahoo Finance with AlphaVantage, Polygon.io, or other data vendors seamlessly.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import pandas as pd

class BaseFinancialDataProvider(ABC):
    """Abstract Base Class for all market financial data providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the data provider (e.g. 'Yahoo Finance (yfinance)')."""
        pass

    @abstractmethod
    def search_symbols(self, query: str, market: str = "NSE") -> List[Dict[str, Any]]:
        """
        Search companies and tickers with autocomplete across NSE, BSE, NYSE, NASDAQ.
        Returns list of {ticker, name, exchange, currency}.
        """
        pass

    @abstractmethod
    def get_profile(self, ticker: str) -> Dict[str, Any]:
        """
        Fetch company identification, sector, industry, market cap, website, and description.
        """
        pass

    @abstractmethod
    def get_historical_ohlcv(self, ticker: str, period: str = "6mo") -> pd.DataFrame:
        """
        Fetch raw historical stock price records (Open, High, Low, Close, Adj Close, Volume).
        """
        pass

    @abstractmethod
    def get_financial_statements(self, ticker: str, frequency: str = "annual") -> Dict[str, Any]:
        """
        Fetch Income Statement, Balance Sheet, and Cash Flow statement.
        Frequency can be 'annual' or 'quarterly'.
        Missing fields must be explicitly marked as 'Not Available'.
        """
        pass
