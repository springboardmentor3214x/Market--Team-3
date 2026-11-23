import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { loginUser } from "../../api";

export default function LoginCard({ onLoginSuccess, onOpenRegister, onOpenForgot, prefillEmail }) {
  const [email, setEmail] = useState(prefillEmail || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState(false);

  // Update email if prefillEmail changes (e.g. after registration)
  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_stock_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess(false);

    // Frontend validations
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setAuthError("Email address cannot be empty.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setAuthError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setAuthError("Password field is required.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // Connects to FastAPI endpoint POST /api/auth/login
      const response = await loginUser(cleanEmail, password);

      // Handle "Remember Me"
      if (rememberMe) {
        localStorage.setItem("remembered_stock_email", cleanEmail);
      } else {
        localStorage.removeItem("remembered_stock_email");
      }

      // Successful authentication
      setAuthSuccess(true);

      // Smooth delay for celebratory visual feedback before dashboard redirect
      setTimeout(() => {
        onLoginSuccess(response.access_token, response.email, response.user_id);
      }, 700);
    } catch (err) {
      let errorMessage = err.message || "Authentication failed.";
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        errorMessage =
          "Backend server is offline or unreachable. Please ensure the backend is running.";
      }
      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="login-card-wrapper glass-card"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top Ambient Glow Accent */}
      <div className="card-top-glow" />

      {/* Card Header & Brand */}
      <div className="card-header">
        <div className="brand-badge">
          <div className="brand-logo-icon">
            <Cpu size={18} className="cpu-pulse-icon" />
          </div>
          <div className="brand-meta">
            <span className="brand-name">MARKET INTELLIGENCE AI</span>
            <span className="brand-tag">MULTI-AGENT RESEARCH ENGINE</span>
          </div>
        </div>

        <h1 className="card-heading">Welcome Back</h1>
        <p className="card-subheading">
          Sign in to continue your intelligent market research.
        </p>
      </div>

      {/* Animated Alerts */}
      <AnimatePresence mode="wait">
        {authError && (
          <motion.div
            key="error-alert"
            className="auth-alert-badge error-badge"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle size={17} className="alert-icon" />
            <div className="alert-text">{authError}</div>
          </motion.div>
        )}

        {authSuccess && (
          <motion.div
            key="success-alert"
            className="auth-alert-badge success-badge"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle2 size={17} className="alert-icon" />
            <div className="alert-text">
              Authentication verified. Launching Workspace...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form */}
      <form onSubmit={handleLoginSubmit} className="login-form" noValidate>
        {/* Email Field */}
        <div className="form-field-group">
          <label className="field-label">Email Address</label>
          <div className="input-field-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (authError) setAuthError("");
              }}
              placeholder="e.g. analyst@firm.com"
              disabled={loading || authSuccess}
              className="custom-input"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="form-field-group">
          <div className="field-label-row">
            <label className="field-label">Password</label>
            <button
              type="button"
              className="forgot-link"
              onClick={onOpenForgot}
              disabled={loading || authSuccess}
            >
              Forgot password?
            </button>
          </div>
          <div className="input-field-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (authError) setAuthError("");
              }}
              placeholder="Enter your security password"
              disabled={loading || authSuccess}
              className="custom-input"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="pwd-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={17} className="toggle-eye" />
              ) : (
                <Eye size={17} className="toggle-eye" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="remember-row">
          <label className="custom-checkbox-container">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading || authSuccess}
            />
            <span className="checkmark" />
            <span className="checkbox-text">Remember me for 30 days</span>
          </label>
        </div>

        {/* Neon Green Login Action Button */}
        <motion.button
          type="submit"
          className={`primary-neon-btn ${loading ? "is-loading" : ""} ${
            authSuccess ? "is-success" : ""
          }`}
          disabled={loading || authSuccess}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <span className="btn-spinner-text">
              <span className="neon-spinner" />
              Authenticating with AI Agents...
            </span>
          ) : authSuccess ? (
            <span className="btn-inner">
              <CheckCircle2 size={18} /> Access Granted
            </span>
          ) : (
            <span className="btn-inner">
              <span>Sign In to Workspace</span>
              <ArrowRight size={18} className="btn-arrow" />
            </span>
          )}
        </motion.button>
      </form>

      {/* Switch to Register */}
      <div className="card-footer">
        <p className="footer-register-prompt">
          Don't have an account?{" "}
          <button
            type="button"
            className="register-highlight-btn"
            onClick={onOpenRegister}
            disabled={loading || authSuccess}
          >
            Create one
          </button>
        </p>

        {/* Security Badge */}
        <div className="security-guarantee">
          <ShieldCheck size={14} className="shield-icon" />
          <span>256-Bit SSL • JWT Session Protection • LangGraph Agent Core</span>
        </div>
      </div>
    </motion.div>
  );
}
