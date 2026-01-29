"use client";

import { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import Image from "next/image";

// Summoning videos from public/summoningVideos folder (landscape)
const summoningVideos = [
  "/summoningVideos/Assassin_Armory_V9_Same_Angle.mp4",
  "/summoningVideos/Dwarf_Armory_V8.mp4",
  "/summoningVideos/Elemental_Dragon_Armory_V21.mp4",
  "/summoningVideos/Hellhound_Armory_V5.mp4",
  "/summoningVideos/Huntress_Armory_V8.mp4",
  "/summoningVideos/Hydra_Armory_V2_UI.mp4",
  "/summoningVideos/Magic_Archer_Armory_V10.mp4",
  "/summoningVideos/Minotaur_Armory_V7.mp4",
  "/summoningVideos/Ninetails Armory V5.mp4",
  "/summoningVideos/Nymph_Armory_V4_UI.mp4",
  "/summoningVideos/Orc_Armory_V5_SideDark_UI.mp4",
  "/summoningVideos/Reaper_Armory_V7_UI.mp4",
  "/summoningVideos/Samurai_Armory_V6_UI.mp4",
  "/summoningVideos/Succubus_Armory_V2_UI.mp4",
  "/summoningVideos/Titan_Armory_V11_UI.mp4",
  "/summoningVideos/Valkyrie Armory V6.mp4",
  "/summoningVideos/Vampire_Armory_V4.mp4",
  "/summoningVideos/Eastern_Dragon_Armory_V7_UI.mp4",
];

// Local video files from public/cardVideos folder (133 files)
const localVideoCards = [
  "/cardVideos/Amazon Dark Loop N.mp4",
  "/cardVideos/Amazon Fire Loop N.mp4",
  "/cardVideos/Amazon Light Loop N.mp4",
  "/cardVideos/Amazon Storm Loop N.mp4",
  "/cardVideos/Amazon Water Loop N.mp4",
  "/cardVideos/Assassin  Water loop.mp4",
  "/cardVideos/Assassin Dark Loop.mp4",
  "/cardVideos/Assassin Fire Loop.mp4",
  "/cardVideos/Assassin Light Loop.mp4",
  "/cardVideos/Assassin Storm Loop.mp4",
  "/cardVideos/Bone Dragon Dark Loop.mp4",
  "/cardVideos/Bone Dragon Light Loop.mp4",
  "/cardVideos/Bone Dragon Storm Loop.mp4",
  "/cardVideos/Bone Dragon Water Loop.mp4",
  "/cardVideos/BoneDragon Fire Loop New N.mp4",
  "/cardVideos/Cannon Fire Loop.mp4",
  "/cardVideos/Cannon Light loop.mp4",
  "/cardVideos/Cannon Storm Loop.mp4",
  "/cardVideos/Dwarf Cannon Dark Loop New N.mp4",
  "/cardVideos/Dwarf Dark Loop N.mp4",
  "/cardVideos/Dwarf Fire Loop N.mp4",
  "/cardVideos/Dwarf Light Loop N.mp4",
  "/cardVideos/Dwarf Storm Loop N.mp4",
  "/cardVideos/Dwarf Water Loop.mp4",
  "/cardVideos/Elemental Dragon Dark Loop N.mp4",
  "/cardVideos/Elemental Dragon Fire N.mp4",
  "/cardVideos/Elemental Dragon Light Loop N.mp4",
  "/cardVideos/Elemental Dragon Storm Loop N.mp4",
  "/cardVideos/Elemental Dragon Water Loop N.mp4",
  "/cardVideos/Fairy Dragon Dark Loop N.mp4",
  "/cardVideos/Harpy Dark Loop New N.mp4",
  "/cardVideos/Harpy Fire Loop New N.mp4",
  "/cardVideos/Harpy Light Loop.mp4",
  "/cardVideos/Harpy Storm Loop.mp4",
  "/cardVideos/Harpy Water Loop New N.mp4",
  "/cardVideos/Hellhound Dark Loop.mp4",
  "/cardVideos/Hellhound Fire Loop.mp4",
  "/cardVideos/Hellhound storm loop.mp4",
  "/cardVideos/Hellhound water loop.mp4",
  "/cardVideos/Huntress Dark Loop.mp4",
  "/cardVideos/Huntress Fire Loop N.mp4",
  "/cardVideos/Huntress Water Loop.mp4",
  "/cardVideos/Huntress storm Loop.mp4",
  "/cardVideos/huntress Light Loop.mp4",
  "/cardVideos/Hydra Dark Loop New N.mp4",
  "/cardVideos/Hydra Fire Loop New N.mp4",
  "/cardVideos/Hydra Light Loop New N.mp4",
  "/cardVideos/Hydra Storm Loop New N.mp4",
  "/cardVideos/Hydra Water Loop New N.mp4",
  "/cardVideos/Kiran Light Loop.mp4",
  "/cardVideos/Kirin Dark Loop.mp4",
  "/cardVideos/Kirin Fire Loop N.mp4",
  "/cardVideos/Kirin Storm Loop.mp4",
  "/cardVideos/Kirin Water Loop.mp4",
  "/cardVideos/Magicarcher Dark Loop.mp4",
  "/cardVideos/Magicarcher Fire Loop.mp4",
  "/cardVideos/Magicarcher Light Loop.mp4",
  "/cardVideos/Magicarcher Storm Loop.mp4",
  "/cardVideos/Magicarcher Water Loop.mp4",
  "/cardVideos/Medusa Loop Dark.mp4",
  "/cardVideos/Medusa Storm Loop.mp4",
  "/cardVideos/Medusa Water Loop.mp4",
  "/cardVideos/Medusafire Loop.mp4",
  "/cardVideos/Minotaur Fire Loop.mp4",
  "/cardVideos/Minotaur Light Loop N.mp4",
  "/cardVideos/Minotaur Loop Dark.mp4",
  "/cardVideos/Minotaur Loop Storm.mp4",
  "/cardVideos/Minotaur Water Loop.mp4",
  "/cardVideos/Ninetails Dark Loop.mp4",
  "/cardVideos/Ninetails Fire Loop.mp4",
  "/cardVideos/Ninetails Light Loop.mp4",
  "/cardVideos/Ninetails Loop Storm.mp4",
  "/cardVideos/Ninetails Water Loop.mp4",
  "/cardVideos/Nymph Dark Loop.mp4",
  "/cardVideos/Nymph Fire Loop.mp4",
  "/cardVideos/Nymph Light Loop N.mp4",
  "/cardVideos/Nymph Storm Loop.mp4",
  "/cardVideos/Nymph Water Loop.mp4",
  "/cardVideos/Orc Dark Loop.mp4",
  "/cardVideos/Orc Fire Loop.mp4",
  "/cardVideos/Orc Light Loop N.mp4",
  "/cardVideos/Orc Storm Loop.mp4",
  "/cardVideos/Orc Water Loop.mp4",
  "/cardVideos/Phoenix Dark Loop N.mp4",
  "/cardVideos/Phoenix Fire Loop N.mp4",
  "/cardVideos/Phoenix Light Loop N.mp4",
  "/cardVideos/Phoenix Storm Loop N.mp4",
  "/cardVideos/Phoenix Water Loop N.mp4",
  "/cardVideos/Priest Dark Loop N.mp4",
  "/cardVideos/Priest Fire Loop New N.mp4",
  "/cardVideos/Priest Light Loop N.mp4",
  "/cardVideos/Priest Storm New N.mp4",
  "/cardVideos/Priest Water Loop N.mp4",
  "/cardVideos/Reaper Dark Loop New N.mp4",
  "/cardVideos/Reaper Fire Loop.mp4",
  "/cardVideos/Reaper Light Loop New N.mp4",
  "/cardVideos/Reaper Loop New N.mp4",
  "/cardVideos/Reaper Storm Loop New N.mp4",
  "/cardVideos/Samurai Dark Loop New N.mp4",
  "/cardVideos/Samurai Fire Loop New N.mp4",
  "/cardVideos/Samurai Light Loop New N.mp4",
  "/cardVideos/Samurai Water Loop New N.mp4",
  "/cardVideos/Samurai storm loop new N.mp4",
  "/cardVideos/Valkyrie Dark Loop.mp4",
  "/cardVideos/Valkyrie Fire Loop New N.mp4",
  "/cardVideos/Valkyrie Light Loop.mp4",
  "/cardVideos/Valkyrie Water Loop New N.mp4",
  "/cardVideos/valkyrie Storm Loop.mp4",
  "/cardVideos/Vampire Dark Loop.mp4",
  "/cardVideos/Vampire Fire Loop New N.mp4",
  "/cardVideos/Vampire Light Loop.mp4",
  "/cardVideos/Vampire Storm Loop New N.mp4",
  "/cardVideos/Vampire Water Loop New N.mp4",
  "/cardVideos/Warrior Dark Loop New N.mp4",
  "/cardVideos/Warrior Fire New Loop N.mp4",
  "/cardVideos/Warrior Storm Loop New N.mp4",
  "/cardVideos/Warrior water Loop.mp4",
  "/cardVideos/warrior Light Loop.mp4",
  "/cardVideos/WereWolf Light Loop.mp4",
  "/cardVideos/Werewolf Dark loop.mp4",
  "/cardVideos/Werewolf Water Loop.mp4",
  "/cardVideos/Werewolf storm loop.mp4",
  "/cardVideos/werewolf fire loop.mp4",
  "/cardVideos/Witch Dark Loop.mp4",
  "/cardVideos/Witch Fire Loop.mp4",
  "/cardVideos/Witch Light Loop New N.mp4",
  "/cardVideos/Witch Storm Loop.mp4",
  "/cardVideos/Witch Water Loop N.mp4",
  "/cardVideos/Wizard Dark Loop New N.mp4",
  "/cardVideos/Wizard Fire Loop N.mp4",
  "/cardVideos/Wizard Light Loop.mp4",
  "/cardVideos/Wizard Storm Loop N.mp4",
  "/cardVideos/Wizard Water Loop N.mp4",
];

// Helper to get responsive cards per row based on screen width
const getResponsiveCardsPerRow = () => {
  if (typeof window === "undefined") return 2; // Default to mobile for SSR
  const width = window.innerWidth;
  if (width < 640) return 2; // Mobile
  if (width < 768) return 3; // Small tablet
  if (width < 1024) return 4; // Tablet
  if (width < 1280) return 5; // Small desktop
  return 6; // Large desktop
};

// Debounce helper
const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

// Extract character name from URL (moved outside for memoization)
const getCharacterName = (url) => {
  const fileName = url.split("/").pop().split(".")[0];
  return fileName
    .replace(/_/g, " ")
    .replace(/loop/gi, "")
    .replace(/Loop/gi, "")
    .trim();
};

// Extract element type from URL (moved outside for memoization)
const getElementType = (url) => {
  const fileName = url.split("/").pop().toLowerCase();
  if (fileName.includes("fire")) return "Fire";
  if (fileName.includes("water")) return "Water";
  if (fileName.includes("dark")) return "Dark";
  if (fileName.includes("light")) return "Light";
  if (fileName.includes("storm")) return "Storm";
  return "Unknown";
};

// Element color map
const elementColors = {
  Fire: "#ef4444",
  Water: "#3b82f6",
  Dark: "#6b21a8",
  Light: "#fbbf24",
  Storm: "#06b6d4",
  Unknown: "#6b7280",
};

// Element icon URLs
const elementIcons = {
  Fire: "https://res.cloudinary.com/dg0cmj6su/image/upload/v1743504338/FinalImages/Forces/bx928te0w5qw5fzfn7yv.webp",
  Water:
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1743504339/FinalImages/Forces/vcrrx6plueox6miuyyya.webp",
  Dark: "https://res.cloudinary.com/dg0cmj6su/image/upload/v1743504340/FinalImages/Forces/ozzmnqlajfl4u6eb4jzo.webp",
  Light:
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1743504339/FinalImages/Forces/eyfe8cherbin7yhenlim.webp",
  Storm:
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1743504340/FinalImages/Forces/mrrqr2npwzgvf2wbcyl4.webp",
};

// Memoized Video Card Component with Intersection Observer for lazy loading
const VideoCard = memo(function VideoCard({
  url,
  index,
  cardHeight,
  computedCardWidth,
  layoutMode,
  useGoldFrame,
  videoPadding,
  borderRadius,
  cardBgColor,
  showBorder,
  borderWidth,
  borderColor,
  objectFit,
  autoPlay,
  muted,
  loop,
  showControls,
  playOnHover,
  showOverlay,
  overlayOpacity,
  showTitle,
  showElementIcon,
  goldFrameUrl,
}) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        // Pause video when not visible to save resources
        if (videoRef.current) {
          if (entry.isIntersecting && autoPlay && !playOnHover) {
            videoRef.current.play().catch(() => {});
          } else if (!entry.isIntersecting) {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.1, rootMargin: "50px" },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [autoPlay, playOnHover]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (playOnHover && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [playOnHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (playOnHover && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [playOnHover]);

  const characterName = useMemo(() => getCharacterName(url), [url]);
  const elementType = useMemo(() => getElementType(url), [url]);

  return (
    <div
      ref={cardRef}
      className="relative transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl"
      style={{
        width: layoutMode === "grid" ? "100%" : `${computedCardWidth}px`,
        height: `${cardHeight}px`,
        backgroundColor: "transparent",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Container */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: useGoldFrame ? `${videoPadding}px` : 0,
          left: useGoldFrame ? `${videoPadding}px` : 0,
          right: useGoldFrame ? `${videoPadding}px` : 0,
          bottom: useGoldFrame ? `${videoPadding}px` : 0,
          borderRadius: `${borderRadius}px`,
          backgroundColor: cardBgColor,
          border:
            !useGoldFrame && showBorder
              ? `${borderWidth}px solid ${borderColor}`
              : "none",
          boxShadow:
            !useGoldFrame && isHovered
              ? `0 0 20px ${borderColor}40`
              : !useGoldFrame
                ? "0 4px 6px rgba(0, 0, 0, 0.3)"
                : "none",
        }}
      >
        {/* Only render video when visible or nearby */}
        {isVisible && (
          <video
            ref={videoRef}
            src={url}
            className="h-full w-full"
            style={{ objectFit }}
            autoPlay={autoPlay && !playOnHover}
            muted={muted}
            loop={loop}
            controls={showControls}
            playsInline
            preload="metadata"
          />
        )}
        {/* Placeholder when not visible */}
        {!isVisible && (
          <div className="flex h-full w-full items-center justify-center bg-gray-800">
            <span className="text-2xl">🎬</span>
          </div>
        )}

        {/* Gradient Overlay */}
        {showOverlay && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(to top, rgba(0,0,0,${overlayOpacity}) 0%, transparent 50%)`,
            }}
          />
        )}
      </div>

      {/* Gold Frame Overlay */}
      {useGoldFrame && (
        <Image
          src={goldFrameUrl}
          alt=""
          width={100}
          height={100}
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          style={{ objectFit: "fill" }}
          loading="lazy"
        />
      )}

      {/* Title */}
      {showTitle && (
        <div
          className="absolute right-0 bottom-0 left-0 z-20 p-2 text-white sm:p-3"
          style={{
            paddingBottom: useGoldFrame ? `${videoPadding + 8}px` : "8px",
            paddingLeft: useGoldFrame ? `${videoPadding + 6}px` : "8px",
            paddingRight: useGoldFrame ? `${videoPadding + 6}px` : "8px",
          }}
        >
          <p className="truncate text-xs font-bold drop-shadow-lg sm:text-sm">
            {characterName}
          </p>
        </div>
      )}

      {/* Element Icon Badge */}
      {showElementIcon && elementIcons[elementType] && (
        <div
          className="absolute z-20"
          style={{
            top: useGoldFrame ? `${videoPadding + 6}px` : "6px",
            right: useGoldFrame ? `${videoPadding + 6}px` : "6px",
          }}
        >
          <Image
            src={elementIcons[elementType]}
            alt={elementType}
            width={32}
            height={32}
            className="h-6 w-6 drop-shadow-lg sm:h-8 sm:w-8"
            style={{ objectFit: "contain" }}
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
});

// Control Panel Section Component (moved outside to prevent re-creation)
const ControlSection = memo(function ControlSection({ title, children }) {
  return (
    <div className="space-y-2 rounded-lg bg-gray-800/50 p-3 sm:space-y-3 sm:p-4">
      <h3 className="text-xs font-semibold tracking-wide text-purple-400 uppercase sm:text-sm">
        {title}
      </h3>
      {children}
    </div>
  );
});

// Range Slider Component (moved outside to prevent re-creation)
const RangeControl = memo(function RangeControl({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="font-mono text-purple-400">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-purple-500"
      />
    </div>
  );
});

// Toggle Switch Component (moved outside to prevent re-creation)
const ToggleControl = memo(function ToggleControl({
  label,
  checked,
  onChange,
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`h-5 w-10 rounded-full transition-colors ${
            checked ? "bg-purple-500" : "bg-gray-600"
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
              checked ? "translate-x-5" : ""
            }`}
          />
        </div>
      </div>
    </label>
  );
});

export default function TestVideoCards() {
  // Tab state - "characters" or "summoning"
  const [activeTab, setActiveTab] = useState("characters");

  // Control states - use consistent initial value for SSR, update on mount
  const [cardsPerRow, setCardsPerRow] = useState(2); // Start with mobile default for SSR consistency
  const [hasManuallySetCards, setHasManuallySetCards] = useState(false); // Track if user manually changed cards per row
  const [isMounted, setIsMounted] = useState(false); // Track if component has mounted
  const [cardWidth, setCardWidth] = useState(280);
  const [cardHeight, setCardHeight] = useState(280); // Square by default
  const [gap, setGap] = useState(12);
  const [borderRadius, setBorderRadius] = useState(16);
  const [autoPlay, setAutoPlay] = useState(true);
  const [muted, setMuted] = useState(true);
  const [loop, setLoop] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [objectFit, setObjectFit] = useState("cover");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#0a0a0f");
  const [cardBgColor, setCardBgColor] = useState("#1a1a24");
  const [showBorder, setShowBorder] = useState(true);
  const [borderColor, setBorderColor] = useState("#d3af37");
  const [borderWidth, setBorderWidth] = useState(2);
  const [playOnHover, setPlayOnHover] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);
  const [showTitle, setShowTitle] = useState(true);
  const [showElementIcon, setShowElementIcon] = useState(true);
  const [maxVideos, setMaxVideos] = useState(30); // Start with fewer for performance
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [layoutMode, setLayoutMode] = useState("grid"); // grid or flex
  const [useGoldFrame, setUseGoldFrame] = useState(true);
  const [videoPadding, setVideoPadding] = useState(4); // padding for video inside frame
  const [isControlsOpen, setIsControlsOpen] = useState(false); // controls panel visibility (closed by default for mobile)
  const [autoFitWidth, setAutoFitWidth] = useState(true); // auto-adjust card width to fit viewport
  const [containerWidth, setContainerWidth] = useState(0); // track container width

  // Set mounted state and responsive cards per row on mount
  useEffect(() => {
    setIsMounted(true);
    // Set initial responsive value after mount (avoids hydration mismatch)
    if (!hasManuallySetCards) {
      setCardsPerRow(getResponsiveCardsPerRow());
    }
  }, []);

  // Handle resize for responsive cards per row (only if user hasn't manually changed it)
  useEffect(() => {
    if (!isMounted) return;

    const updateCardsPerRow = debounce(() => {
      if (!hasManuallySetCards) {
        setCardsPerRow(getResponsiveCardsPerRow());
      }
    }, 150);

    // Listen for resize
    window.addEventListener("resize", updateCardsPerRow);
    return () => window.removeEventListener("resize", updateCardsPerRow);
  }, [hasManuallySetCards, isMounted]);

  // Gold frame image URL
  const goldFrameUrl =
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1748253002/gold_frame_for_showing_the_character_in_list_bopqoh.webp";

  // Ref for grid container to measure width
  const gridContainerRef = useRef(null);

  // Calculate auto-fit card width (debounced for performance)
  const calculateAutoFitWidth = useCallback(() => {
    if (gridContainerRef.current) {
      const containerW = gridContainerRef.current.offsetWidth - 48; // minus padding (24px * 2)
      setContainerWidth(containerW);
    }
  }, []);

  // Track container width for auto-fit
  useEffect(() => {
    calculateAutoFitWidth();
    const debouncedCalculate = debounce(calculateAutoFitWidth, 100);
    window.addEventListener("resize", debouncedCalculate);
    return () => window.removeEventListener("resize", debouncedCalculate);
  }, [calculateAutoFitWidth]);

  // Computed card width (auto or manual)
  const computedCardWidth =
    autoFitWidth && containerWidth > 0
      ? Math.floor((containerWidth - gap * (cardsPerRow - 1)) / cardsPerRow)
      : cardWidth;

  // Get current video source based on active tab
  const currentVideoSource =
    activeTab === "characters" ? localVideoCards : summoningVideos;

  // Filter videos (memoized)
  const filteredVideos = currentVideoSource
    .filter((url) => {
      if (activeTab === "summoning") return true; // No element filter for summoning
      if (filterType === "all") return true;
      return getElementType(url).toLowerCase() === filterType.toLowerCase();
    })
    .filter((url) => {
      if (!searchQuery) return true;
      return getCharacterName(url)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    })
    .slice(0, activeTab === "summoning" ? summoningVideos.length : maxVideos);

  // Aspect ratio presets
  const aspectRatios = {
    custom: null,
    "9:16": 9 / 16,
    "3:4": 3 / 4,
    "1:1": 1,
    "4:3": 4 / 3,
    "16:9": 16 / 9,
  };

  // Apply aspect ratio - use computedCardWidth when autoFitWidth is enabled
  useEffect(() => {
    if (aspectRatio !== "custom" && aspectRatios[aspectRatio]) {
      const widthToUse = autoFitWidth ? computedCardWidth : cardWidth;
      if (widthToUse > 0) {
        setCardHeight(Math.round(widthToUse / aspectRatios[aspectRatio]));
      }
    }
  }, [aspectRatio, cardWidth, autoFitWidth, computedCardWidth]);

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor }}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
        <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
          {/* Tab Switcher */}
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => {
                setActiveTab("characters");
                // Reset to square aspect ratio for character cards
                setAspectRatio("1:1");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "characters"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              🃏 Character Cards
            </button>
            <button
              onClick={() => {
                setActiveTab("summoning");
                // Switch to landscape aspect ratio for summoning videos
                setAspectRatio("16:9");
                setCardsPerRow(2);
                setHasManuallySetCards(true);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "summoning"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              ✨ Summoning Videos
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-white sm:text-2xl">
                  {activeTab === "characters"
                    ? "Character Cards"
                    : "Summoning Videos"}
                </h1>
                <p className="text-xs text-gray-400 sm:text-sm">
                  Showing {filteredVideos.length} of {currentVideoSource.length}{" "}
                  {activeTab === "characters"
                    ? "characters"
                    : "summoning animations"}
                </p>
              </div>
              {/* Mobile Controls Toggle */}
              <button
                onClick={() => setIsControlsOpen(!isControlsOpen)}
                className="border-gold-dark/30 flex h-10 w-10 items-center justify-center rounded-lg border bg-black/30 text-white sm:hidden"
              >
                <span className="text-lg">⚙️</span>
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gold-dark/30 focus:border-gold min-w-0 flex-1 rounded-lg border bg-black/30 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none sm:w-64 sm:flex-none sm:px-4 sm:text-base"
              />
              {activeTab === "characters" && (
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border-gold-dark/30 focus:border-gold rounded-lg border bg-black/30 px-2 py-2 text-sm text-white focus:outline-none sm:px-4 sm:text-base"
                >
                  <option value="all">All</option>
                  <option value="fire">🔥 Fire</option>
                  <option value="water">💧 Water</option>
                  <option value="dark">🌑 Dark</option>
                  <option value="light">✨ Light</option>
                  <option value="storm">⚡ Storm</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Toggle Button - Desktop Only */}
        <button
          onClick={() => setIsControlsOpen(!isControlsOpen)}
          className={`fixed top-24 z-[60] hidden h-12 w-12 items-center justify-center rounded-r-lg bg-purple-600 text-white shadow-lg transition-all duration-300 hover:bg-purple-500 sm:flex ${
            isControlsOpen ? "left-72 sm:left-80" : "left-0"
          }`}
          title={isControlsOpen ? "Hide Controls" : "Show Controls"}
        >
          <span className="text-xl">{isControlsOpen ? "◀" : "▶"}</span>
        </button>

        {/* Control Panel - Floating Sidebar */}
        <div
          className={`fixed top-[105px] left-0 z-50 h-[calc(100vh-105px)] w-72 space-y-3 overflow-y-auto border-r border-gray-800 bg-gray-900/95 p-3 backdrop-blur-sm transition-transform duration-300 sm:top-[73px] sm:h-[calc(100vh-73px)] sm:w-80 sm:space-y-4 sm:p-4 ${
            isControlsOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white sm:text-xl">
              ⚙️ Controls
            </h2>
            <button
              onClick={() => setIsControlsOpen(false)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Layout Controls */}
          <ControlSection title="📐 Layout">
            <div className="space-y-1">
              <span className="text-sm text-gray-300">Layout Mode</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setLayoutMode("grid")}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    layoutMode === "grid"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setLayoutMode("flex")}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    layoutMode === "flex"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Flex
                </button>
              </div>
            </div>
            <RangeControl
              label="Cards Per Row"
              value={cardsPerRow}
              onChange={(val) => {
                setCardsPerRow(val);
                setHasManuallySetCards(true);
              }}
              min={1}
              max={8}
            />
            <ToggleControl
              label="Auto-Fit Width"
              checked={autoFitWidth}
              onChange={setAutoFitWidth}
            />
            {autoFitWidth && (
              <div className="rounded-lg bg-green-500/10 p-2 text-xs text-green-400">
                📐 Card width: {computedCardWidth}px (auto-calculated to fit{" "}
                {cardsPerRow} cards)
              </div>
            )}
            <RangeControl
              label="Gap"
              value={gap}
              onChange={setGap}
              min={0}
              max={48}
              unit="px"
            />
            {activeTab === "characters" && (
              <RangeControl
                label="Max Videos"
                value={maxVideos}
                onChange={setMaxVideos}
                min={1}
                max={localVideoCards.length}
              />
            )}
          </ControlSection>

          {/* Size Controls */}
          <ControlSection title="📏 Card Size">
            <div className="space-y-1">
              <span className="text-sm text-gray-300">Aspect Ratio</span>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="custom">Custom</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="3:4">3:4 (Portrait)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="4:3">4:3 (Landscape)</option>
                <option value="16:9">16:9 (Widescreen)</option>
              </select>
            </div>
            <div className={autoFitWidth ? "opacity-50" : ""}>
              <RangeControl
                label={autoFitWidth ? "Card Width (Auto)" : "Card Width"}
                value={autoFitWidth ? computedCardWidth : cardWidth}
                onChange={setCardWidth}
                min={150}
                max={500}
                unit="px"
              />
            </div>
            {autoFitWidth && (
              <div className="text-xs text-gray-500">
                ℹ️ Width is auto-calculated. Disable &quot;Auto-Fit Width&quot;
                to set manually.
              </div>
            )}
            <RangeControl
              label="Card Height"
              value={cardHeight}
              onChange={setCardHeight}
              min={150}
              max={700}
              unit="px"
            />
            <RangeControl
              label="Border Radius"
              value={borderRadius}
              onChange={setBorderRadius}
              min={0}
              max={50}
              unit="px"
            />
          </ControlSection>

          {/* Video Controls */}
          <ControlSection title="🎬 Video Playback">
            <ToggleControl
              label="Auto Play"
              checked={autoPlay}
              onChange={setAutoPlay}
            />
            <ToggleControl label="Muted" checked={muted} onChange={setMuted} />
            <ToggleControl label="Loop" checked={loop} onChange={setLoop} />
            <ToggleControl
              label="Show Video Controls"
              checked={showControls}
              onChange={setShowControls}
            />
            <ToggleControl
              label="Play on Hover Only"
              checked={playOnHover}
              onChange={(val) => {
                setPlayOnHover(val);
                if (val) setAutoPlay(false);
              }}
            />
            <div className="space-y-1">
              <span className="text-sm text-gray-300">Object Fit</span>
              <select
                value={objectFit}
                onChange={(e) => setObjectFit(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
                <option value="none">None</option>
              </select>
            </div>
          </ControlSection>

          {/* Style Controls */}
          <ControlSection title="🎨 Styling">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-gray-300">Background</span>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-8 w-full cursor-pointer rounded"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-300">Card BG</span>
                <input
                  type="color"
                  value={cardBgColor}
                  onChange={(e) => setCardBgColor(e.target.value)}
                  className="h-8 w-full cursor-pointer rounded"
                />
              </div>
            </div>
            <ToggleControl
              label="Show Border"
              checked={showBorder}
              onChange={setShowBorder}
            />
            {showBorder && !useGoldFrame && (
              <>
                <div className="space-y-1">
                  <span className="text-xs text-gray-300">Border Color</span>
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="h-8 w-full cursor-pointer rounded"
                  />
                </div>
                <RangeControl
                  label="Border Width"
                  value={borderWidth}
                  onChange={setBorderWidth}
                  min={1}
                  max={8}
                  unit="px"
                />
              </>
            )}
          </ControlSection>

          {/* Gold Frame Controls - Only for Character Cards */}
          {activeTab === "characters" && (
            <ControlSection title="🖼️ Gold Frame">
              <ToggleControl
                label="Use Gold Frame"
                checked={useGoldFrame}
                onChange={setUseGoldFrame}
              />
              {useGoldFrame && (
                <RangeControl
                  label="Video Padding"
                  value={videoPadding}
                  onChange={setVideoPadding}
                  min={0}
                  max={30}
                  unit="px"
                />
              )}
              {useGoldFrame && (
                <div className="rounded-lg bg-amber-500/10 p-2 text-xs text-amber-400">
                  💡 Video padding controls how far the video sits inside the
                  frame
                </div>
              )}
            </ControlSection>
          )}

          {/* Overlay Controls */}
          <ControlSection title="✨ Overlay & Title">
            <ToggleControl
              label="Show Overlay"
              checked={showOverlay}
              onChange={setShowOverlay}
            />
            {showOverlay && (
              <RangeControl
                label="Overlay Opacity"
                value={overlayOpacity}
                onChange={setOverlayOpacity}
                min={0}
                max={1}
                step={0.1}
              />
            )}
            <ToggleControl
              label="Show Title"
              checked={showTitle}
              onChange={setShowTitle}
            />
            {activeTab === "characters" && (
              <ToggleControl
                label="Show Element Icon"
                checked={showElementIcon}
                onChange={setShowElementIcon}
              />
            )}
          </ControlSection>

          {/* Reset Button */}
          <button
            onClick={() => {
              setHasManuallySetCards(false); // Reset manual flag to enable responsive behavior
              setCardsPerRow(getResponsiveCardsPerRow());
              setCardWidth(280);
              setCardHeight(280);
              setGap(12);
              setBorderRadius(16);
              setAutoPlay(true);
              setMuted(true);
              setLoop(true);
              setShowControls(false);
              setObjectFit("cover");
              setFilterType("all");
              setSearchQuery("");
              setBackgroundColor("#0a0a0f");
              setCardBgColor("#1a1a24");
              setShowBorder(true);
              setBorderColor("#d3af37");
              setBorderWidth(2);
              setPlayOnHover(false);
              setShowOverlay(true);
              setOverlayOpacity(0.3);
              setShowTitle(true);
              setShowElementIcon(true);
              setMaxVideos(localVideoCards.length);
              setAspectRatio("1:1");
              setLayoutMode("grid");
              setUseGoldFrame(true);
              setVideoPadding(8);
              setAutoFitWidth(true);
            }}
            className="w-full rounded-lg bg-red-500/20 py-3 font-medium text-red-400 transition-colors hover:bg-red-500/30"
          >
            🔄 Reset All
          </button>

          {/* Export CSS */}
          <button
            onClick={() => {
              const css = `/* Video Card Styles */
.video-card {
  width: ${cardWidth}px;
  height: ${cardHeight}px;
  border-radius: ${borderRadius}px;
  background-color: ${cardBgColor};
  ${showBorder ? `border: ${borderWidth}px solid ${borderColor};` : ""}
  overflow: hidden;
}

.video-card video {
  width: 100%;
  height: 100%;
  object-fit: ${objectFit};
}

/* Grid Layout */
.video-grid {
  display: grid;
  grid-template-columns: repeat(${cardsPerRow}, 1fr);
  gap: ${gap}px;
}`;
              navigator.clipboard.writeText(css);
              alert("CSS copied to clipboard!");
            }}
            className="w-full rounded-lg bg-purple-500/20 py-3 font-medium text-purple-400 transition-colors hover:bg-purple-500/30"
          >
            📋 Copy CSS
          </button>
        </div>

        {/* Overlay when controls are open */}
        {isControlsOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsControlsOpen(false)}
          />
        )}

        {/* Video Grid - Full Width */}
        <div
          ref={gridContainerRef}
          className="max-w-main mx-auto w-full p-3 sm:p-4 md:p-6"
        >
          {filteredVideos.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-gray-400 sm:h-64">
              <div className="text-center">
                <p className="mb-2 text-4xl sm:mb-4 sm:text-5xl">🔍</p>
                <p className="text-lg sm:text-xl">No videos found</p>
                <p className="text-xs sm:text-sm">Try adjusting your filters</p>
              </div>
            </div>
          ) : layoutMode === "grid" ? (
            <div
              className="grid justify-center sm:justify-start"
              style={{
                gridTemplateColumns: `repeat(${cardsPerRow}, ${computedCardWidth}px)`,
                gap: `${gap}px`,
              }}
            >
              {filteredVideos.map((url, index) => (
                <VideoCard
                  key={url}
                  url={url}
                  index={index}
                  cardHeight={cardHeight}
                  computedCardWidth={computedCardWidth}
                  layoutMode={layoutMode}
                  useGoldFrame={
                    activeTab === "characters" ? useGoldFrame : false
                  }
                  videoPadding={videoPadding}
                  borderRadius={borderRadius}
                  cardBgColor={cardBgColor}
                  showBorder={showBorder}
                  borderWidth={borderWidth}
                  borderColor={borderColor}
                  objectFit={objectFit}
                  autoPlay={autoPlay}
                  muted={muted}
                  loop={loop}
                  showControls={showControls}
                  playOnHover={playOnHover}
                  showOverlay={showOverlay}
                  overlayOpacity={overlayOpacity}
                  showTitle={showTitle}
                  showElementIcon={
                    activeTab === "characters" ? showElementIcon : false
                  }
                  goldFrameUrl={goldFrameUrl}
                />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-wrap justify-center sm:justify-start"
              style={{
                gap: `${gap}px`,
              }}
            >
              {filteredVideos.map((url, index) => (
                <VideoCard
                  key={url}
                  url={url}
                  index={index}
                  cardHeight={cardHeight}
                  computedCardWidth={computedCardWidth}
                  layoutMode={layoutMode}
                  useGoldFrame={
                    activeTab === "characters" ? useGoldFrame : false
                  }
                  videoPadding={videoPadding}
                  borderRadius={borderRadius}
                  cardBgColor={cardBgColor}
                  showBorder={showBorder}
                  borderWidth={borderWidth}
                  borderColor={borderColor}
                  objectFit={objectFit}
                  autoPlay={autoPlay}
                  muted={muted}
                  loop={loop}
                  showControls={showControls}
                  playOnHover={playOnHover}
                  showOverlay={showOverlay}
                  overlayOpacity={overlayOpacity}
                  showTitle={showTitle}
                  showElementIcon={
                    activeTab === "characters" ? showElementIcon : false
                  }
                  goldFrameUrl={goldFrameUrl}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
