import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const handleSelect = (optValue) => {
    if (onChange) onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div className={`custom-select-container ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-select-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="custom-select-arrow"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      {/* Floating Glassmorphic Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="custom-select-dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            role="listbox"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  className={`custom-select-option ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="custom-select-option-text">
                    <span className="custom-select-option-label">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="custom-select-option-sublabel">{opt.sublabel}</span>
                    )}
                  </div>
                  {isSelected && (
                    <motion.span
                      className="custom-select-option-check"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check size={14} color="#00ff87" />
                    </motion.span>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
