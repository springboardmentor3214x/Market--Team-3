"""
Database Models (PostgreSQL Tables)
- Module 1: Users, UserPreferences, Watchlist, ResearchHistory
- Team members aage chal kar isme apne naye columns add kar sakte hain.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database import Base

# 1. Users Table (Mentor ke mail ke exact columns ke hisaab se)
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 2. User Preferences Table (NSE/BSE/NYSE/Nasdaq & Analysis Period)
class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True)
    preferred_market = Column(String, default="NSE")       # NSE, BSE, NYSE, NASDAQ
    analysis_period = Column(String, default="6mo")        # 1mo, 3mo, 6mo, 1y, 5y

# 3. Saved Stocks / Watchlist Table
class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    ticker_symbol = Column(String, nullable=False)         # e.g., INFY.NS, AAPL
    company_name = Column(String, nullable=False)          # e.g., Infosys Limited
    exchange = Column(String, default="NSE")
    added_at = Column(DateTime(timezone=True), server_default=func.now())

# 4. User-Specific Research History Table (Module 1 & Module 2 link)
class ResearchHistory(Base):
    __tablename__ = "research_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    company_name = Column(String, nullable=False)
    ticker_symbol = Column(String, nullable=False)
    exchange = Column(String, nullable=False)
    data_source = Column(String, default="Yahoo Finance (yfinance)")
    retrieved_at = Column(DateTime(timezone=True), server_default=func.now())