"""
Risk Analysis Agent
Examines potential risks and evaluates cross-agent research reliability:
- Historical Volatility and Maximum Drawdown (MDD)
- Financial balance-sheet risks
- Cross-agent conflicting findings (e.g. Bullish Technical vs Deteriorating Fundamentals)
- Multi-scenario modeling (Bull Case, Base Case, Bear Case)
- Missing data audits and limitation disclaimers
"""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
import yfinance as yf
from agents.schemas import (
    RiskAnalysisOutput,
    CrossAgentDivergence,
    ScenarioAnalysis,
    FundamentalAnalysisOutput,
    TechnicalAnalysisOutput,
    NewsSentimentOutput,
)


class RiskAnalysisAgent:
    def __init__(self, agent_name: str = "Risk Analysis Agent"):
        self.agent_name = agent_name

    def analyze(
        self,
        ticker: str,
        exchange: str = "NSE",
        period: str = "6mo",
        fundamental_output: Optional[FundamentalAnalysisOutput] = None,
        technical_output: Optional[TechnicalAnalysisOutput] = None,
        news_output: Optional[NewsSentimentOutput] = None,
    ) -> RiskAnalysisOutput:
        clean_ticker = ticker.strip().upper()
        if exchange in ["NSE", "BSE"] and not (clean_ticker.endswith(".NS") or clean_ticker.endswith(".BO")):
            full_ticker = f"{clean_ticker}.NS" if exchange == "NSE" else f"{clean_ticker}.BO"
        else:
            full_ticker = clean_ticker

        # 1. Historical Volatility & Maximum Drawdown Computation
        df = yf.download(full_ticker, period=period, interval="1d", progress=False)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        if not df.empty and "Close" in df.columns:
            close = pd.to_numeric(df["Close"], errors="coerce").dropna()
            # Historical Annualized Volatility
            log_ret = np.log(close / close.shift(1)).dropna()
            volatility = round(float(log_ret.std() * np.sqrt(252) * 100.0), 2) if len(log_ret) > 1 else 0.0

            # Maximum Drawdown
            cum_max = close.cummax()
            drawdowns = (close - cum_max) / cum_max
            max_dd = round(float(drawdowns.min() * 100.0), 2)  # Negative percentage

            # Value at Risk (95% Daily parametric)
            var_95 = round(float(1.645 * log_ret.std() * 100.0), 2) if len(log_ret) > 1 else None
        else:
            volatility = technical_output.indicators_summary.historical_volatility_pct if technical_output else 25.0
            max_dd = -15.0
            var_95 = 2.5

        company_name = fundamental_output.company_name if fundamental_output else clean_ticker

        # 2. Financial Risks Identification
        fin_risks: List[str] = []
        if fundamental_output:
            r = fundamental_output.ratios
            if r.debt_to_equity and r.debt_to_equity > 80.0:
                fin_risks.append(f"Elevated debt-to-equity ratio ({r.debt_to_equity}%), increasing interest rate sensitivity.")
            if r.current_ratio and r.current_ratio < 1.1:
                fin_risks.append(f"Tight liquidity with current ratio at {r.current_ratio}x (recommended > 1.2x).")
            if r.operating_margin and r.operating_margin < 8.0:
                fin_risks.append(f"Compressed operating margins ({r.operating_margin}%), limiting earnings cushion.")
            if r.pe_ratio and r.pe_ratio > 50.0:
                fin_risks.append(f"Premium valuation multiple (P/E: {r.pe_ratio}x), sensitive to earnings misses.")
            if fundamental_output.historical_comparison.earnings_growth_yoy and fundamental_output.historical_comparison.earnings_growth_yoy < 0:
                fin_risks.append(f"Negative year-over-year earnings growth ({fundamental_output.historical_comparison.earnings_growth_yoy}%).")
        if not fin_risks:
            fin_risks.append("No immediate structural balance sheet or solvency alarms detected.")

        # 3. Sector & Market Risks
        sector_risks = [
            f"Macro interest-rate and currency fluctuation risk affecting {exchange} market liquidity.",
            "Equity beta and broader equity index systemic drawdown exposure.",
            "Potential competitive disruptions and evolving regulatory or compliance mandates.",
        ]

        # 4. Cross-Agent Divergence Detection (Requirement 4)
        has_conflict = False
        conflict_type = None
        conflict_desc = None
        severity = "None"

        if technical_output and fundamental_output:
            tech_bullish = "Bullish" in technical_output.indicators_summary.primary_trend or technical_output.overall_technical_score >= 65
            fund_weak = fundamental_output.overall_fundamental_score < 45 or fundamental_output.rating in ["Caution", "Weak"]

            tech_bearish = "Bearish" in technical_output.indicators_summary.primary_trend or technical_output.overall_technical_score <= 35
            fund_strong = fundamental_output.overall_fundamental_score >= 70 or fundamental_output.rating == "Strong"

            news_bearish = news_output and news_output.overall_sentiment_label == "Bearish"
            news_bullish = news_output and news_output.overall_sentiment_label == "Bullish"

            if tech_bullish and fund_weak:
                has_conflict = True
                conflict_type = "Technical-Fundamental Divergence (Bull Trap Risk)"
                conflict_desc = (
                    "Technical indicators reflect bullish upward price momentum, but fundamental health is "
                    "rated caution/weak with compressed margins or elevated debt. Rally may lack structural earnings backing."
                )
                severity = "High"
            elif tech_bearish and fund_strong:
                has_conflict = True
                conflict_type = "Valuation-Momentum Disconnect (Value Opportunity / Oversold)"
                conflict_desc = (
                    "Fundamentals display robust profitability and balance sheet health, but price action is in a "
                    "confirmed downward trend. Indicates potential short-term institutional rotation or broader sector selloff."
                )
                severity = "Medium"
            elif tech_bullish and news_bearish:
                has_conflict = True
                conflict_type = "Sentiment-Price Momentum Disconnect"
                conflict_desc = (
                    "Price action is trending upward despite a prevailing wave of negative news headlines and corporate developments. "
                    "Heightened volatility expected upon earnings or guidance updates."
                )
                severity = "Medium"

        cross_agent = CrossAgentDivergence(
            has_conflict=has_conflict,
            conflict_type=conflict_type,
            description=conflict_desc,
            severity=severity,
        )

        # 5. Scenario Analysis
        bull_case = (
            f"Sustained institutional inflows, expansion in operating margins above historical medians, "
            f"and positive resolution of key corporate catalysts supporting multiple expansion."
        )
        base_case = (
            f"Valuation consolidates near historical averages with steady mid-single digit revenue growth "
            f"in alignment with prevailing market beta and current economic projections."
        )
        bear_case = (
            f"Drawdown exceeding {abs(max_dd)}% triggered by macro slowdown, margin contraction, or failure "
            f"to meet quarterly earnings expectations."
        )
        scenarios = ScenarioAnalysis(
            bull_case=bull_case,
            base_case=base_case,
            bear_case=bear_case,
        )

        # 6. Data Limitations & Missing Information
        limitations = [
            f"Risk metrics calculated over {period} historical window; black swan tail risks may exceed historical parameters.",
            "Off-balance sheet obligations and future regulatory policy changes cannot be fully modeled from past filings.",
        ]
        if fundamental_output and fundamental_output.missing_data_fields:
            limitations.append(f"Unavailable data fields during analysis: {', '.join(fundamental_output.missing_data_fields[:4])}.")

        # 7. Composite Risk Score (0 to 100)
        risk_score = 40.0
        risk_score += min(30.0, (volatility / 2.0))
        risk_score += min(25.0, (abs(max_dd) / 2.0))
        if has_conflict and severity == "High":
            risk_score += 15.0
        elif has_conflict:
            risk_score += 8.0
        if len(fin_risks) >= 3:
            risk_score += 10.0

        risk_score = max(10.0, min(95.0, round(risk_score, 1)))

        if risk_score >= 70.0:
            risk_level = "High"
        elif risk_score >= 50.0:
            risk_level = "Elevated"
        elif risk_score >= 35.0:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        summary = (
            f"Overall risk level for {company_name} ({clean_ticker}) is evaluated as {risk_level} "
            f"(Risk Score: {risk_score}/100). Historical annualized volatility is {volatility}%, with a "
            f"maximum peak-to-trough drawdown of {max_dd}%. "
            f"{'CRITICAL: ' + conflict_desc if has_conflict else 'No significant cross-agent discrepancies detected.'}"
        )

        return RiskAnalysisOutput(
            ticker=clean_ticker,
            company_name=company_name,
            historical_volatility_pct=volatility,
            maximum_drawdown_pct=max_dd,
            var_95_daily_pct=var_95,
            financial_risks=fin_risks,
            sector_risks=sector_risks,
            cross_agent_divergence=cross_agent,
            scenarios=scenarios,
            data_limitations=limitations,
            overall_risk_level=risk_level,
            risk_score=risk_score,
            summary_explanation=summary,
        )
