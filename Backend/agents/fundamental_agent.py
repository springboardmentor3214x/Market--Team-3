"""
Fundamental Analysis Agent
Responsible for analyzing revenue, earnings, profitability, debt/stability,
valuation ratios (P/E, P/B, ROE), historical comparisons, and identifying missing data.
"""

from typing import Dict, Any, List, Optional
import yfinance as yf
import pandas as pd
import numpy as np
from agents.schemas import (
    FundamentalAnalysisOutput,
    FinancialRatios,
    HistoricalPerformanceComparison,
)


class FundamentalAnalysisAgent:
    def __init__(self, agent_name: str = "Fundamental Analysis Agent"):
        self.agent_name = agent_name

    def analyze(self, ticker: str, exchange: str = "NSE") -> FundamentalAnalysisOutput:
        clean_ticker = ticker.strip().upper()
        if exchange in ["NSE", "BSE"] and not (clean_ticker.endswith(".NS") or clean_ticker.endswith(".BO")):
            full_ticker = f"{clean_ticker}.NS" if exchange == "NSE" else f"{clean_ticker}.BO"
        else:
            full_ticker = clean_ticker

        yf_ticker = yf.Ticker(full_ticker)
        info = yf_ticker.info or {}

        company_name = info.get("longName") or info.get("shortName") or clean_ticker
        currency = info.get("currency") or ("INR" if exchange in ["NSE", "BSE"] else "USD")
        market_cap = info.get("marketCap")

        # 1. Financial Ratios Extraction
        missing_fields: List[str] = []

        def get_val(key: str, multiplier: float = 1.0) -> Optional[float]:
            val = info.get(key)
            if val is not None and not (isinstance(val, float) and np.isnan(val)):
                return round(float(val) * multiplier, 2)
            missing_fields.append(key)
            return None

        pe_ratio = get_val("trailingPE")
        forward_pe = get_val("forwardPE")
        pb_ratio = get_val("priceToBook")
        roe = get_val("returnOnEquity", 100.0)
        roa = get_val("returnOnAssets", 100.0)
        debt_to_equity = get_val("debtToEquity")
        current_ratio = get_val("currentRatio")
        quick_ratio = get_val("quickRatio")
        gross_margin = get_val("grossMargins", 100.0)
        operating_margin = get_val("operatingMargins", 100.0)
        net_margin = get_val("profitMargins", 100.0)
        dividend_yield = get_val("dividendYield")
        if dividend_yield is not None and dividend_yield < 1.0:
            dividend_yield = round(dividend_yield * 100.0, 2)
        ev_to_ebitda = get_val("enterpriseToEbitda")

        ratios = FinancialRatios(
            pe_ratio=pe_ratio,
            forward_pe=forward_pe,
            pb_ratio=pb_ratio,
            roe=roe,
            roa=roa,
            debt_to_equity=debt_to_equity,
            current_ratio=current_ratio,
            quick_ratio=quick_ratio,
            gross_margin=gross_margin,
            operating_margin=operating_margin,
            net_margin=net_margin,
            dividend_yield=dividend_yield,
            ev_to_ebitda=ev_to_ebitda,
        )

        # 2. Historical Performance Comparison (Annual Financials)
        period_labels = []
        rev_trend = []
        net_inc_trend = []
        rev_growth = None
        earnings_growth = None

        try:
            fin = yf_ticker.financials
            if fin is not None and not fin.empty:
                cols = list(fin.columns)[:4]  # Up to last 4 years
                for col in reversed(cols):
                    date_str = str(col)[:10]
                    period_labels.append(date_str)

                    # Extract Total Revenue
                    rev_val = None
                    for key in ["Total Revenue", "Operating Revenue", "Revenue"]:
                        if key in fin.index:
                            rev_val = fin.loc[key, col]
                            break
                    rev_trend.append(float(rev_val) if pd.notna(rev_val) else None)

                    # Extract Net Income
                    net_val = None
                    for key in ["Net Income", "Net Income Common Stockholders"]:
                        if key in fin.index:
                            net_val = fin.loc[key, col]
                            break
                    net_inc_trend.append(float(net_val) if pd.notna(net_val) else None)

                # Compute YoY growth between last two years if available
                valid_revs = [r for r in rev_trend if r is not None]
                if len(valid_revs) >= 2 and valid_revs[-2] > 0:
                    rev_growth = round(((valid_revs[-1] - valid_revs[-2]) / valid_revs[-2]) * 100.0, 2)

                valid_nets = [n for n in net_inc_trend if n is not None]
                if len(valid_nets) >= 2 and valid_nets[-2] != 0:
                    earnings_growth = round(((valid_nets[-1] - valid_nets[-2]) / abs(valid_nets[-2])) * 100.0, 2)
        except Exception:
            pass

        comparison = HistoricalPerformanceComparison(
            period_labels=period_labels,
            revenue_trend=rev_trend,
            net_income_trend=net_inc_trend,
            revenue_growth_yoy=rev_growth,
            earnings_growth_yoy=earnings_growth,
        )

        # 3. Profitability Assessment
        profitability_points = []
        if operating_margin is not None:
            if operating_margin >= 20.0:
                profitability_points.append(f"Strong operating efficiency with {operating_margin}% operating margin.")
            elif operating_margin >= 10.0:
                profitability_points.append(f"Healthy operating margin of {operating_margin}%.")
            elif operating_margin > 0:
                profitability_points.append(f"Modest operating margin of {operating_margin}%.")
            else:
                profitability_points.append(f"Operating losses observed (margin: {operating_margin}%).")

        if roe is not None:
            if roe >= 20.0:
                profitability_points.append(f"Superior capital allocation demonstrated by an ROE of {roe}%.")
            elif roe >= 12.0:
                profitability_points.append(f"Solid return on equity at {roe}%.")
            else:
                profitability_points.append(f"Subdued equity return rate of {roe}%.")

        profitability_assessment = " ".join(profitability_points) or "Profitability metrics partially unavailable."

        # 4. Debt & Solvency Assessment
        debt_points = []
        if debt_to_equity is not None:
            if debt_to_equity < 30.0:
                debt_points.append(f"Low balance-sheet leverage (Debt/Equity: {debt_to_equity}%).")
            elif debt_to_equity < 80.0:
                debt_points.append(f"Moderate debt levels relative to equity ({debt_to_equity}%).")
            else:
                debt_points.append(f"Elevated debt obligations relative to equity ({debt_to_equity}%).")

        if current_ratio is not None:
            if current_ratio >= 1.5:
                debt_points.append(f"Strong short-term liquidity with a current ratio of {current_ratio}x.")
            elif current_ratio >= 1.0:
                debt_points.append(f"Adequate liquidity buffer (Current Ratio: {current_ratio}x).")
            else:
                debt_points.append(f"Tight working capital liquidity (Current Ratio: {current_ratio}x).")

        debt_stability_assessment = " ".join(debt_points) or "Solvency metrics partially unavailable."

        # 5. Composite Scoring
        score = 50.0
        if operating_margin is not None:
            score += 15.0 if operating_margin > 18.0 else (8.0 if operating_margin > 10.0 else -10.0)
        if roe is not None:
            score += 15.0 if roe > 18.0 else (8.0 if roe > 10.0 else -5.0)
        if debt_to_equity is not None:
            score += 10.0 if debt_to_equity < 40.0 else (-10.0 if debt_to_equity > 100.0 else 0)
        if current_ratio is not None:
            score += 10.0 if current_ratio >= 1.4 else (-5.0 if current_ratio < 1.0 else 2.0)
        score = max(5.0, min(95.0, round(score, 1)))

        if score >= 80:
            rating = "Strong"
        elif score >= 65:
            rating = "Healthy"
        elif score >= 50:
            rating = "Moderate"
        elif score >= 35:
            rating = "Caution"
        else:
            rating = "Weak"

        # 6. Concise Narrative Summary
        summary = (
            f"{company_name} ({clean_ticker}) displays a {rating.lower()} fundamental profile with a fundamental "
            f"health score of {score}/100. "
            f"{profitability_assessment} {debt_stability_assessment}"
        )

        return FundamentalAnalysisOutput(
            ticker=clean_ticker,
            company_name=company_name,
            currency=currency,
            market_cap=market_cap,
            ratios=ratios,
            profitability_assessment=profitability_assessment,
            debt_stability_assessment=debt_stability_assessment,
            historical_comparison=comparison,
            missing_data_fields=missing_fields,
            summary_explanation=summary,
            overall_fundamental_score=score,
            rating=rating,
        )
