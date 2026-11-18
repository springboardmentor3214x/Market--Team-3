import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function TiltCard({
  children,
  className = "",
  style = {},
  onClick,
  maxTilt = 10,
  glareColor = "rgba(0, 255, 135, 0.16)",
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Normalized mouse coordinates: -0.5 to 0.5
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Snappy yet smooth spring physics
  const springConfig = { damping: 20, stiffness: 300 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  // Map to true 3D rotation angles
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  // Spotlight glare coordinates in pixels
  const [glarePos, setGlarePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
    setGlarePos({ x: mouseX, y: mouseY });
  };

  const handleMouseEnter = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setGlarePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div className="ws-tilt-wrapper" style={{ perspective: "1000px" }}>
      <motion.div
        ref={cardRef}
        className={`ws-tilt-card ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
          ...style,
        }}
        whileHover={{
          y: -4,
          boxShadow: "0 16px 36px -8px rgba(0, 255, 135, 0.18), 0 0 20px rgba(0, 255, 135, 0.1)",
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Dynamic Interactive Cursor Spotlight Glare */}
        <div
          className="ws-card-spotlight"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle 260px at ${glarePos.x}px ${glarePos.y}px, ${glareColor}, transparent 75%)`,
            transition: isHovered ? "opacity 0.2s ease" : "opacity 0.4s ease",
          }}
        />

        {/* Card Content with 3D Depth */}
        <div className="ws-tilt-inner" style={{ transform: "translateZ(12px)", transformStyle: "preserve-3d" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
