import React from "react";

interface TextareaInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  inputClassName?: string;
  error?: string;
  errorClassName?: string;
  maxLength?: number;
}

const TextareaInput: React.FC<TextareaInputProps> = ({
  value,
  onChange,
  placeholder = "",
  rows = 4,
  className = "",
  inputClassName = "w-full py-1 px-2 bg-background text-text rounded min-h-9 border",
  error,
  errorClassName = "text-red-500 text-sm mt-1",
  maxLength,
}) => {
  const showCounter =
    maxLength !== undefined &&
    maxLength - value.length <= 200 &&
    value.length <= maxLength;

  // Calculate the color between green (far) to red (close)
  // We'll use a simple linear interpolation for hue from green (120deg) to red (0deg)
  // Hue 120 = green, Hue 60 = yellow, Hue 0 = red
  // When far from limit (distance >= 200), color is green (120)
  // When very close (distance = 0), color is red (0)
  // We clamp distance from 0 to 200

  let counterColor = "hsl(120, 100%, 60%)"; // default green

  if (maxLength !== undefined) {
    const distance = Math.max(0, maxLength - value.length);
    // Map distance 0..200 to hue 0..120
    const hue = (distance / 200) * 120; // 0=red, 120=green
    counterColor = `hsl(${hue}, 100%, 60%)`;
  }

  return (
    <div
      className={`w-full relative focus:border-accent/30 transition-colors ${className}`}
    >
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`${inputClassName} ${
          error ? "border-red-500" : "border-transparent"
        } pr-10`}
      />
      {error && <div className={errorClassName}>{error}</div>}

      {showCounter && maxLength !== undefined && (
        <div
          className="absolute bottom-1 right-2 text-xs select-none pointer-events-none"
          aria-live="polite"
          style={{ color: counterColor }}
        >
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default TextareaInput;
