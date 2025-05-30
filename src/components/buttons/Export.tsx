"use client";

import { useState } from "react";
import { Download, Package } from "lucide-react";
import clsx from "clsx";

export default function ExportButton({
  handleExport,
}: {
  handleExport: () => unknown;
}) {
  const [isPacking, setIsPacking] = useState(false);

  const onClick = async () => {
    if (isPacking) return;
    setIsPacking(true);

    // Wait for the "packing" animation to finish
    await new Promise((res) => setTimeout(res, 500));

    const result = handleExport();
    if (result instanceof Promise) {
      await result;
    }

    setIsPacking(false);
  };

  return (
    <div className="flex flex-col justify-center mx-auto">
      <button
        onClick={onClick}
        disabled={isPacking}
        className={clsx(
          "relative inline-flex items-center justify-center px-7 py-3 rounded-2xl text-white font-semibold bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-500 shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.7)] transition-all duration-300 ease-out hover:scale-105 active:scale-95 focus:outline-none group overflow-hidden",
          isPacking && "cursor-not-allowed opacity-90",
          !isPacking && "cursor-pointer"
        )}
      >
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 via-indigo-500/10 to-blue-400/20 blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />

        {/* Tilted glimmer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-1/2 top-0 h-full w-[150%] transform bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 animate-slide-shine" />
        </div>

        {/* Animated icon */}
        <span
          className={clsx(
            "mr-2 z-10 flex items-center justify-center transition-transform duration-300",
            isPacking && "animate-pack"
          )}
        >
          {isPacking ? (
            <Package className="w-4 h-4" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </span>

        {/* Fixed width text wrapper */}
        <span className="relative z-10 inline-block w-[110px] text-center">
          {isPacking ? "Preparing" : "Export Config"}
        </span>
      </button>
    </div>
  );
}
