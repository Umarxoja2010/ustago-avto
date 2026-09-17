import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "light" | "dark" | "auto";
  iconOnly?: boolean;
  tagline?: string | boolean;
  className?: string;
}

export function BrandLogo({
  size = "md",
  theme = "auto",
  iconOnly = false,
  tagline,
  className,
}: BrandLogoProps) {
  // Dimensions based on size
  const iconSizeClasses = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-18 h-18",
  }[size];

  const titleSizeClasses = {
    sm: "text-base tracking-tight",
    md: "text-lg tracking-tight",
    lg: "text-2xl tracking-tight",
    xl: "text-3.5xl tracking-tight",
  }[size];

  const taglineSizeClasses = {
    sm: "text-[9.5px]",
    md: "text-[11px]",
    lg: "text-xs",
    xl: "text-sm",
  }[size];

  const ustaColor = {
    light: "text-[#071a32]",
    dark: "text-white",
    auto: "text-[#071a32] dark:text-white",
  }[theme];

  const goColor = {
    light: "text-[#16a34a]",
    dark: "text-[#22c55e]",
    auto: "text-[#16a34a] dark:text-[#22c55e]",
  }[theme];

  const avtoColor = {
    light: "text-[#16a34a]",
    dark: "text-[#22c55e]",
    auto: "text-[#16a34a] dark:text-[#22c55e]",
  }[theme];

  const taglineColor = {
    light: "text-[#071a32]/75",
    dark: "text-white/75",
    auto: "text-slate-600 dark:text-white/70",
  }[theme];

  const wrenchFill = {
    light: "#071A32",
    dark: "#FFFFFF",
    auto: "currentColor",
  }[theme];

  const circleStroke = {
    light: "#16A34A",
    dark: "#22C55E",
    auto: "#16A34A",
  }[theme];

  const displayTagline =
    typeof tagline === "string"
      ? tagline
      : tagline === true
        ? "Avtoservis bozorini raqamlashtiruvchi platforma"
        : undefined;

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Official UstaGo Avto Logo Emblem */}
      <div
        className={cn(
          "relative shrink-0 flex items-center justify-center",
          iconSizeClasses,
          theme === "auto" && "text-[#071a32] dark:text-white",
        )}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Green Speed Lines on Left */}
          <line
            x1="14"
            y1="28"
            x2="38"
            y2="28"
            stroke={circleStroke}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="41"
            x2="33"
            y2="41"
            stroke={circleStroke}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="54"
            x2="33"
            y2="54"
            stroke={circleStroke}
            strokeWidth="5.5"
            strokeLinecap="round"
          />

          {/* Green Circular Arc wrapping around the wrench head */}
          <path
            d="M 40 26 A 26 26 0 1 1 50 67"
            stroke={circleStroke}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />

          {/* Navy / Theme Wrench pointing diagonally top-right */}
          <g transform="translate(58, 39) rotate(45)">
            <path
              d="M -5.5,41 L -5.5,7 C -11.5,4 -14.5,-2 -14,-8 C -13.5,-14 -9.5,-19 -6.5,-20 L -3.5,-8 C -3.5,-6.5 -2.5,-5.5 -1,-5.5 L 1,-5.5 C 2.5,-5.5 3.5,-6.5 3.5,-8 L 6.5,-20 C 9.5,-19 13.5,-14 14,-8 C 14.5,-2 11.5,4 5.5,7 L 5.5,41 A 5.5 5.5 0 0 1 -5.5 41 Z"
              fill={wrenchFill}
            />
          </g>
        </svg>
      </div>

      {/* Typography: Usta (Navy) + Go (Green) + _avto (Green) */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className={cn("flex items-baseline font-sans", titleSizeClasses)}>
            <span className={cn("font-black italic tracking-tight", ustaColor)}>Usta</span>
            <span className={cn("font-black italic tracking-tight", goColor)}>Go</span>
            <span className={cn("font-bold italic tracking-tight text-[0.88em]", avtoColor)}>
              _avto
            </span>
          </div>
          {displayTagline && (
            <span
              className={cn("mt-1 font-medium leading-tight", taglineSizeClasses, taglineColor)}
            >
              {displayTagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
