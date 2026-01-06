"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function SuccessModal({
  isOpen,
  onClose,
  title = "Success!",
  message = "Operation completed successfully",
  emoji = "🎉",
  buttonText = "Continue",
  autoClose = true,
  autoCloseDelay = 3000,
}) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState([]);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Generate confetti particles
  useEffect(() => {
    if (isOpen) {
      const newParticles = [];
      const colors = [
        "#FFD700", // Gold
        "#FFA500", // Orange
        "#FF6B6B", // Coral
        "#4ECDC4", // Teal
        "#9B59B6", // Purple
        "#3498DB", // Blue
        "#2ECC71", // Green
        "#F1C40F", // Yellow
      ];

      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 6 + Math.random() * 8,
          rotation: Math.random() * 360,
        });
      }
      setParticles(newParticles);

      // Trigger animation
      requestAnimationFrame(() => setIsVisible(true));

      // Auto close
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, autoClose, autoCloseDelay]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-confetti"
            style={{
              left: `${particle.left}%`,
              top: "-20px",
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          >
            <div
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                transform: `rotate(${particle.rotation}deg)`,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              }}
            />
          </div>
        ))}
      </div>

      {/* Modal Content */}
      <div
        className={`relative max-w-md w-full transform transition-all duration-500 ${
          isVisible ? "scale-100 translate-y-0" : "scale-90 translate-y-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-gold/30 via-yellow-500/30 to-orange-500/30 blur-xl opacity-75 animate-pulse" />

        {/* Card */}
        <div className="relative rounded-2xl border border-gold/20 bg-gradient-to-b from-dark-card/95 to-dark-primary/95 p-8 backdrop-blur-xl shadow-2xl shadow-gold/10">
          {/* Success Icon */}
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            {/* Animated rings */}
            <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-ping" />
            <div
              className="absolute inset-2 rounded-full border-2 border-gold/40 animate-ping"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="absolute inset-4 rounded-full border-2 border-gold/50 animate-ping"
              style={{ animationDelay: "0.4s" }}
            />

            {/* Icon background */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-yellow-500/10 border border-gold/30">
              <span className="text-5xl animate-bounce">{emoji}</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-3 text-center text-2xl font-bold text-white">
            <span className="bg-gradient-to-r from-gold via-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>

          {/* Message */}
          <p className="mb-8 text-center text-gray-300 leading-relaxed">
            {message}
          </p>

          {/* Button */}
          <button
            onClick={handleClose}
            className="w-full rounded-xl bg-gradient-to-r from-gold to-yellow-600 px-6 py-3.5 font-bold text-black shadow-lg shadow-gold/25 transition-all hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            {buttonText}
          </button>

          {/* Auto close indicator */}
          {autoClose && (
            <div className="mt-4 flex justify-center">
              <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-gold to-yellow-500 animate-shrink"
                  style={{
                    animationDuration: `${autoCloseDelay}ms`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Styles for animations */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        @keyframes shrink {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }
        .animate-shrink {
          animation: shrink linear forwards;
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}

