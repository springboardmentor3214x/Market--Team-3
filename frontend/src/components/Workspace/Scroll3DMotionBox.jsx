import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";

/**
 * Scroll3DMotionBox
 * Premium scroll-driven 3D motion container inspired by Ballast 3D architecture:
 * Binds 3D perspective pitch (rotateX), physical z-depth translation (translateZ),
 * vertical parallax float (translateY), specular light sheen sweep, and reactive
 * holographic shadows directly to normalized scroll progress.
 */
export default function Scroll3DMotionBox({
  children,
  className = "",
  style = {},
  tag = "",
  glowColor = "#00ff87",
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

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

  // 3D Motion transforms:
  // - Entering from bottom (0 to 0.4): pitches forward (+14deg), pushed back in Z-depth (-60px), floats up (+35px)
  // - Centered in focus (0.45 to 0.55): perfectly level (0deg), lifted forward in Z-depth (+12px), scale 1.0
  // - Exiting to top (0.6 to 1.0): pitches backward (-12deg), recedes into Z-depth (-50px), floats upward (-30px)
  const rotateX = useTransform(
    smoothProgress,
    [0, 0.3, 0.5, 0.7, 1],
    [14, 5, 0, -5, -12]
  );

  const translateZ = useTransform(
    smoothProgress,
    [0, 0.35, 0.5, 0.7, 1],
    [-60, -10, 12, -10, -50]
  );

  const translateY = useTransform(
    smoothProgress,
    [0, 0.35, 0.5, 0.7, 1],
    [35, 10, 0, -10, -30]
  );

  const scale = useTransform(
    smoothProgress,
    [0, 0.3, 0.5, 0.7, 1],
    [0.94, 0.985, 1.0, 0.985, 0.95]
  );

  const opacity = useTransform(
    smoothProgress,
    [0, 0.15, 0.85, 1],
    [0.55, 1, 1, 0.75]
  );

  // Holographic Specular Light Sweep (Ballast-inspired chrome sheen)
  // Glides across the card surface from -100% to +180% as you scroll
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
      "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 32px rgba(0, 255, 135, 0.22), 0 0 2px rgba(0, 229, 255, 0.4)",
      "0 10px 30px rgba(0, 0, 0, 0.6), 0 0 12px rgba(0, 229, 255, 0.06)",
    ]
  );

  // 2. Mouse Parallax Tilt for Tactile Interactivity
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseXSpring = useSpring(mouseX, { stiffness: 200, damping: 22 });
  const mouseYSpring = useSpring(mouseY, { stiffness: 200, damping: 22 });
  const mouseRotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-5, 5]);
  const mouseTiltX = useTransform(mouseYSpring, [-0.5, 0.5], [4, -4]);

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
        perspective: "1100px",
        perspectiveOrigin: "50% 50%",
        transformStyle: "preserve-3d",
        marginBottom: "32px",
        position: "relative",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX: isHovered ? mouseTiltX : rotateX,
          rotateY: isHovered ? mouseRotateY : 0,
          translateZ,
          y: translateY,
          scale,
          opacity,
          boxShadow: dynamicBoxShadow,
          transformStyle: "preserve-3d",
          willChange: "transform, opacity, box-shadow",
          position: "relative",
          borderRadius: "16px",
          transition: isHovered
            ? "none"
            : "transform 0.1s ease-out, box-shadow 0.2s ease-out",
          ...style,
        }}
      >
        {/* Holographic Specular Glint Sweep (Chrome Reflection Simulation) */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "16px",
            pointerEvents: "none",
            overflow: "hidden",
            zIndex: 2,
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

        {/* 3D Cyber HUD Coordinate Tag */}
        {tag && (
          <div
            style={{
              position: "absolute",
              top: "-11px",
              right: "24px",
              zIndex: 12,
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
              transform: "translateZ(25px)",
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

        {/* Card Content with 3D depth */}
        <div style={{ transformStyle: "preserve-3d" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
