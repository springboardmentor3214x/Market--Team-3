import React, { useState } from "react";
import { Database, FileText, Layers, RefreshCw } from "lucide-react";

export default function FinancialStatementsView({
  financialStatements = {},
  ticker = "",
  currency = "USD",
}) {
  const [activeTab, setActiveTab] = useState("income_statement"); // income_statement | balance_sheet | cash_flow
  const [frequency, setFrequency] = useState("annual"); // annual | quarterly

  // Extract statement based on active frequency & tab
  const freqData = financialStatements[frequency] || financialStatements;
  const statementObj = freqData[activeTab]?.statement || {};
  const statementDates = freqData[activeTab]?.dates || Object.keys(statementObj || {});
  const statementMetrics =
    freqData[activeTab]?.metrics ||
    (statementDates.length > 0 ? Object.keys(statementObj[statementDates[0]] || {}) : []);

  const formatNumber = (val) => {
    if (val === "Not Available" || val === null || val === undefined) {
      return "Not Available";
    }
    const num = Number(val);
    if (isNaN(num)) return String(val);
    if (Math.abs(num) >= 1e9) {
      return (num / 1e9).toFixed(2) + " B";
    }
    if (Math.abs(num) >= 1e6) {
      return (num / 1e6).toFixed(2) + " M";
    }
    return num.toLocaleString();
  };

  return (
    <div className="ws-glass-card">
      <div className="ws-card-header">
        <div className="ws-card-title">
          <Database size={16} className="ws-card-title-icon" />
          <span>Financial Statements</span>
        </div>

        {/* Annual vs Quarterly Frequency Switch */}
        <div className="ws-freq-toggle-group" style={{ position: "relative", zIndex: 30, pointerEvents: "auto" }}>
          <button
            type="button"
            className={`ws-freq-btn ${frequency === "annual" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setFrequency("annual");
            }}
            style={{ cursor: "pointer", pointerEvents: "auto", position: "relative", zIndex: 31 }}
          >
            Annual
          </button>
          <button
            type="button"
            className={`ws-freq-btn ${frequency === "quarterly" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setFrequency("quarterly");
            }}
            style={{ cursor: "pointer", pointerEvents: "auto", position: "relative", zIndex: 31 }}
          >
            Quarterly
          </button>
        </div>
      </div>

      {/* Statement Type Tabs */}
      <div className="ws-tabs-bar" style={{ position: "relative", zIndex: 30, pointerEvents: "auto" }}>
        <button
          type="button"
          className={`ws-tab-btn ${activeTab === "income_statement" ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab("income_statement");
          }}
          style={{ cursor: "pointer", pointerEvents: "auto", position: "relative", zIndex: 31 }}
        >
          Income Statement
        </button>
        <button
          type="button"
          className={`ws-tab-btn ${activeTab === "balance_sheet" ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab("balance_sheet");
          }}
          style={{ cursor: "pointer", pointerEvents: "auto", position: "relative", zIndex: 31 }}
        >
          Balance Sheet
        </button>
        <button
          type="button"
          className={`ws-tab-btn ${activeTab === "cash_flow" ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab("cash_flow");
          }}
          style={{ cursor: "pointer", pointerEvents: "auto", position: "relative", zIndex: 31 }}
        >
          Cash Flow
        </button>
      </div>

      {/* Table Content */}
      {statementDates.length === 0 ? (
        <div className="ws-empty-text">
          <p>
            {frequency === "quarterly" ? "Quarterly" : "Annual"} financial statement data is Not Available for {ticker}.
          </p>
        </div>
      ) : (
        <div className="ws-table-container">
          <table className="ws-table">
            <thead>
              <tr>
                <th style={{ minWidth: 220 }}>Financial Metric</th>
                {statementDates.map((date) => (
                  <th key={date} style={{ minWidth: 120 }}>
                    {date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statementMetrics.map((metric) => (
                <tr key={metric}>
                  <td style={{ color: "var(--ws-text-secondary)", fontWeight: 600 }}>
                    {metric}
                  </td>
                  {statementDates.map((date) => {
                    const rawVal = statementObj[date]?.[metric];
                    const isNA = rawVal === "Not Available" || rawVal === null || rawVal === undefined;
                    return (
                      <td key={date} style={{ color: isNA ? "var(--ws-text-muted)" : "var(--ws-text-primary)" }}>
                        {formatNumber(rawVal)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
