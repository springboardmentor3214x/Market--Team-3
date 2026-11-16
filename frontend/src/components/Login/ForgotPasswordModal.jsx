import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  };

  const handleReset = () => {
    setSubmitted(false);
    setEmail("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop" onClick={handleReset}>
          <motion.div
            className="modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <button className="modal-close-btn" onClick={handleReset}>
              <X size={18} />
            </button>

            {!submitted ? (
              <>
                <div className="modal-icon-badge">
                  <ShieldAlert size={24} color="#00ff87" />
                </div>
                <h3 className="modal-title">Reset Your Password</h3>
                <p className="modal-desc">
                  Enter your registered institutional or corporate email address.
                  We'll send an authenticated password reset link.
                </p>

                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="input-field-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="name@organization.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="custom-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="primary-neon-btn"
                    disabled={loading}
                    style={{ width: "100%", marginTop: "18px" }}
                  >
                    {loading ? (
                      <span className="btn-spinner-text">
                        <span className="mini-spinner" /> Dispatching Token...
                      </span>
                    ) : (
                      <span className="btn-inner">
                        Send Reset Link <ArrowRight size={16} />
                      </span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="modal-success-state">
                <CheckCircle2 size={44} color="#00ff87" style={{ marginBottom: "12px" }} />
                <h3 className="modal-title">Instructions Dispatched</h3>
                <p className="modal-desc">
                  A cryptographic reset token has been routed to{" "}
                  <strong style={{ color: "#00ff87" }}>{email}</strong>. Please check your inbox
                  and follow the instructions to set your new credentials.
                </p>
                <button
                  type="button"
                  className="primary-neon-btn"
                  onClick={handleReset}
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
