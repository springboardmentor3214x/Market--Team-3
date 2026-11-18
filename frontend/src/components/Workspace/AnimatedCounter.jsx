import React, { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

export default function AnimatedCounter({
  value,
  duration = 1.2,
  prefix = "",
  suffix = "",
  glowOnAnimate = true,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const [displayValue, setDisplayValue] = useState(0);
  const [isCounting, setIsCounting] = useState(false);

  const numericValue =
    typeof value === "number"
      ? value
      : parseFloat(String(value || "0").replace(/[^0-9.-]/g, "")) || 0;

  useEffect(() => {
    if (!isInView) {
      // Reset when scrolled far out of view so it re-animates smoothly when scrolled back
      return;
    }

    let animationFrameId;
    let startTime = null;
    const startVal = 0;
    const endVal = numericValue;

    setIsCounting(true);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth cubic ease-out curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startVal + (endVal - startVal) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
        setIsCounting(false);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, numericValue, duration]);

  return (
    <span
      ref={ref}
      className={`ws-animated-counter ${isCounting && glowOnAnimate ? "ws-counter-active" : ""}`}
      style={{
        display: "inline-block",
        transition: "text-shadow 0.3s ease, color 0.3s ease",
      }}
    >
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
