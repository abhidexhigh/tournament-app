"use client";

import { useState } from "react";

/**
 * Reusable Tabs Component
 *
 * @param {Array} tabs - Array of tab objects with { id, label, content, badge }
 * @param {string} defaultTab - ID of the default active tab
 * @param {string} variant - Style variant: 'underline' | 'pill' | 'bordered' | 'divided'
 * @param {Function} onTabChange - Optional callback when tab changes
 */
export default function Tabs({
  tabs = [],
  defaultTab = null,
  variant = "underline",
  onTabChange = null,
  className = "",
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const getTabStyles = (isActive) => {
    const baseStyles =
      "px-4 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-medium transition-all duration-300 focus:outline-none";

    switch (variant) {
      case "underline":
        return `${baseStyles} ${
          isActive
            ? "text-gold border-b-2 border-gold"
            : "text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-600"
        }`;

      case "pill":
        return `${baseStyles} rounded-full ${
          isActive
            ? "bg-gold text-dark-primary"
            : "text-gray-400 hover:bg-dark-secondary hover:text-white"
        }`;

      case "bordered":
        return `${baseStyles} rounded-t-lg border-t-2 border-x-2 ${
          isActive
            ? "bg-dark-card border-gold text-gold"
            : "bg-dark-secondary/50 border-transparent text-gray-400 hover:text-white"
        }`;

      case "divided":
        return `${baseStyles} ${
          isActive
            ? "text-gold bg-dark-card/30"
            : "text-gray-400 hover:text-white hover:bg-dark-secondary/30"
        }`;

      default:
        return baseStyles;
    }
  };

  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className="scrollbar-hide relative overflow-x-auto border-b border-gray-700/50">
        <div
          className={`flex ${
            variant === "divided" ? "divide-x divide-gray-700/70" : "space-x-1"
          } min-w-max`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`${getTabStyles(
                activeTab === tab.id,
              )} flex cursor-pointer items-center space-x-2 whitespace-nowrap`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                    activeTab === tab.id
                      ? "bg-dark-primary text-gold"
                      : "bg-gold/20 text-gold"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            hidden={activeTab !== tab.id}
            className={`${activeTab === tab.id ? "animate-fadeIn" : ""}`}
          >
            {tab.content}
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
