"""
Technical Analysis Agent
Computes historical price trends and market indicators using Pandas and NumPy:
- Simple Moving Average (SMA 20, 50, 200)
- Exponential Moving Average (EMA 12, 26)
- Relative Strength Index (RSI 14)
- Moving Average Convergence Divergence (MACD 12, 26, 9)
- Annualized Historical Volatility
- Trend detection and predefined condition flags
"""

from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
import yfinance as yf
from agents.schemas import (
    TechnicalAnalysisOutput,
    TechnicalIndicatorsSummary,
    TechnicalIndicatorPoint,
)


class TechnicalAnalysisAgent:
    def __init__(self, agent_name: str = "Technical Analysis Agent"):
        self.agent_name = agent_name

    def analyze(self, ticker: str, exchange: str = "NSE", period: str = "6mo", ohlcv_df: Optional[pd.DataFrame] = None) -> TechnicalAnalysisOutput:
        clean_ticker = ticker.strip().upper()
        if exchange in ["NSE", "BSE"] and not (clean_ticker.endswith(".NS") or clean_ticker.endswith(".BO")):
            full_ticker = f"{clean_ticker}.NS" if exchange == "NSE" else f"{clean_ticker}.BO"
        else:
            full_ticker = clean_ticker

        currency = "INR" if exchange in ["NSE", "BSE"] else "USD"

        # 1. Obtain OHLCV data
        if ohlcv_df is None or ohlcv_df.empty:
            df = yf.download(full_ticker, period=period, interval="1d", progress=False)
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)
            df.reset_index(inplace=True)
            # Normalize column names
            date_col = "Date" if "Date" in df.columns else "Datetime"
            if date_col in df.columns:
                df["trading_date"] = pd.to_datetime(df[date_col]).dt.strftime("%Y-%m-%d")
        else:
            df = ohlcv_df.copy()
            if "trading_date" not in df.columns and "Date" in df.columns:
                df["trading_date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")

        if df.empty or len(df) < 5:
            raise ValueError(f"Insufficient historical data ({len(df)} rows) to compute technical indicators for {clean_ticker}.")

        # Ensure numeric close
        df["Close"] = pd.to_numeric(df["Close"], errors="coerce").ffill()
        df["Volume"] = pd.to_numeric(df.get("Volume", 0), errors="coerce").fillna(0)
        close = df["Close"]

        # 2. Moving Averages
        sma_20 = close.rolling(window=20, min_periods=1).mean()
        sma_50 = close.rolling(window=50, min_periods=1).mean()
        sma_200 = close.rolling(window=200, min_periods=1).mean() if len(close) >= 200 else None

        ema_12 = close.ewm(span=12, adjust=False).mean()
        ema_26 = close.ewm(span=26, adjust=False).mean()

        # 3. MACD Calculation (12, 26, 9)
        macd_line = ema_12 - ema_26
        macd_signal = macd_line.ewm(span=9, adjust=False).mean()
        macd_hist = macd_line - macd_signal

        # 4. RSI-14 Calculation (Wilder smoothing)
        delta = close.diff()
        gain = (delta.where(delta > 0, 0.0)).rolling(window=14, min_periods=1).mean()
        loss = (-delta.where(delta < 0, 0.0)).rolling(window=14, min_periods=1).mean()
        rs = gain / loss.replace(0, np.nan)
        rsi_series = 100.0 - (100.0 / (1.0 + rs))
        rsi_series = rsi_series.fillna(50.0)

        # 5. Annualized Historical Volatility
        log_ret = np.log(close / close.shift(1)).dropna()
        volatility = round(float(log_ret.std() * np.sqrt(252) * 100.0), 2) if len(log_ret) > 1 else 0.0

        # Current Latest Values
        current_price = round(float(close.iloc[-1]), 2)
        cur_sma20 = round(float(sma_20.iloc[-1]), 2) if not pd.isna(sma_20.iloc[-1]) else None
        cur_sma50 = round(float(sma_50.iloc[-1]), 2) if not pd.isna(sma_50.iloc[-1]) else None
        cur_sma200 = round(float(sma_200.iloc[-1]), 2) if (sma_200 is not None and not pd.isna(sma_200.iloc[-1])) else None
        cur_ema12 = round(float(ema_12.iloc[-1]), 2)
        cur_ema26 = round(float(ema_26.iloc[-1]), 2)
        cur_rsi = round(float(rsi_series.iloc[-1]), 2)
        cur_macd = round(float(macd_line.iloc[-1]), 2)
        cur_signal = round(float(macd_signal.iloc[-1]), 2)
        cur_hist = round(float(macd_hist.iloc[-1]), 2)

        # 6. Predefined Technical Conditions Identification
        conditions: List[str] = []

        # RSI condition
        if cur_rsi >= 70.0:
            rsi_cond = "Overbought"
            conditions.append(f"RSI-14 ({cur_rsi}) indicates overbought momentum (>70). Potential pullback risk.")
        elif cur_rsi <= 30.0:
            rsi_cond = "Oversold"
            conditions.append(f"RSI-14 ({cur_rsi}) indicates oversold territory (<30). Potential accumulation zone.")
        else:
            rsi_cond = "Neutral"
            conditions.append(f"RSI-14 ({cur_rsi}) is in neutral territory (30-70).")

        # MACD condition
        prev_hist = float(macd_hist.iloc[-2]) if len(macd_hist) >= 2 else 0.0
        if prev_hist < 0 and cur_hist > 0:
            macd_cond = "Bullish Crossover"
            conditions.append("MACD Line crossed above Signal Line (Recent Bullish Crossover).")
        elif prev_hist > 0 and cur_hist < 0:
            macd_cond = "Bearish Crossover"
            conditions.append("MACD Line crossed below Signal Line (Recent Bearish Crossover).")
        elif cur_hist > 0:
            macd_cond = "Bullish Momentum"
            conditions.append(f"MACD Histogram is positive (+{cur_hist}), sustaining upward momentum.")
        else:
            macd_cond = "Bearish Momentum"
            conditions.append(f"MACD Histogram is negative ({cur_hist}), sustaining downward pressure.")

        # Moving Average Trend Condition
        if cur_sma20 and cur_sma50:
            if current_price > cur_sma20 > cur_sma50:
                primary_trend = "Bullish (Upward)"
                conditions.append("Price trades above both SMA-20 and SMA-50 in confirmed bullish alignment.")
            elif current_price < cur_sma20 < cur_sma50:
                primary_trend = "Bearish (Downward)"
                conditions.append("Price trades below both SMA-20 and SMA-50 in confirmed bearish alignment.")
            elif current_price > cur_sma20:
                primary_trend = "Short-Term Upward"
                conditions.append("Price is testing above short-term SMA-20.")
            else:
                primary_trend = "Consolidation (Sideways)"
                conditions.append("Moving averages indicate range-bound consolidation.")
        else:
            primary_trend = "Sideways"

        # 7. Assemble Chart Series Points
        chart_series: List[TechnicalIndicatorPoint] = []
        for idx in range(len(df)):
            dt = str(df["trading_date"].iloc[idx])
            c_val = round(float(close.iloc[idx]), 2)
            s20 = round(float(sma_20.iloc[idx]), 2) if not pd.isna(sma_20.iloc[idx]) else None
            s50 = round(float(sma_50.iloc[idx]), 2) if not pd.isna(sma_50.iloc[idx]) else None
            s200 = round(float(sma_200.iloc[idx]), 2) if (sma_200 is not None and not pd.isna(sma_200.iloc[idx])) else None
            e12 = round(float(ema_12.iloc[idx]), 2)
            e26 = round(float(ema_26.iloc[idx]), 2)
            r = round(float(rsi_series.iloc[idx]), 2)
            m = round(float(macd_line.iloc[idx]), 2)
            ms = round(float(macd_signal.iloc[idx]), 2)
            mh = round(float(macd_hist.iloc[idx]), 2)
            vol = float(df["Volume"].iloc[idx]) if "Volume" in df.columns else 0.0

            chart_series.append(
                TechnicalIndicatorPoint(
                    date=dt,
                    close=c_val,
                    sma_20=s20,
                    sma_50=s50,
                    sma_200=s200,
                    ema_12=e12,
                    ema_26=e26,
                    rsi_14=r,
                    macd_line=m,
                    macd_signal=ms,
                    macd_hist=mh,
                    volume=vol,
                )
            )

        # 8. Technical Score (0 to 100)
        tech_score = 50.0
        if "Bullish" in primary_trend:
            tech_score += 20.0
        elif "Bearish" in primary_trend:
            tech_score -= 20.0

        if rsi_cond == "Neutral":
            tech_score += 5.0
        elif rsi_cond == "Oversold":
            tech_score += 10.0  # Favorable mean reversion entry
        elif rsi_cond == "Overbought":
            tech_score -= 10.0

        if "Bullish" in macd_cond:
            tech_score += 15.0
        elif "Bearish" in macd_cond:
            tech_score -= 15.0

        tech_score = max(5.0, min(95.0, round(tech_score, 1)))

        signal_summary = (
            f"Technical indicators characterize {clean_ticker} as {primary_trend}. "
            f"RSI-14 stands at {cur_rsi} ({rsi_cond}), while MACD displays {macd_cond} "
            f"(Histogram: {cur_hist}). Historical annualized volatility is measured at {volatility}%."
        )

        indicators_summary = TechnicalIndicatorsSummary(
            current_price=current_price,
            sma_20=cur_sma20,
            sma_50=cur_sma50,
            sma_200=cur_sma200,
            ema_12=cur_ema12,
            ema_26=cur_ema26,
            rsi_14=cur_rsi,
            rsi_condition=rsi_cond,
            macd_line=cur_macd,
            macd_signal=cur_signal,
            macd_histogram=cur_hist,
            macd_condition=macd_cond,
            historical_volatility_pct=volatility,
            primary_trend=primary_trend,
        )

        return TechnicalAnalysisOutput(
            ticker=clean_ticker,
            currency=currency,
            period=period,
            indicators_summary=indicators_summary,
            chart_series=chart_series,
            predefined_conditions=conditions,
            signal_summary=signal_summary,
            overall_technical_score=tech_score,
        )
