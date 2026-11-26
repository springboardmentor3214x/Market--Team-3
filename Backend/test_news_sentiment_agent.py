"""
Test Suite for Module 5: News and Sentiment Analysis Agent
Validates:
1. Retrieval and structured schema compliance
2. Context-aware sentiment classification & negation handling
3. Corporate event detection & business relevance generation
4. Official company announcement vs news report classification
5. Conflicting reports & uncertain information detection
6. Company relevance filtering and deduplication
7. FastAPI endpoint behavior and query filtering
"""

import unittest
from datetime import datetime
from agents.news_agent import NewsSentimentAnalysisAgent
from agents.schemas import NewsSentimentOutput, NewsArticleItem
from main import app
from fastapi.testclient import TestClient


class TestNewsSentimentAgent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.agent = NewsSentimentAnalysisAgent()
        cls.client = TestClient(app)

    def test_sentiment_classification_positive(self):
        # Direct positive statements
        text = "Infosys beats quarterly revenue estimates and signs major AI partnership"
        sentiment, score, keywords = self.agent._classify_sentiment(text)
        self.assertEqual(sentiment, "Positive")
        self.assertGreater(score, 0.12)
        self.assertTrue(any("beats" in kw or "partnership" in kw for kw in keywords))

    def test_sentiment_classification_negative(self):
        # Direct negative statements
        text = "Company misses earnings forecast and faces regulatory probe with tax penalties"
        sentiment, score, keywords = self.agent._classify_sentiment(text)
        self.assertEqual(sentiment, "Negative")
        self.assertLess(score, -0.12)

    def test_sentiment_negation_handling(self):
        # Negation should invert positive to negative
        text = "Company failed to achieve revenue growth and did not beat estimates"
        sentiment, score, keywords = self.agent._classify_sentiment(text)
        self.assertEqual(sentiment, "Negative")

        # Negation of drop should be positive or neutral
        text_no_drop = "Management confirmed there was no drop in client renewals"
        sentiment_nd, score_nd, _ = self.agent._classify_sentiment(text_no_drop)
        self.assertIn(sentiment_nd, ["Positive", "Neutral"])

    def test_official_vs_news_classification(self):
        # Official disclosure via PR wire / filing
        src_type, is_off, ver = self.agent._detect_source_type_and_verification(
            "Press Release: Infosys Announces Cloud Transformation Initiative",
            "PR Newswire",
            "https://www.prnewswire.com/news-releases/infosys-cloud"
        )
        self.assertEqual(src_type, "official_announcement")
        self.assertTrue(is_off)
        self.assertEqual(ver, "Verified")

        # News media report
        src_type_med, is_off_med, ver_med = self.agent._detect_source_type_and_verification(
            "Tech Sector Rebounds as Indian IT Stocks Rally",
            "Bloomberg Financial Desk",
            "https://www.bloomberg.com/news/articles/2026-11-25/tech-rally"
        )
        self.assertEqual(src_type_med, "news_report")
        self.assertFalse(is_off_med)

    def test_speculation_and_rumor_detection(self):
        # Rumor flagging
        _, _, ver_rumor = self.agent._detect_source_type_and_verification(
            "Sources say company considering major acquisition in Europe, rumors suggest",
            "Market Rumors Wire",
            "https://wire.com/rumors"
        )
        self.assertEqual(ver_rumor, "Unconfirmed Rumor")

    def test_corporate_event_categorization(self):
        # Quarterly results
        cat_earn, rel_earn = self.agent._detect_event_category("Company reports strong Q3 profit and revenue growth")
        self.assertEqual(cat_earn, "Quarterly Financial Results")
        self.assertIn("earnings", rel_earn.lower())

        # Strategic partnerships
        cat_part, rel_part = self.agent._detect_event_category("Announces multi-year strategic partnership with cloud provider")
        self.assertEqual(cat_part, "Strategic Partnerships & Deals")
        self.assertIn("market", rel_part.lower())

        # Regulatory developments
        cat_reg, rel_reg = self.agent._detect_event_category("SEBI initiates regulatory investigation into disclosure practices")
        self.assertEqual(cat_reg, "Regulatory & Legal Developments")
        self.assertIn("compliance", rel_reg.lower())

    def test_company_relevance_filtering(self):
        # Relevant
        self.assertTrue(self.agent._is_relevant_to_company("Infosys completes major AI transformation", "Infosys Limited", "INFY"))
        self.assertTrue(self.agent._is_relevant_to_company("INFY shares climb 2.5% in early trading", "Infosys Limited", "INFY"))

        # Completely unrelated company
        self.assertFalse(self.agent._is_relevant_to_company("Toyota launches new hybrid electric SUV in Tokyo", "Infosys Limited", "INFY"))

    def test_deduplication(self):
        norm1 = self.agent._normalize_title("Infosys Signs Major Cloud Deal - Bloomberg")
        norm2 = self.agent._normalize_title("Infosys Signs Major Cloud Deal - Reuters")
        self.assertEqual(norm1, norm2)

    def test_agent_analyze_pipeline(self):
        output = self.agent.analyze("INFY", "NSE")
        self.assertIsInstance(output, NewsSentimentOutput)
        self.assertEqual(output.ticker, "INFY")
        self.assertGreater(output.total_articles_analyzed, 0)
        self.assertIn(output.overall_sentiment_label, ["Bullish", "Bearish", "Neutral"])
        self.assertIn("Positive", output.sentiment_breakdown)
        self.assertIn("Negative", output.sentiment_breakdown)
        self.assertIn("Neutral", output.sentiment_breakdown)
        self.assertTrue(len(output.summary_explanation) > 10)

    def test_fastapi_news_endpoints(self):
        # Basic news retrieval
        res = self.client.get("/api/agents/news?ticker=INFY&market=NSE")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["ticker"], "INFY")
        self.assertIn("articles", data)
        self.assertIn("sentiment_breakdown", data)

        # Filtering by sentiment
        res_filtered = self.client.get("/api/agents/news?ticker=INFY&market=NSE&sentiment=Positive")
        self.assertEqual(res_filtered.status_code, 200)
        data_filtered = res_filtered.json()
        for art in data_filtered["articles"]:
            self.assertEqual(art["sentiment"], "Positive")


if __name__ == "__main__":
    unittest.main()
