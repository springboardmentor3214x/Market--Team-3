"""
Database Models (PostgreSQL & SQLite Compatible)
- Module 1: Users, UserPreferences, Watchlist, ResearchHistory
- Module 2: Stock, HistoricalPrice, DataRetrievalLog
"""
from sqlalchemy import (
    Column,
    Integer,
    BigInteger,
    Float,
    String,
    Date,
    DateTime,
    ForeignKey,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# ==========================================
# MODULE 1: AUTHENTICATION & USER WORKSPACE
# ==========================================

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    watchlist = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    history = relationship("ResearchHistory", back_populates="user", cascade="all, delete-orphan")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True)
    preferred_market = Column(String, default="NSE")       # NSE, BSE, NYSE, NASDAQ
    analysis_period = Column(String, default="6mo")        # 1mo, 3mo, 6mo, 1y, 5y

    user = relationship("User", back_populates="preferences")


class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    ticker_symbol = Column(String, nullable=False, index=True) # e.g., INFY.NS, AAPL
    company_name = Column(String, nullable=False)              # e.g., Infosys Limited
    exchange = Column(String, default="NSE")
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="watchlist")


class ResearchHistory(Base):
    __tablename__ = "research_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    company_name = Column(String, nullable=False)
    ticker_symbol = Column(String, nullable=False, index=True)
    exchange = Column(String, nullable=False)
    data_source = Column(String, default="Yahoo Finance (yfinance)")
    retrieved_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="history")


# ==========================================
# MODULE 2: STOCK SEARCH & MARKET DATA
# ==========================================

class Stock(Base):
    """Stores company identification and profile details (Requirement 3 & 6)"""
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True, nullable=False) # e.g., INFY.NS, AAPL
    company_name = Column(String, index=True, nullable=False)
    exchange = Column(String, nullable=False)                        # NSE, BSE, NYSE, NASDAQ
    currency = Column(String, nullable=False, default="USD")         # INR, USD, etc.
    sector = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    market_cap = Column(Float, nullable=True)
    website = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    prices = relationship("HistoricalPrice", back_populates="stock", cascade="all, delete-orphan")
    retrieval_logs = relationship("DataRetrievalLog", back_populates="stock", cascade="all, delete-orphan")


class HistoricalPrice(Base):
    """Stores validated OHLCV records (Requirement 4 & 5)"""
    __tablename__ = "historical_prices"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False, index=True)
    trading_date = Column(String, nullable=False, index=True)        # Format: YYYY-MM-DD
    open_price = Column(Float, nullable=False)
    high_price = Column(Float, nullable=False)
    low_price = Column(Float, nullable=False)
    close_price = Column(Float, nullable=False)
    adjusted_close = Column(Float, nullable=True)
    volume = Column(BigInteger, nullable=False)

    __table_args__ = (
        UniqueConstraint("stock_id", "trading_date", name="uq_stock_trading_date"),
    )

    stock = relationship("Stock", back_populates="prices")


class DataRetrievalLog(Base):
    """Tracks every data collection event, source, timestamp, and audit (Requirement 9)"""
    __tablename__ = "data_retrieval_logs"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    provider = Column(String, nullable=False, default="Yahoo Finance (yfinance)")
    source_url = Column(String, nullable=True)
    records_retrieved = Column(Integer, default=0)
    validation_status = Column(String, default="VALIDATED")
    retrieved_at = Column(DateTime(timezone=True), server_default=func.now())

    stock = relationship("Stock", back_populates="retrieval_logs")
