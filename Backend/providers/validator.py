"""
Market Data Validation Engine (Module 2 Requirement 8)
Implements rigorous statistical & logical validation on OHLCV datasets using Pandas and NumPy.
"""
from typing import Dict, Any, List
import pandas as pd
import numpy as np

def validate_and_clean_ohlcv(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Performs comprehensive data cleaning and validation:
    1. Standardizes date formatting to YYYY-MM-DD.
    2. Drops duplicate dates and records audit metric.
    3. Detects and sanitizes non-numeric fields.
    4. Identifies missing/null OHLCV values without fabricating synthetic data.
    5. Validates logical price rules:
       - High >= Low
       - Low <= Open <= High
       - Low <= Close <= High
       - Volume >= 0
    6. Returns cleaned records and an audit report dictionary.
    """
    if df is None or df.empty:
        return {
            "records": [],
            "validation_summary": {
                "initial_records": 0,
                "valid_records_returned": 0,
                "duplicates_removed": 0,
                "missing_values_detected": 0,
                "inconsistent_rows_dropped": 0,
                "status": "No data available",
            },
        }

    df = df.copy()

    # Ensure Date is a regular column
    if "Date" not in df.columns and df.index.name in ["Date", "Datetime"]:
        df = df.reset_index()
    elif "Date" not in df.columns:
        df = df.reset_index()
        # Rename first column if it represents date
        first_col = df.columns[0]
        df = df.rename(columns={first_col: "Date"})

    initial_count = len(df)

    # 1. Standardize date format to YYYY-MM-DD
    try:
        df["trading_date"] = pd.to_datetime(df["Date"], errors="coerce").dt.strftime("%Y-%m-%d")
    except Exception:
        df["trading_date"] = df["Date"].astype(str).str.slice(0, 10)

    # Drop rows with invalid / unparseable dates
    invalid_dates_dropped = int(df["trading_date"].isna().sum())
    df = df.dropna(subset=["trading_date"])

    # 2. Duplicate trading dates removal
    pre_dedup = len(df)
    df = df.drop_duplicates(subset=["trading_date"], keep="last")
    duplicates_removed = pre_dedup - len(df)

    # Ensure standard OHLCV columns exist
    for col in ["Open", "High", "Low", "Close", "Volume"]:
        if col not in df.columns:
            df[col] = np.nan

    if "Adj Close" not in df.columns:
        df["Adj Close"] = df["Close"]

    numeric_cols = ["Open", "High", "Low", "Close", "Adj Close", "Volume"]

    # 3. Detect and coerce non-numeric values
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # 4. Missing values check (Count and drop, DO NOT invent fake data)
    missing_mask = df[numeric_cols].isna().any(axis=1)
    missing_count = int(missing_mask.sum())
    df = df[~missing_mask]

    # 5. Logical Consistency Rules (High >= Low, Low <= Open <= High, Low <= Close <= High, Volume >= 0)
    # Using float tolerances for floating-point precision safety
    eps = 1e-4
    logical_mask = (
        (df["High"] >= (df["Low"] - eps)) &
        (df["Open"] >= (df["Low"] - eps)) &
        (df["Open"] <= (df["High"] + eps)) &
        (df["Close"] >= (df["Low"] - eps)) &
        (df["Close"] <= (df["High"] + eps)) &
        (df["Volume"] >= 0)
    )

    inconsistent_count = int((~logical_mask).sum())
    df_valid = df[logical_mask].copy()

    # Sort chronologically by trading date
    df_valid = df_valid.sort_values("trading_date")

    # Structure into clean records for agents & frontend
    clean_records = []
    for _, row in df_valid.iterrows():
        clean_records.append({
            "trading_date": str(row["trading_date"]),
            "Open": round(float(row["Open"]), 2),
            "High": round(float(row["High"]), 2),
            "Low": round(float(row["Low"]), 2),
            "Close": round(float(row["Close"]), 2),
            "Adj Close": round(float(row["Adj Close"]), 2) if pd.notna(row["Adj Close"]) else round(float(row["Close"]), 2),
            "Volume": int(row["Volume"]),
        })

    validation_summary = {
        "initial_records": initial_count,
        "valid_records_returned": len(clean_records),
        "duplicates_removed": duplicates_removed,
        "invalid_dates_dropped": invalid_dates_dropped,
        "missing_values_detected": missing_count,
        "inconsistent_rows_dropped": inconsistent_count,
        "status": "PASS" if (missing_count == 0 and inconsistent_count == 0) else "CLEANED_AND_VERIFIED",
    }

    return {
        "records": clean_records,
        "validation_summary": validation_summary,
    }
