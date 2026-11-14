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

# Create all PostgreSQL tables automatically on startup
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="AI-Powered Multi-Agent Stock Research Analyst API",
    description="Module 1 (Auth & Workspace) + Module 2 (Stock Search & Market Data Collection)"
)

# Enable CORS so React Frontend (localhost:3000 or 5173) can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
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

@app.get("/api/market/search", tags=["Module 2: Market Data"])
def search_and_collect_stock_data(
    query: str = Query(..., description="Company Name or Ticker (e.g., Infosys, INFY, Reliance, AAPL)"),
    market: str = Query("NSE", description="Market: NSE, BSE, NYSE, NASDAQ"),
    period: str = Query("6mo", description="Period: 1mo, 3mo, 6mo, 1y, 5y"),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Searches the stock, validates OHLCV & Financials (Module 2),
    and automatically logs the search in the user's Research History (Module 1).
    """
    stock_data = market_service.fetch_complete_stock_data(query=query, market=market, period=period)

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