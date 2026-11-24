"""
Pydantic Schemas for Module 3: Individual Financial Analysis AI Agents.
Provides strictly typed, structured inputs and outputs for each specialized agent:
1. Fundamental Analysis Agent
2. Technical Analysis Agent
3. News & Sentiment Analysis Agent
4. Risk Analysis Agent
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# =============================================================================
# 1. Fundamental Analysis Agent Schemas
# =============================================================================

class FinancialRatios(BaseModel):
    pe_ratio: Optional[float] = Field(None, description="Price-to-Earnings Ratio")
    forward_pe: Optional[float] = Field(None, description="Forward Price-to-Earnings Ratio")
    pb_ratio: Optional[float] = Field(None, description="Price-to-Book Ratio")
    roe: Optional[float] = Field(None, description="Return on Equity (percentage)")
    roa: Optional[float] = Field(None, description="Return on Assets (percentage)")
    debt_to_equity: Optional[float] = Field(None, description="Debt to Equity Ratio")
    current_ratio: Optional[float] = Field(None, description="Current Liquidity Ratio")
    quick_ratio: Optional[float] = Field(None, description="Quick Ratio")
    gross_margin: Optional[float] = Field(None, description="Gross Profit Margin (percentage)")
    operating_margin: Optional[float] = Field(None, description="Operating Margin (percentage)")
    net_margin: Optional[float] = Field(None, description="Net Profit Margin (percentage)")
    dividend_yield: Optional[float] = Field(None, description="Dividend Yield (percentage)")
    ev_to_ebitda: Optional[float] = Field(None, description="Enterprise Value to EBITDA")


class HistoricalPerformanceComparison(BaseModel):
    period_labels: List[str] = Field(default_factory=list)
    revenue_trend: List[Optional[float]] = Field(default_factory=list)
    net_income_trend: List[Optional[float]] = Field(default_factory=list)
    revenue_growth_yoy: Optional[float] = Field(None, description="Latest Year-over-Year Revenue Growth %")
    earnings_growth_yoy: Optional[float] = Field(None, description="Latest Year-over-Year Earnings Growth %")


class FundamentalAnalysisOutput(BaseModel):
    agent_id: str = "fundamental_agent"
    ticker: str
    company_name: str
    currency: str
    market_cap: Optional[float] = None
    ratios: FinancialRatios
    profitability_assessment: str
    debt_stability_assessment: str
    historical_comparison: HistoricalPerformanceComparison
    missing_data_fields: List[str] = Field(default_factory=list)
    summary_explanation: str
    overall_fundamental_score: float = Field(..., description="Score from 0 to 100")
    rating: str = Field(..., description="Strong, Healthy, Moderate, Caution, Weak")
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)


# =============================================================================
# 2. Technical Analysis Agent Schemas
# =============================================================================

class TechnicalIndicatorPoint(BaseModel):
    date: str
    close: float
    sma_5: Optional[float] = None
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    sma_200: Optional[float] = None
    ema_12: Optional[float] = None
    ema_26: Optional[float] = None
    rsi_14: Optional[float] = None
    macd_line: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_hist: Optional[float] = None
    volume: Optional[float] = None


class TechnicalIndicatorsSummary(BaseModel):
    current_price: float
    sma_5: Optional[float] = None
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    sma_200: Optional[float] = None
    ema_12: Optional[float] = None
    ema_26: Optional[float] = None
    rsi_14: Optional[float] = None
    rsi_condition: str = Field(..., description="Overbought, Oversold, or Neutral")
    macd_line: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_histogram: Optional[float] = None
    macd_condition: str = Field(..., description="Bullish Crossover, Bearish Crossover, or Neutral")
    historical_volatility_pct: float = Field(..., description="Annualized Historical Volatility %")
    primary_trend: str = Field(..., description="Bullish (Upward), Bearish (Downward), or Sideways (Consolidation)")


class TechnicalAnalysisOutput(BaseModel):
    agent_id: str = "technical_agent"
    ticker: str
    currency: str
    period: str
    indicators_summary: TechnicalIndicatorsSummary
    chart_series: List[TechnicalIndicatorPoint]
    predefined_conditions: List[str]
    signal_summary: str
    overall_technical_score: float = Field(..., description="Score from 0 to 100")
    disclaimer: str = "Important: Technical indicators help us understand historical market conditions. They do not guarantee future stock price movements or provide certain predictions."
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)


# =============================================================================
# 3. News and Sentiment Analysis Agent Schemas
# =============================================================================

class NewsArticleItem(BaseModel):
    id: str
    title: str
    publisher: str
    source_url: str
    published_date: str
    summary: str
    sentiment: str = Field(..., description="Positive, Negative, or Neutral")
    sentiment_score: float = Field(..., description="Score from -1.0 to +1.0")
    keywords: List[str] = Field(default_factory=list)
    event_category: Optional[str] = Field(None, description="Earnings, Acquisition, Regulatory, Product, General")


class NewsSentimentOutput(BaseModel):
    agent_id: str = "news_sentiment_agent"
    ticker: str
    company_name: str
    total_articles_analyzed: int
    sentiment_breakdown: Dict[str, int] = Field(..., description="Counts of positive, negative, neutral")
    average_sentiment_score: float = Field(..., description="Average polarity from -1.0 to +1.0")
    overall_sentiment_label: str = Field(..., description="Bullish, Bearish, or Neutral")
    key_corporate_events: List[str] = Field(default_factory=list)
    articles: List[NewsArticleItem] = Field(default_factory=list)
    conflicting_reports_flag: bool = False
    conflicting_notes: Optional[str] = None
    summary_explanation: str
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)


# =============================================================================
# 4. Risk Analysis Agent Schemas
# =============================================================================

class CrossAgentDivergence(BaseModel):
    has_conflict: bool
    conflict_type: Optional[str] = None
    description: Optional[str] = None
    severity: str = Field("None", description="High, Medium, Low, None")


class ScenarioAnalysis(BaseModel):
    bull_case: str
    base_case: str
    bear_case: str


class RiskAnalysisOutput(BaseModel):
    agent_id: str = "risk_agent"
    ticker: str
    company_name: str
    historical_volatility_pct: float
    maximum_drawdown_pct: float
    var_95_daily_pct: Optional[float] = None
    financial_risks: List[str] = Field(default_factory=list)
    sector_risks: List[str] = Field(default_factory=list)
    cross_agent_divergence: CrossAgentDivergence
    scenarios: ScenarioAnalysis
    data_limitations: List[str] = Field(default_factory=list)
    overall_risk_level: str = Field(..., description="Low, Moderate, Elevated, High")
    risk_score: float = Field(..., description="Score from 0 (Safe) to 100 (Extremely High Risk)")
    summary_explanation: str
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)


# =============================================================================
# Unified Multi-Agent Package Schema
# =============================================================================

class MultiAgentAnalysisResponse(BaseModel):
    ticker: str
    company_name: str
    currency: str
    exchange: str
    period: str
    fundamental: FundamentalAnalysisOutput
    technical: TechnicalAnalysisOutput
    news: NewsSentimentOutput
    risk: RiskAnalysisOutput
    generated_at: datetime = Field(default_factory=datetime.utcnow)
