"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "../Button";
import { useTranslations } from "../../contexts/LocaleContext";

export default function CancelConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  tournament,
  loading = false,
}) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations("tournament");
  const tCommon = useTranslations("common");

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
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
  }, [isOpen, loading, onClose]);

  if (!isOpen || !mounted) return null;

  const participantCount = tournament?.participants?.length || 0;
  const hasParticipants = participantCount > 0;

  const modalContent = (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={!loading ? onClose : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className={`relative max-w-md w-full transform transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-90 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning glow effect */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 blur-xl opacity-75" />

        {/* Card */}
        <div className="relative rounded-2xl border border-red-500/20 bg-gradient-to-b from-dark-card/95 to-dark-primary/95 p-6 backdrop-blur-xl shadow-2xl">
          {/* Warning Icon */}
          <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-pulse" />
            
            {/* Icon background */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/30">
              <span className="text-4xl">⚠️</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-center text-xl font-bold text-white">
            {t("cancelTournament") || "Cancel Tournament"}?
          </h2>

          {/* Tournament Name */}
          <p className="mb-4 text-center text-sm text-gray-400">
            <span className="font-medium text-white">{tournament?.title}</span>
          </p>

          {/* Warning Message */}
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg mt-0.5">ℹ️</span>
              <div className="space-y-2 text-sm">
                {hasParticipants ? (
                  <>
                    <p className="text-gray-300">
                      {t("cancelWarningWithParticipants") || 
                        `This action will cancel the tournament and refund entry fees to all ${participantCount} participant(s).`}
                    </p>
                    <div className="flex items-center gap-2 text-green-400">
                      <span>💰</span>
                      <span className="font-medium">
                        {participantCount} {t("participantsWillBeRefunded") || "participant(s) will be refunded"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-300">
                    {t("cancelWarningNoParticipants") || 
                      "This action will permanently cancel the tournament. No participants have joined yet."}
                  </p>
                )}
                <p className="text-red-400/80 text-xs mt-2">
                  {t("actionCannotBeUndone") || "This action cannot be undone."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              {tCommon("cancel") || "Go Back"}
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t("cancelling") || "Cancelling..."}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🗑️</span>
                  {t("confirmCancel") || "Yes, Cancel Tournament"}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
