"use client";

import { useState, useRef, useEffect } from "react";

export default function Tooltip({ children, content, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = triggerRect.top - tooltipRect.height - 8;
      let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

      // If tooltip goes above viewport, show below
      if (top < 0) {
        top = triggerRect.bottom + 8;
      }

      // If tooltip goes off right edge
      if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width - 8;
      }

      // If tooltip goes off left edge
      if (left < 8) {
        left = 8;
      }

      setPosition({ top, left });
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          ref={tooltipRef}
          className="fixed z-[100] animate-fadeIn"
          style={{ top: position.top, left: position.left }}
        >
          <div className="rounded-xl border border-gold-dark/20 bg-dark-card p-3 shadow-2xl backdrop-blur-sm">
            {/* Subtle top gradient */}
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent" />
            
            {/* Content */}
            <div className="relative">{content}</div>
          </div>
        </div>
      )}
    </div>
  );
}
