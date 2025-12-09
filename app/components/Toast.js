"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { LuTriangleAlert, LuX } from "react-icons/lu";
import { HiCheckCircle, HiXCircle, HiInformationCircle } from "react-icons/hi2";

// Toast Context
const ToastContext = createContext(null);

// Toast types with their styles
const toastTypes = {
  success: {
    icon: HiCheckCircle,
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    progressColor: "bg-emerald-400",
  },
  error: {
    icon: HiXCircle,
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    iconColor: "text-red-400",
    progressColor: "bg-red-400",
  },
  warning: {
    icon: LuTriangleAlert,
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-400",
    progressColor: "bg-amber-400",
  },
  info: {
    icon: HiInformationCircle,
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
    progressColor: "bg-blue-400",
  },
};

// Individual Toast Component
function ToastItem({ id, message, type = "info", duration = 4000, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  const config = toastTypes[type] || toastTypes.info;
  const Icon = config.icon;

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Start progress bar animation
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    // Auto dismiss
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(id), 300);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border backdrop-blur-xl ${config.bgColor} ${config.borderColor} transform transition-all duration-300 ease-out ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"} shadow-lg shadow-black/20`}
    >
      <div className="flex items-start gap-3 p-4 pr-10">
        {/* Icon */}
        <div className={`mt-0.5 flex-shrink-0 ${config.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Message */}
        <p className="text-sm leading-relaxed font-medium text-white">
          {message}
        </p>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LuX className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-white/10">
        <div
          className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem {...toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}

// Toast Provider Component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    {
      success: (message, duration) => addToast(message, "success", duration),
      error: (message, duration) => addToast(message, "error", duration),
      warning: (message, duration) => addToast(message, "warning", duration),
      info: (message, duration) => addToast(message, "info", duration),
    },
    [addToast],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
