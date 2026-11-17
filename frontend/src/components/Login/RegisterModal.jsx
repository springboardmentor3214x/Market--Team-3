import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { registerUser, loginUser } from "../../api";

export default function RegisterModal({ isOpen, onClose, onRegisterSuccess, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerUser(cleanEmail, password);
      setSuccess(true);

      // Auto-authenticate immediately for smooth seamless onboarding
      try {
        const loginRes = await loginUser(cleanEmail, password);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          if (onLoginSuccess && loginRes.access_token) {
            onLoginSuccess(loginRes.access_token, loginRes.email, loginRes.user_id);
          } else if (onRegisterSuccess) {
            onRegisterSuccess(cleanEmail);
          }
        }, 1200);
      } catch (loginErr) {
        setTimeout(() => {
          setSuccess(false);
          if (onRegisterSuccess) onRegisterSuccess(cleanEmail);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrorMsg("");
    setSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop" onClick={handleClose}>
          <motion.div
            className="modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <button className="modal-close-btn" onClick={handleClose}>
              <X size={18} />
            </button>

            {!success ? (
              <>
                <div className="modal-icon-badge">
                  <UserPlus size={24} color="#00ff87" />
                </div>
                <h3 className="modal-title">Create Research Account</h3>
                <p className="modal-desc">
                  Join Market Intelligence AI to access multi-agent automated stock
                  research and technical synthesis.
                </p>

                {errorMsg && (
                  <motion.div
                    className="auth-alert-badge error-badge"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="input-field-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="custom-input"
                    />
                  </div>

                  <div className="input-field-wrapper" style={{ marginTop: "14px" }}>
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Password (minimum 6 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="custom-input"
                    />
                    <button
                      type="button"
                      className="pwd-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="input-field-wrapper" style={{ marginTop: "14px" }}>
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="custom-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="primary-neon-btn"
                    disabled={loading}
                    style={{ width: "100%", marginTop: "20px" }}
                  >
                    {loading ? (
                      <span className="btn-spinner-text">
                        <span className="mini-spinner" /> Initializing Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="modal-success-state">
                <CheckCircle2 size={46} color="#00ff87" style={{ marginBottom: "12px" }} />
                <h3 className="modal-title">Account Created Successfully!</h3>
                <p className="modal-desc">
                  Your credentials have been securely provisioned. Redirecting to sign in...
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
