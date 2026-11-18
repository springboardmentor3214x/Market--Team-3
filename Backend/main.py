"""
Main FastAPI Application
Integrates:
- Module 1: User Registration, JWT Login, Preferences, Watchlist, Research History
- Module 2: Stock Search, OHLCV Data Collection, Financials & Validation
"""
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, database, schemas, auth, market_service
from agents import agent_orchestrator

# Create all PostgreSQL tables automatically on startup
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="AI-Powered Multi-Agent Stock Research Analyst API",
    description="Module 1 (Auth & Workspace) + Module 2 (Stock Search & Market Data Collection)"
)

# Enable CORS so React Frontend (localhost or 127.0.0.1 on any port) can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    new_user = models.User(
        email=user_data.email,
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
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not auth.verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    jwt_token = auth.create_access_token(data={"sub": user.email, "user_id": user.user_id})
    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user_id": user.user_id,
        "email": user.email
    }

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
    return {"message": f"{item.company_name} added to watchlist."}

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


@app.get("/api/agents/technical", tags=["Module 3: AI Agents"])
def get_technical_analysis(
    ticker: str = Query(..., description="Stock ticker symbol (e.g. INFY.NS, AAPL)"),
    market: str = Query("NSE", description="Market context: NSE, BSE, NYSE, NASDAQ"),
    period: str = Query("6mo", description="Historical period: 1mo, 3mo, 6mo, 1y, 5y"),
):
    """
    Module 3 - Agent 2: Technical Analysis Agent.
    Computes SMA (20, 50, 200), EMA (12, 26), RSI-14, MACD, and historical volatility.
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
