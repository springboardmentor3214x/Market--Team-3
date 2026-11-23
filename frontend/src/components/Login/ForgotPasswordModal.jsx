import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, KeyRound, CheckCircle2, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { resetPassword } from "../../api";

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), newPassword);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop" onClick={handleClose}>
          <motion.div
            className="modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <button className="modal-close-btn" onClick={handleClose}>
              <X size={18} />
            </button>

            {!submitted ? (
              <>
                <div className="modal-icon-badge">
                  <KeyRound size={24} color="#00ff87" />
                </div>
                <h3 className="modal-title">Reset Account Password</h3>
                <p className="modal-desc">
                  Enter your registered email and your new secure password to reset your credentials.
                </p>

                {error && (
                  <motion.div
                    className="modal-error-badge"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.35)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      marginBottom: "14px",
                      color: "#fca5a5",
                      fontSize: "12.5px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="input-field-wrapper" style={{ marginBottom: "12px" }}>
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="Registered email (e.g. name@company.com)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="custom-input"
                    />
                  </div>

                  <div className="input-field-wrapper" style={{ marginBottom: "12px", position: "relative" }}>
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="New password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="custom-input"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="input-field-wrapper" style={{ marginBottom: "14px" }}>
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="custom-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="primary-neon-btn"
                    disabled={loading}
                    style={{ width: "100%", marginTop: "12px" }}
                  >
                    {loading ? (
                      <span className="btn-spinner-text">
                        <span className="mini-spinner" /> Updating Credentials...
                      </span>
                    ) : (
                      <span className="btn-inner">
                        Update Password <ArrowRight size={16} />
                      </span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="modal-success-state" style={{ textAlign: "center", padding: "10px 0" }}>
                <CheckCircle2 size={46} color="#00ff87" style={{ margin: "0 auto 12px" }} />
                <h3 className="modal-title">Password Successfully Reset!</h3>
                <p className="modal-desc">
                  Your credentials for <strong style={{ color: "#00ff87" }}>{email}</strong> have been updated in the secure vault. You can now log in with your new password.
                </p>
                <button
                  type="button"
                  className="primary-neon-btn"
                  onClick={handleClose}
                  style={{ width: "100%", marginTop: "20px" }}
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
