"use client";

export default function Button({
  text,
  onClick,
}: {
  text: string;
  onClick?: () => unknown;
}) {
  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center justify-center px-7 py-3 rounded-2xl text-text-inverted font-semibold cursor-pointer bg-primary/90 hover:bg-primary"
    >
      {/* Fixed width text wrapper */}
      <span className="relative z-10 inline-block w-[110px] text-center">
        {text}
      </span>
    </button>
  );
}
