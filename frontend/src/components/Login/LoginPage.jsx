import React, { useState } from "react";
import { motion } from "framer-motion";
import FinancialScene3D from "./FinancialScene3D";
import FloatingStockPills from "./FloatingStockPills";
import LoginCard from "./LoginCard";
import RegisterModal from "./RegisterModal";
import ForgotPasswordModal from "./ForgotPasswordModal";
import {
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle,
  BarChart2,
} from "lucide-react";
import "./Login.css";

export default function LoginPage({ onLoginSuccess }) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [registeredEmailHint, setRegisteredEmailHint] = useState("");

  const handleRegisterSuccess = (email) => {
    setRegisteredEmailHint(email);
  };

  return (
    <div className="login-root-container">
      {/* Background Ambient Radiance & Grid Overlay */}
      <div className="ambient-background">
        <div className="radial-glow top-left-glow" />
        <div className="radial-glow center-glow" />
        <div className="radial-glow bottom-right-glow" />
        <div className="cyber-grid-overlay" />
      </div>

      <div className="login-split-layout">
        {/* =========================================
            LEFT SECTION: IMMERSIVE 3D VISUAL & BRAND
            ========================================= */}
        <div className="left-hero-section">
          {/* Three.js 3D WebGL Canvas Layer */}
          <FinancialScene3D />

          {/* Floating Stock Badges & Real-Time Indicators */}
          <FloatingStockPills />

          {/* Left Hero Narrative Layer */}
          <div className="hero-content-layer">
            {/* Top Engine Pill */}
            <div className="status-pill-badge">
              <span className="live-indicator-dot" />
              <span className="pill-text">AI-POWERED MULTI-AGENT SYSTEM</span>
              <span className="pill-version">v2.4</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-headline">
              Your Next Investment Insight <br />
              <span className="gradient-text">Starts Here.</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle">
              Access intelligent market research powered by multiple specialized AI
              agents analyzing technical patterns, fundamentals, news sentiment, and risk
              in real time.
            </p>

            {/* Feature Highlights Grid */}
            <div className="hero-features-grid">
              <div className="feature-item">
                <div className="feature-icon-box">
                  <Cpu size={16} color="#00ff87" />
                </div>
                <div className="feature-text">
                  <strong>4 Specialized AI Agents</strong>
                  <span>Fundamental, Technical, News & Risk</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box">
                  <TrendingUp size={16} color="#00ff87" />
                </div>
                <div className="feature-text">
                  <strong>Automated Alpha Signals</strong>
                  <span>Consensus-driven market predictions</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box">
                  <Layers size={16} color="#00ff87" />
                </div>
                <div className="feature-text">
                  <strong>Conflict Resolution Engine</strong>
                  <span>LangGraph supervisor cross-verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            RIGHT SECTION: PREMIUM GLASSMORPHISM LOGIN
            ========================================= */}
        <div className="right-card-section">
          <LoginCard
            onLoginSuccess={onLoginSuccess}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenForgot={() => setIsForgotOpen(true)}
            prefillEmail={registeredEmailHint}
          />
        </div>
      </div>

      {/* Account Registration Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
        onLoginSuccess={onLoginSuccess}
      />

      {/* Forgot Password Recovery Modal */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </div>
  );
}
