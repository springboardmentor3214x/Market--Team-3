"""
Main FastAPI Application
Integrates:
- Module 1: User Registration, JWT Login, Preferences, Watchlist, Research History
- Module 2: Stock Search, OHLCV Data Collection, Financials & Validation
"""
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import re
import models, database, schemas, auth, market_service
from agents import agent_orchestrator

# Create all PostgreSQL tables automatically on startup
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="AI-Powered Multi-Agent Stock Research Analyst API",
    description="Module 1 (Auth & Workspace) + Module 2 (Stock Search & Market Data Collection)"
)

@app.on_event("startup")
def seed_default_users():
    """Ensures primary user and demo accounts are pre-seeded on startup/redeploy."""
    db = database.SessionLocal()
    try:
        # Pre-seed user account
        user_email = "ennichirag065@gmail.com"
        u = db.query(models.User).filter(func.lower(models.User.email) == user_email).first()
        if not u:
            u = models.User(
                email=user_email,
                password_hash=auth.hash_password("password123")
            )
            db.add(u)
            db.commit()
            db.refresh(u)
            db.add(models.UserPreference(user_id=u.user_id, preferred_market="NSE", analysis_period="6mo"))
            db.add(models.Watchlist(user_id=u.user_id, ticker_symbol="INFY.NS", company_name="Infosys Limited", exchange="NSE"))
            db.add(models.Watchlist(user_id=u.user_id, ticker_symbol="RELIANCE.NS", company_name="Reliance Industries", exchange="NSE"))
            db.commit()

        # Pre-seed demo account
        demo_email = "demo@marketai.com"
        d = db.query(models.User).filter(func.lower(models.User.email) == demo_email).first()
        if not d:
            d = models.User(
                email=demo_email,
                password_hash=auth.hash_password("password123")
            )
            db.add(d)
            db.commit()
            db.refresh(d)
            db.add(models.UserPreference(user_id=d.user_id, preferred_market="NSE", analysis_period="6mo"))
            db.commit()
    except Exception as e:
        print("[Startup Seed] Warning:", e)
    finally:
        db.close()

# Enable CORS so React Frontend (localhost, Vercel, or custom domain) can talk to FastAPI
cors_origins_env = database.os.getenv("CORS_ORIGINS", "")
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
if cors_origins_env:
    allowed_origins.extend([origin.strip() for origin in cors_origins_env.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?://.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CleanPathMiddleware:
    """Normalize double slashes (e.g. //api/...) from frontend URLs to /api/..."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] in ("http", "websocket"):
            scope["path"] = re.sub(r"/+", "/", scope["path"])
            if "raw_path" in scope:
                scope["raw_path"] = re.sub(rb"/+", b"/", scope["raw_path"])
        await self.app(scope, receive, send)

app.add_middleware(CleanPathMiddleware)

# ROOT WELCOME ROUTE (app banne ke baad yahan aayega)
@app.get("/")
def home():
    return {
        "status": "online",
        "message": "Multi-Agent Stock Research API is running! Visit /docs for API UI."
    }

# ==========================================
# MODULE 1: AUTHENTICATION & WORKSPACE APIS
# ==========================================

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED, tags=["Module 1: Auth"])
def register_user(user_data: schemas.UserRegisterSchema, db: Session = Depends(database.get_db)):
    clean_email = user_data.email.strip().lower()
    existing = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    new_user = models.User(
        email=clean_email,
        password_hash=auth.hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create default preferences for the new user
    default_pref = models.UserPreference(user_id=new_user.user_id)
    db.add(default_pref)
    db.commit()

    return {"message": "Registration successful", "user_id": new_user.user_id, "email": new_user.email}

@app.post("/api/auth/login", tags=["Module 1: Auth"])
def login_user(user_data: schemas.UserLoginSchema, db: Session = Depends(database.get_db)):
    clean_email = user_data.email.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if not user or not auth.verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    jwt_token = auth.create_access_token(data={"sub": user.email, "user_id": user.user_id})
    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user_id": user.user_id,
        "email": user.email
    }

@app.post("/api/auth/reset-password", tags=["Module 1: Auth"])
def reset_password(data: schemas.PasswordResetSchema, db: Session = Depends(database.get_db)):
    clean_email = data.email.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No registered account found with this email.")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    user.password_hash = auth.hash_password(data.new_password)
    db.commit()
    return {"message": "Password reset successfully. You can now log in with your new password."}

@app.get("/api/user/workspace", tags=["Module 1: Workspace"])
def get_user_workspace(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Returns logged-in user's preferences, saved watchlist, and past research history."""
    prefs = db.query(models.UserPreference).filter_by(user_id=current_user.user_id).first()
    watchlist = db.query(models.Watchlist).filter_by(user_id=current_user.user_id).all()
    history = (
        db.query(models.ResearchHistory)
        .filter_by(user_id=current_user.user_id)
        .order_by(models.ResearchHistory.retrieved_at.desc())
        .all()
    )
    return {
        "user": {"user_id": current_user.user_id, "email": current_user.email},
        "preferences": prefs,
        "watchlist": watchlist,
        "research_history": history
    }

@app.put("/api/user/preferences", tags=["Module 1: Workspace"])
def update_preferences(
    pref_data: schemas.PreferenceUpdateSchema,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    pref = db.query(models.UserPreference).filter_by(user_id=current_user.user_id).first()
    if not pref:
        pref = models.UserPreference(user_id=current_user.user_id)
        db.add(pref)
    pref.preferred_market = pref_data.preferred_market.upper()
    pref.analysis_period = pref_data.analysis_period
    db.commit()
    return {"message": "Preferences updated", "preferred_market": pref.preferred_market, "analysis_period": pref.analysis_period}

@app.post("/api/user/watchlist", tags=["Module 1: Workspace"])
def add_to_watchlist(
    item: schemas.WatchlistCreateSchema,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    new_stock = models.Watchlist(
        user_id=current_user.user_id,
        ticker_symbol=item.ticker_symbol.upper(),
        company_name=item.company_name,
        exchange=item.exchange.upper()
    )
    db.add(new_stock)
    db.commit()
    return {"message": f"{item.company_name} added to watchlist.", "id": new_stock.id}

@app.delete("/api/user/watchlist", tags=["Module 1: Workspace"])
def remove_from_watchlist_query(
    ticker: Optional[str] = Query(None),
    id: Optional[int] = Query(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    entry = None
    if id is not None:
        entry = db.query(models.Watchlist).filter(
            models.Watchlist.id == id,
            models.Watchlist.user_id == current_user.user_id
        ).first()
    if not entry and ticker:
        ticker_upper = ticker.strip().upper()
        base_ticker = ticker_upper.split(".")[0]
        entry = db.query(models.Watchlist).filter(
            models.Watchlist.user_id == current_user.user_id,
            (models.Watchlist.ticker_symbol == ticker_upper) | (models.Watchlist.ticker_symbol.like(f"{base_ticker}%"))
        ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Watchlist item not found.")
    company = entry.company_name
    db.delete(entry)
    db.commit()
    return {"message": f"{company} removed from watchlist."}

@app.delete("/api/user/watchlist/{identifier:path}", tags=["Module 1: Workspace"])
def remove_from_watchlist_any(
    identifier: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Strip any leading route path prefixes (e.g. 'ticker/', 'by-ticker/')
    target = identifier.strip()
    if target.startswith("ticker/"):
        target = target[len("ticker/"):]
    elif target.startswith("by-ticker/"):
        target = target[len("by-ticker/"):]

    entry = None
    # Check if target is an integer ID
    if target.isdigit():
        entry = db.query(models.Watchlist).filter(
            models.Watchlist.id == int(target),
            models.Watchlist.user_id == current_user.user_id
        ).first()

    # If not found by ID, look up by ticker symbol
    if not entry:
        ticker_upper = target.upper()
        base_ticker = ticker_upper.split(".")[0]
        entry = db.query(models.Watchlist).filter(
            models.Watchlist.user_id == current_user.user_id,
            (models.Watchlist.ticker_symbol == ticker_upper) | (models.Watchlist.ticker_symbol.like(f"{base_ticker}%"))
        ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Watchlist item not found.")
    company = entry.company_name
    db.delete(entry)
    db.commit()
    return {"message": f"{company} removed from watchlist."}

# ==========================================
# MODULE 2: STOCK SEARCH & MARKET DATA APIS
# ==========================================

@app.get("/api/stocks/search", tags=["Module 2: Market Data"])
def autocomplete_stock_search(
    q: str = Query("", description="Search term for company name or ticker"),
    market: str = Query("NSE", description="Target market: NSE, BSE, NYSE, NASDAQ"),
):
    """
    Requirement 3: Search input with autocomplete suggestions.
    Supports NSE, BSE, NYSE, and NASDAQ stocks.
    """
    return market_service.search_stocks(query=q, market=market)


@app.get("/api/stocks/{ticker}/profile", tags=["Module 2: Market Data"])
def get_stock_profile(
    ticker: str,
    market: str = Query("NSE", description="Market context: NSE, BSE, NYSE, NASDAQ"),
):
    """
    Requirement 6: Company Profile.
    Returns sector, industry, market cap, website, exchange, currency, and business description.
    """
    return market_service.get_company_profile(query=ticker, market=market)


@app.get("/api/stocks/{ticker}/history", tags=["Module 2: Market Data"])
def get_stock_history(
    ticker: str,
    period: str = Query("6mo", description="Historical period: 1mo, 3mo, 6mo, 1y, 5y"),
    market: str = Query("NSE", description="Market context: NSE, BSE, NYSE, NASDAQ"),
):
    """
    Requirement 4 & 5: Historical stock price retrieval and OHLCV data.
    Returns validated Open, High, Low, Close, Adj Close, and Volume.
    """
    return market_service.get_historical_ohlcv_data(query=ticker, period=period, market=market)


@app.get("/api/stocks/{ticker}/financials", tags=["Module 2: Market Data"])
def get_stock_financials(
    ticker: str,
    frequency: str = Query("annual", description="Statement frequency: annual or quarterly"),
    market: str = Query("NSE", description="Market context: NSE, BSE, NYSE, NASDAQ"),
):
    """
    Requirement 7: Financial Statements.
    Returns Income Statement, Balance Sheet, and Cash Flow (annual & quarterly).
    """
    return market_service.get_financial_statements(query=ticker, frequency=frequency, market=market)


@app.get("/api/stocks/{ticker}/validate", tags=["Module 2: Market Data"])
def validate_stock_dataset(
    ticker: str,
    period: str = Query("6mo", description="Period to audit: 1mo, 3mo, 6mo, 1y, 5y"),
    market: str = Query("NSE", description="Market context: NSE, BSE, NYSE, NASDAQ"),
):
    """
    Requirement 8: Data Validation.
    Executes Pandas & NumPy checks (duplicates, nulls, price boundary logic, volume bounds).
    """
    history_data = market_service.get_historical_ohlcv_data(query=ticker, period=period, market=market)
    return {
        "ticker": ticker,
        "period": period,
        "validation_report": history_data["validation_summary"],
        "records_audited": len(history_data["records"]),
    }


@app.get("/api/market/search", tags=["Module 2: Market Data"])
def search_and_collect_stock_data(
    query: str = Query(..., description="Company Name or Ticker (e.g., Infosys, INFY, Reliance, AAPL)"),
    market: str = Query("NSE", description="Market: NSE, BSE, NYSE, NASDAQ"),
    period: str = Query("6mo", description="Period: 1mo, 3mo, 6mo, 1y, 5y"),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Unified Pipeline:
    Searches the stock, validates OHLCV & Financials (Module 2),
    persists records, and automatically logs the search in the user's Research History (Module 1).
    """
    stock_data = market_service.fetch_and_persist_stock_data(
        query=query,
        market=market,
        period=period,
        user_id=current_user.user_id,
        db=db,
    )

    # Save search automatically to User's Research History
    meta = stock_data["source_metadata"]
    history_entry = models.ResearchHistory(
        user_id=current_user.user_id,
        company_name=meta["company_name"],
        ticker_symbol=meta["ticker"],
        exchange=meta["exchange"],
        data_source=meta["data_source"]
    )
    db.add(history_entry)
    db.commit()

    return stock_data


# =============================================================================
# MODULE 3: SPECIALIZED FINANCIAL ANALYSIS AI AGENTS APIS
# =============================================================================

@app.get("/api/agents/fundamental", tags=["Module 3: AI Agents"])
def get_fundamental_analysis(
    ticker: str = Query(..., description="Stock ticker symbol (e.g. INFY.NS, AAPL)"),
    market: str = Query("NSE", description="Market context: NSE, BSE, NYSE, NASDAQ"),
):
    """
    Module 3 - Agent 1: Fundamental Analysis Agent.
    Evaluates revenue, earnings, profitability, debt/solvency ratios, and historical growth.
    """
    try:
        return agent_orchestrator.run_fundamental(ticker=ticker, exchange=market)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fundamental analysis failed: {str(e)}")


@app.get("/api/agents/technical", tags=["Module 4: Technical Analysis Agent"])
def get_technical_analysis(
    ticker: str = Query(..., description="Stock ticker symbol (e.g. INFY.NS, AAPL)"),
    market: str = Query("NSE", description="Market context: NSE, BSE, NYSE, NASDAQ"),
    period: str = Query("6mo", description="Historical period: 1mo, 3mo, 6mo, 1y, 5y"),
):
    """
    Module 4 - Technical Analysis Agent:
    Computes SMA (5, 20, 50, 200), EMA (12, 26), RSI-14, MACD (12, 26, 9), and historical volatility.
    Identifies predefined technical conditions and generates explanatory narratives.
    """
    try:
        return agent_orchestrator.run_technical(ticker=ticker, exchange=market, period=period)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Technical analysis failed: {str(e)}")


@app.get("/api/agents/technical/{ticker}", tags=["Module 4: Technical Analysis Agent"])
def get_technical_analysis_by_path(
    ticker: str,
    market: str = Query("NSE", description="Market context: NSE, BSE, NYSE, NASDAQ"),
    period: str = Query("6mo", description="Historical period: 1mo, 3mo, 6mo, 1y, 5y"),
):
    """
    Module 4 - Technical Analysis Agent (Path URL alias).
    """
    try:
        return agent_orchestrator.run_technical(ticker=ticker, exchange=market, period=period)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Technical analysis failed: {str(e)}")


@app.get("/api/agents/news", tags=["Module 3: AI Agents"])
def get_news_and_sentiment_analysis(
    ticker: str = Query(..., description="Stock ticker symbol (e.g. INFY.NS, AAPL)"),
    market: str = Query("NSE", description="Market context: NSE, BSE, NYSE, NASDAQ"),
):
    """
    Module 3 - Agent 3: News and Sentiment Analysis Agent.
    Extracts real corporate headlines, detects event types, classifies sentiment, and checks conflicts.
    """
    try:
        return agent_orchestrator.run_news(ticker=ticker, exchange=market)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"News analysis failed: {str(e)}")


@app.get("/api/agents/risk", tags=["Module 3: AI Agents"])
def get_risk_analysis(
    ticker: str = Query(..., description="Stock ticker symbol (e.g. INFY.NS, AAPL)"),
    market: str = Query("NSE", description="Market context: NSE, BSE, NYSE, NASDAQ"),
    period: str = Query("6mo", description="Historical period: 1mo, 3mo, 6mo, 1y, 5y"),
):
    """
    Module 3 - Agent 4: Risk Analysis Agent.
    Calculates historical volatility, maximum drawdown, financial balance sheet risks, and scenario projections.
    """
    try:
        return agent_orchestrator.run_risk(ticker=ticker, exchange=market, period=period)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk analysis failed: {str(e)}")


@app.get("/api/agents/all", tags=["Module 3: AI Agents"])
def get_full_multi_agent_analysis(
    ticker: str = Query(..., description="Stock ticker symbol (e.g. INFY.NS, AAPL)"),
    market: str = Query("NSE", description="Market context: NSE, BSE, NYSE, NASDAQ"),
    period: str = Query("6mo", description="Historical period: 1mo, 3mo, 6mo, 1y, 5y"),
):
    """
    Module 3 - Full Multi-Agent Suite:
    Executes Fundamental, Technical, News, and Risk agents concurrently and synthesizes cross-agent divergences.
    """
    try:
        return agent_orchestrator.run_all(ticker=ticker, exchange=market, period=period)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multi-agent analysis failed: {str(e)}")
