"""
Pydantic Schemas (API Input/Output Structure)
Team Note: Frontend se kya data aayega aur Backend kya return karega, woh yahan define hai.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional

# --- Auth Schemas ---
class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

# --- Preferences Schema ---
class PreferenceUpdateSchema(BaseModel):
    preferred_market: str = "NSE"
    analysis_period: str = "6mo"

# --- Watchlist Schema ---
class WatchlistCreateSchema(BaseModel):
    ticker_symbol: str
    company_name: str
    exchange: Optional[str] = "NSE"