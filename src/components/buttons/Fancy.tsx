"use client";

import clsx from "clsx";

export default function FancyButton({
  text,
  onClick,
}: {
  text: string;
  onClick?: () => unknown;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative inline-flex items-center justify-center px-7 py-3 rounded-2xl text-white font-semibold bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-500 shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.7)] transition-all duration-300 ease-out hover:scale-105 active:scale-95 focus:outline-none group overflow-hidden cursor-pointer"
      )}
    >
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 via-indigo-500/10 to-blue-400/20 blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />

      {/* Tilted glimmer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-1/2 top-0 h-full w-[150%] transform bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 animate-slide-shine" />
      </div>

      {/* Fixed width text wrapper */}
      <span className="relative z-10 inline-block text-center">{text}</span>
    </button>
  );
}
