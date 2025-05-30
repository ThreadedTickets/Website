import React from "react";

type PermissionState = "allow" | "neutral" | "deny";

interface PermissionToggleProps {
  value: PermissionState;
  onChange: (value: PermissionState) => void;
  className?: string;
  id?: string;
  ariaLabel?: string;
  noNeutral?: boolean;
}

const colors = {
  allow: "#43B581", // green
  neutral: "#747F8D", // gray
  deny: "#F04747", // red
};

const TickIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={filled ? "white" : colors.allow}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CrossIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={filled ? "white" : colors.deny}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const NeutralIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={filled ? "white" : colors.neutral}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="6" y1="12" x2="18" y2="12" />
  </svg>
);

const PermissionToggle: React.FC<PermissionToggleProps> = ({
  value,
  onChange,
  className = "",
  id,
  ariaLabel = "Permission toggle: Allow, Neutral, Deny",
  noNeutral = false,
}) => {
  const handleClick = (newValue: PermissionState) => {
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  // Build the options array dynamically
  const options = [
    "allow",
    ...(noNeutral ? [] : ["neutral"]),
    "deny",
  ] as PermissionState[];

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex rounded overflow-hidden h-fit w-fit text-sm font-semibold divide-x border-1 border-background divide-background select-none ${className}`}
      id={id}
    >
      {options.map((state) => {
        const isSelected = value === state;
        let Icon;
        if (state === "allow") Icon = <TickIcon filled={isSelected} />;
        else if (state === "neutral")
          Icon = <NeutralIcon filled={isSelected} />;
        else Icon = <CrossIcon filled={isSelected} />;

        return (
          <button
            key={state}
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            type="button"
            onClick={() => handleClick(state)}
            className={`flex items-center justify-center h-8 w-8 transition-colors duration-150 focus:outline-none ${
              isSelected
                ? `bg-[${colors[state]}]`
                : "bg-midground/70 hover:bg-midground"
            }`}
            style={{
              cursor: "pointer",
              backgroundColor: isSelected ? colors[state] : undefined,
              color: isSelected ? "white" : undefined,
            }}
          >
            {Icon}
          </button>
        );
      })}
    </div>
  );
};

export default PermissionToggle;
