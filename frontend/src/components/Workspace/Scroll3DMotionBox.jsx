import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

/**
 * Scroll3DMotionBox
 * Scroll-driven 3D motion container inspired by Ballast:
 * Binds 3D perspective pitch (rotateX), physical z-depth translation (translateZ),
 * vertical parallax float (translateY), specular sheen sweep, and reactive
 * holographic shadows directly to normalized scroll progress.
 *
 * NOTE: Mouse parallax has been decoupled from the interactive card body so that
 * buttons (1M, 3M, 6M period selectors, tabs, controls) remain 100% clickable,
 * stationary, and responsive under the user's cursor without subpixel jitter.
 */
export default function Scroll3DMotionBox({
  children,
  className = "",
  style = {},
  tag = "",
  glowColor = "#00ff87",
}) {
  const containerRef = useRef(null);

  // 1. Scroll-driven 3D progression relative to viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Inertial spring smoothing for fluid cinematic motion (pairs with Lenis smooth scroll)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 20,
    restDelta: 0.001,
  });

  // 3D Motion transforms bound strictly to scroll:
  // - Entering from bottom (0 to 0.35): pitches forward (+14deg), smooth float (+30px)
  // - Centered in focus (0.4 to 0.6): level (0deg), lifted slightly (+10px), scale 1.0
  // - Exiting to top (0.65 to 1.0): pitches backward (-12deg), smooth exit (-25px)
  const rotateX = useTransform(
    smoothProgress,
    [0, 0.3, 0.5, 0.7, 1],
    [12, 4, 0, -4, -10]
  );

  const translateZ = useTransform(
    smoothProgress,
    [0, 0.35, 0.5, 0.7, 1],
    [0, 6, 12, 6, 0]
  );

  const translateY = useTransform(
    smoothProgress,
    [0, 0.35, 0.5, 0.7, 1],
    [30, 8, 0, -8, -25]
  );

  const scale = useTransform(
    smoothProgress,
    [0, 0.3, 0.5, 0.7, 1],
    [0.95, 0.985, 1.0, 0.985, 0.96]
  );

  const opacity = useTransform(
    smoothProgress,
    [0, 0.15, 0.85, 1],
    [0.65, 1, 1, 0.8]
  );

  // Holographic Specular Light Sweep
  const sheenX = useTransform(
    smoothProgress,
    [0, 1],
    ["-120%", "180%"]
  );

  // Dynamic 3D cybernetic ambient elevation glow
  const dynamicBoxShadow = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [
      "0 10px 30px rgba(0, 0, 0, 0.6), 0 0 12px rgba(0, 255, 135, 0.06)",
      "0 20px 50px rgba(0, 0, 0, 0.75), 0 0 28px rgba(0, 255, 135, 0.2), 0 0 2px rgba(0, 229, 255, 0.35)",
      "0 10px 30px rgba(0, 0, 0, 0.6), 0 0 12px rgba(0, 229, 255, 0.06)",
    ]
  );

  return (
    <div
      ref={containerRef}
      className={`scroll-3d-motion-wrapper ${className}`}
      style={{
        perspective: "1100px",
        perspectiveOrigin: "50% 50%",
        marginBottom: "32px",
        position: "relative",
        zIndex: 5,
        pointerEvents: "auto",
      }}
    >
      <motion.div
        style={{
          rotateX,
          translateZ,
          y: translateY,
          scale,
          opacity,
          boxShadow: dynamicBoxShadow,
          transformStyle: "preserve-3d",
          willChange: "transform, opacity, box-shadow",
          position: "relative",
          borderRadius: "16px",
          pointerEvents: "auto",
          ...style,
        }}
      >
        {/* Holographic Specular Glint Sweep (Pointer Events Disabled) */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "16px",
            pointerEvents: "none",
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              top: "-50%",
              left: sheenX,
              width: "60%",
              height: "200%",
              background:
                "linear-gradient(115deg, transparent 20%, rgba(0, 255, 135, 0.12) 48%, rgba(0, 229, 255, 0.18) 52%, transparent 80%)",
              transform: "rotate(25deg)",
              pointerEvents: "none",
            }}
          />
        </motion.div>

        {/* 3D Cyber HUD Coordinate Tag (Pointer Events Disabled) */}
        {tag && (
          <div
            style={{
              position: "absolute",
              top: "-11px",
              right: "24px",
              zIndex: 3,
              background: "rgba(5, 8, 14, 0.92)",
              border: "1px solid rgba(0, 255, 135, 0.35)",
              backdropFilter: "blur(12px)",
              padding: "3px 10px",
              borderRadius: "4px",
              fontFamily: "var(--ws-font-mono, monospace)",
              fontSize: "0.625rem",
              color: "#00ff87",
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              pointerEvents: "none",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.6)",
              transform: "translateZ(15px)",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                background: "#00ff87",
                borderRadius: "50%",
                display: "inline-block",
                boxShadow: "0 0 8px #00ff87",
              }}
            />
            {tag}
          </div>
        )}

        {/* Interactive Card Content Container: Highest Z-Index & Clean Hit-Testing */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            pointerEvents: "auto",
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
