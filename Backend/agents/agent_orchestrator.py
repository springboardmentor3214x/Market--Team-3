"""
Multi-Agent Orchestrator for Module 3
Coordinates execution of the 4 individual AI agents:
1. Fundamental Analysis Agent
2. Technical Analysis Agent
3. News & Sentiment Analysis Agent
4. Risk Analysis Agent
"""

from concurrent.futures import ThreadPoolExecutor
from typing import Optional
from agents.fundamental_agent import FundamentalAnalysisAgent
from agents.technical_agent import TechnicalAnalysisAgent
from agents.news_agent import NewsSentimentAnalysisAgent
from agents.risk_agent import RiskAnalysisAgent
from agents.schemas import (
    FundamentalAnalysisOutput,
    TechnicalAnalysisOutput,
    NewsSentimentOutput,
    RiskAnalysisOutput,
    MultiAgentAnalysisResponse,
)


class MultiAgentOrchestrator:
    def __init__(self):
        self.fundamental_agent = FundamentalAnalysisAgent()
        self.technical_agent = TechnicalAnalysisAgent()
        self.news_agent = NewsSentimentAnalysisAgent()
        self.risk_agent = RiskAnalysisAgent()

    def run_fundamental(self, ticker: str, exchange: str = "NSE") -> FundamentalAnalysisOutput:
        return self.fundamental_agent.analyze(ticker=ticker, exchange=exchange)

    def run_technical(self, ticker: str, exchange: str = "NSE", period: str = "6mo") -> TechnicalAnalysisOutput:
        return self.technical_agent.analyze(ticker=ticker, exchange=exchange, period=period)

    def run_news(self, ticker: str, exchange: str = "NSE") -> NewsSentimentOutput:
        return self.news_agent.analyze(ticker=ticker, exchange=exchange)

    def run_risk(
        self,
        ticker: str,
        exchange: str = "NSE",
        period: str = "6mo",
        fundamental_output: Optional[FundamentalAnalysisOutput] = None,
        technical_output: Optional[TechnicalAnalysisOutput] = None,
        news_output: Optional[NewsSentimentOutput] = None,
    ) -> RiskAnalysisOutput:
        return self.risk_agent.analyze(
            ticker=ticker,
            exchange=exchange,
            period=period,
            fundamental_output=fundamental_output,
            technical_output=technical_output,
            news_output=news_output,
        )

    def run_all(self, ticker: str, exchange: str = "NSE", period: str = "6mo") -> MultiAgentAnalysisResponse:
        """
        Executes Fundamental, Technical, and News agents in parallel, then feeds their
        findings into the Risk Analysis Agent to evaluate cross-agent divergences.
        """
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_fund = executor.submit(self.fundamental_agent.analyze, ticker=ticker, exchange=exchange)
            future_tech = executor.submit(self.technical_agent.analyze, ticker=ticker, exchange=exchange, period=period)
            future_news = executor.submit(self.news_agent.analyze, ticker=ticker, exchange=exchange)

            fund_res = future_fund.result()
            tech_res = future_tech.result()
            news_res = future_news.result()

        # Risk agent evaluates findings including cross-agent conflicts
        risk_res = self.risk_agent.analyze(
            ticker=ticker,
            exchange=exchange,
            period=period,
            fundamental_output=fund_res,
            technical_output=tech_res,
            news_output=news_res,
        )

        return MultiAgentAnalysisResponse(
            ticker=fund_res.ticker,
            company_name=fund_res.company_name,
            currency=fund_res.currency,
            exchange=exchange,
            period=period,
            fundamental=fund_res,
            technical=tech_res,
            news=news_res,
            risk=risk_res,
        )


# Global singleton instance
agent_orchestrator = MultiAgentOrchestrator()
