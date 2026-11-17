"""
Module 2 Providers Package
Exports BaseFinancialDataProvider, YahooFinanceProvider, and validate_and_clean_ohlcv.
"""
from .base_provider import BaseFinancialDataProvider
from .yfinance_provider import YahooFinanceProvider
from .validator import validate_and_clean_ohlcv

# Default active provider instance
active_provider: BaseFinancialDataProvider = YahooFinanceProvider()

__all__ = [
    "BaseFinancialDataProvider",
    "YahooFinanceProvider",
    "validate_and_clean_ohlcv",
    "active_provider",
]
