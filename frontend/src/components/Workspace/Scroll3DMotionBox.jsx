import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";

/**
 * Scroll3DMotionBox
 * Scroll-driven 3D motion animation container for dashboard cards:
 * Binds 3D perspective pitch (rotateX), depth translation (translateZ), scale,
 * and holographic lighting sweep directly to scroll progress as you navigate through
 * graphs, Data Quality Audit, Structured OHLCV, and Financial Statements.
 */
export default function Scroll3DMotionBox({
  children,
  className = "",
  style = {},
  tag = "",
  delay = 0,
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // 1. Scroll-driven 3D tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth spring physics for scroll progression
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  // 3D Transforms mapped to scroll progress (0 = entering bottom, 0.5 = centered, 1 = leaving top)
  const rotateX = useTransform(smoothProgress, [0, 0.25, 0.5, 0.75, 1], [9, 3, 0, -3, -8]);
  const translateZ = useTransform(smoothProgress, [0, 0.35, 0.5, 0.75, 1], [-40, -10, 0, -10, -35]);
  const scale = useTransform(smoothProgress, [0, 0.3, 0.5, 0.7, 1], [0.96, 0.99, 1.0, 0.99, 0.97]);
  const opacity = useTransform(smoothProgress, [0, 0.18, 0.85, 1], [0.65, 1, 1, 0.85]);

  // Dynamic 3D cybernetic box shadow on scroll
  const shadowGlow = useTransform(
    smoothProgress,
    [0.2, 0.5, 0.8],
    [
      "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 255, 135, 0.05)",
      "0 18px 45px rgba(0, 0, 0, 0.7), 0 0 24px rgba(0, 255, 135, 0.15)",
      "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 229, 255, 0.05)",
    ]
  );

  // 2. Mouse Parallax Tilt for Tactile Interactivity
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseXSpring = useSpring(mouseX, { stiffness: 220, damping: 20 });
  const mouseYSpring = useSpring(mouseY, { stiffness: 220, damping: 20 });
  const mouseRotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-4, 4]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      className={`scroll-3d-motion-wrapper ${className}`}
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
        marginBottom: "24px",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY: isHovered ? mouseRotateY : 0,
          translateZ,
          scale,
          opacity,
          boxShadow: shadowGlow,
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
          position: "relative",
          borderRadius: "16px",
          ...style,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Subtle 3D Tag Indicator (Ballast-inspired HUD coordinate) */}
        {tag && (
          <div
            style={{
              position: "absolute",
              top: "-10px",
              right: "24px",
              zIndex: 10,
              background: "rgba(5, 8, 14, 0.85)",
              border: "1px solid rgba(0, 255, 135, 0.3)",
              backdropFilter: "blur(10px)",
              padding: "2px 8px",
              borderRadius: "4px",
              fontFamily: "var(--ws-font-mono, monospace)",
              fontSize: "0.625rem",
              color: "#00ff87",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                width: "4px",
                height: "4px",
                background: "#00ff87",
                borderRadius: "50%",
                display: "inline-block",
                boxShadow: "0 0 6px #00ff87",
              }}
            />
            {tag}
          </div>
        )}

        {/* Children card content */}
        {children}
      </motion.div>
    </div>
  );
}
