"use client"

import { useState, useEffect } from 'react'

export function ResponsiveTest() {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [currentBreakpoint, setCurrentBreakpoint] = useState("unknown");

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({ width, height });

      // Determine current breakpoint based on Tailwind config
      if (width >= 1920) {
        setCurrentBreakpoint("3xl");
      } else if (width >= 1536) {
        setCurrentBreakpoint("2xl");
      } else if (width >= 1280) {
        setCurrentBreakpoint("xl");
      } else if (width >= 1024) {
        setCurrentBreakpoint("lg");
      } else if (width >= 768) {
        setCurrentBreakpoint("md");
      } else if (width >= 640) {
        setCurrentBreakpoint("sm");
      } else if (width >= 475) {
        setCurrentBreakpoint("xs");
      } else {
        setCurrentBreakpoint("base");
      }
    };

    updateScreenInfo();
    window.addEventListener("resize", updateScreenInfo);
    return () => window.removeEventListener("resize", updateScreenInfo);
  }, []);

  const getBreakpointColor = () => {
    const colors = {
      base: "bg-red-500",
      xs: "bg-orange-500",
      sm: "bg-yellow-500",
      md: "bg-green-500",
      lg: "bg-blue-500",
      xl: "bg-indigo-500",
      "2xl": "bg-purple-500",
      "3xl": "bg-pink-500",
    };
    return colors[currentBreakpoint as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg border">
      <h2 className="text-xl font-bold mb-4">Responsive Design Test</h2>

      <div className="grid gap-4">
        {/* Screen Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Screen Information</h3>
          <p className="text-sm">Width: {screenSize.width}px</p>
          <p className="text-sm">Height: {screenSize.height}px</p>
          <p className="text-sm">
            Current Breakpoint:
            <span
              className={`inline-block px-2 py-1 rounded text-white text-xs ml-2 ${getBreakpointColor()}`}
            >
              {currentBreakpoint}
            </span>
          </p>
        </div>

        {/* Breakpoint Test Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {["base", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"].map((bp) => (
            <div
              key={bp}
              className={`
                p-2 text-center rounded text-xs font-medium
                ${
                  bp === currentBreakpoint
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }
                ${bp === "base" ? "block" : ""}
                ${bp === "xs" ? "xs:block hidden" : ""}
                ${bp === "sm" ? "sm:block hidden" : ""}
                ${bp === "md" ? "md:block hidden" : ""}
                ${bp === "lg" ? "lg:block hidden" : ""}
                ${bp === "xl" ? "xl:block hidden" : ""}
                ${bp === "2xl" ? "2xl:block hidden" : ""}
                ${bp === "3xl" ? "3xl:block hidden" : ""}
              `}
            >
              {bp.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Responsive Text Sizes */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Text Size Test</h3>
          <div className="space-y-1">
            <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
              Responsive text: xs→sm→base→lg→xl→2xl
            </p>
            <p className="xs-text-xs sm-text-sm mobile-optimized tablet-optimized">
              Custom responsive classes
            </p>
          </div>
        </div>

        {/* Layout Test */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Layout Test</h3>
          <div className="flex flex-col mobile-flex-col gap-2 mobile-gap-2">
            <div className="p-2 bg-blue-100 rounded text-center">Item 1</div>
            <div className="p-2 bg-green-100 rounded text-center">Item 2</div>
            <div className="p-2 bg-yellow-100 rounded text-center">Item 3</div>
          </div>
        </div>

        {/* Mobile-specific elements */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Mobile Optimization</h3>
          <div className="space-y-2">
            <button className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded mobile-text-center">
              Mobile-optimized button
            </button>
            <div className="mobile-padding p-2 bg-yellow-100 rounded">
              Mobile padding test
            </div>
          </div>
        </div>

        {/* Scroll Test */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Scroll Test</h3>
          <div className="overflow-x-auto scrollbar-hide p-2 bg-white rounded border">
            <div className="flex gap-2 min-w-max">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 p-2 bg-gray-200 rounded text-sm"
                >
                  Item {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Helper Classes Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2 text-blue-800">
          Breakpoint Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-700">
          <div>• base: 0px+ (default)</div>
          <div>• xs: 475px+ (extra small)</div>
          <div>• sm: 640px+ (small)</div>
          <div>• md: 768px+ (medium)</div>
          <div>• lg: 1024px+ (large)</div>
          <div>• xl: 1280px+ (extra large)</div>
          <div>• 2xl: 1536px+ (2x extra large)</div>
          <div>• 3xl: 1920px+ (ultra-wide)</div>
        </div>
      </div>
    </div>
  );
}