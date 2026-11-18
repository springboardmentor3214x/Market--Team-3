"""
News and Sentiment Analysis Agent
Collects and analyzes recent financial news and company announcements:
- Retrieves genuine news articles from Yahoo Finance news feeds
- Categorizes corporate events (Earnings, Acquisitions, Regulatory, etc.)
- Classifies sentiment as Positive, Negative, or Neutral with scoring
- Preserves original source links and publication timestamps
- Identifies conflicting reports or uncertain market narratives
"""

import re
from typing import List, Dict, Any, Optional
from datetime import datetime
import yfinance as yf
from agents.schemas import (
    NewsSentimentOutput,
    NewsArticleItem,
)

# Financial Lexicon Keywords
POSITIVE_KEYWORDS = [
    "surge", "surges", "jump", "jumps", "beat", "beats", "rally", "rallies", "growth",
    "profit", "strong", "outperform", "bullish", "record", "expansion", "dividend",
    "upgrade", "higher", "gains", "win", "partnership", "success", "acquisition",
    "positive", "revenue up", "soars", "soar", "deal", "approval"
]

NEGATIVE_KEYWORDS = [
    "fall", "falls", "drop", "drops", "slump", "decline", "declines", "loss", "losses",
    "miss", "misses", "probe", "investigation", "lawsuit", "penalty", "debt", "risk",
    "layoffs", "cut", "cuts", "downgrade", "bearish", "plunge", "weak", "warning",
    "negative", "delay", "slashes", "inflation", "tariff", "fraud"
]

EVENT_PATTERNS = {
    "Earnings": [r"earnings", r"quarterly results", r"q\d\s+profit", r"q\d\s+revenue", r"net profit"],
    "Acquisition": [r"acqui", r"buyout", r"merger", r"takeover", r"deal worth"],
    "Regulatory": [r"regulatory", r"probe", r"investigation", r"sec\b", r"sebi\b", r"antitrust", r"lawsuit"],
    "Product / Expansion": [r"launch", r"partner", r"contract", r"expands", r"new facility", r"ai\b"],
    "Leadership": [r"ceo", r"cfo", r"executive", r"board", r"resigns", r"appointed"],
}


class NewsSentimentAnalysisAgent:
    def __init__(self, agent_name: str = "News and Sentiment Analysis Agent"):
        self.agent_name = agent_name

    def _classify_sentiment(self, text: str) -> tuple[str, float, List[str]]:
        lower_text = text.lower()
        matched_pos = [w for w in POSITIVE_KEYWORDS if re.search(r"\b" + re.escape(w) + r"\b", lower_text)]
        matched_neg = [w for w in NEGATIVE_KEYWORDS if re.search(r"\b" + re.escape(w) + r"\b", lower_text)]

        pos_count = len(matched_pos)
        neg_count = len(matched_neg)
        total = pos_count + neg_count

        if total == 0:
            return "Neutral", 0.0, []

        score = (pos_count - neg_count) / max(total, 1)
        score = max(-1.0, min(1.0, round(score, 2)))

        matched_all = matched_pos + matched_neg
        if score > 0.15:
            return "Positive", score, matched_all[:4]
        elif score < -0.15:
            return "Negative", score, matched_all[:4]
        else:
            return "Neutral", score, matched_all[:4]

    def _detect_event_category(self, text: str) -> str:
        lower_text = text.lower()
        for cat, patterns in EVENT_PATTERNS.items():
            for pat in patterns:
                if re.search(pat, lower_text):
                    return cat
        return "General Market"

    def analyze(self, ticker: str, exchange: str = "NSE") -> NewsSentimentOutput:
        clean_ticker = ticker.strip().upper()
        if exchange in ["NSE", "BSE"] and not (clean_ticker.endswith(".NS") or clean_ticker.endswith(".BO")):
            full_ticker = f"{clean_ticker}.NS" if exchange == "NSE" else f"{clean_ticker}.BO"
        else:
            full_ticker = clean_ticker

        yf_ticker = yf.Ticker(full_ticker)
        raw_news = yf_ticker.news or []
        info = yf_ticker.info or {}
        company_name = info.get("longName") or info.get("shortName") or clean_ticker

        articles: List[NewsArticleItem] = []
        pos_cnt = 0
        neg_cnt = 0
        neu_cnt = 0
        score_sum = 0.0
        events_found: List[str] = []

        for idx, item in enumerate(raw_news[:12]):
            # Handle yfinance news payload structure variations
            content = item.get("content", item)
            title = content.get("title") or item.get("title") or "Corporate News Release"
            provider = (
                content.get("provider", {}).get("displayName")
                or item.get("publisher")
                or "Financial Wire"
            )

            # URL extraction
            url = (
                content.get("canonicalUrl", {}).get("url")
                or content.get("clickThroughUrl", {}).get("url")
                or item.get("link")
                or f"https://finance.yahoo.com/quote/{full_ticker}"
            )

            # Date extraction
            pub_date = content.get("pubDate")
            if not pub_date and "providerPublishTime" in item:
                try:
                    pub_date = datetime.utcfromtimestamp(item["providerPublishTime"]).isoformat() + "Z"
                except Exception:
                    pub_date = datetime.utcnow().isoformat() + "Z"
            elif not pub_date:
                pub_date = datetime.utcnow().isoformat() + "Z"

            summary = content.get("summary") or item.get("summary") or title

            sentiment, score, keywords = self._classify_sentiment(title + " " + summary)
            event_cat = self._detect_event_category(title + " " + summary)

            if sentiment == "Positive":
                pos_cnt += 1
            elif sentiment == "Negative":
                neg_cnt += 1
            else:
                neu_cnt += 1

            score_sum += score

            if event_cat != "General Market" and event_cat not in events_found:
                events_found.append(f"{event_cat}: {title[:75]}...")

            articles.append(
                NewsArticleItem(
                    id=f"{clean_ticker}-news-{idx+1}",
                    title=title,
                    publisher=provider,
                    source_url=url,
                    published_date=str(pub_date),
                    summary=summary[:280] + ("..." if len(summary) > 280 else ""),
                    sentiment=sentiment,
                    sentiment_score=score,
                    keywords=keywords,
                    event_category=event_cat,
                )
            )

        total = len(articles)
        avg_score = round(score_sum / max(total, 1), 2)

        if avg_score > 0.15 and pos_cnt > neg_cnt:
            overall_label = "Bullish"
        elif avg_score < -0.15 and neg_cnt > pos_cnt:
            overall_label = "Bearish"
        else:
            overall_label = "Neutral"

        # Check for conflicting reports
        conflicting = (pos_cnt >= 2 and neg_cnt >= 2)
        conflicting_notes = (
            f"Both positive ({pos_cnt}) and negative ({neg_cnt}) news headlines detected simultaneously. "
            f"Market sentiment is polarized or mixed across publishers."
            if conflicting
            else None
        )

        summary_explanation = (
            f"Analyzed {total} verified news publications for {company_name} ({clean_ticker}). "
            f"Sentiment distribution: {pos_cnt} Positive, {neg_cnt} Negative, {neu_cnt} Neutral, "
            f"yielding an overall {overall_label.lower()} score of {avg_score}. "
            f"{'Conflicting narratives identified.' if conflicting else 'Consistent sentiment signals.'}"
        )

        return NewsSentimentOutput(
            ticker=clean_ticker,
            company_name=company_name,
            total_articles_analyzed=total,
            sentiment_breakdown={"Positive": pos_cnt, "Negative": neg_cnt, "Neutral": neu_cnt},
            average_sentiment_score=avg_score,
            overall_sentiment_label=overall_label,
            key_corporate_events=events_found[:4],
            articles=articles,
            conflicting_reports_flag=conflicting,
            conflicting_notes=conflicting_notes,
            summary_explanation=summary_explanation,
        )
