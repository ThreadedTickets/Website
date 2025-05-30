import React from "react";

interface CheckboxInputProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  className?: string;
  enabledColor?: string;
  disabledColor?: string;
  disabled?: boolean;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  checked,
  onChange,
  label,
  id,
  className = "",
  enabledColor = "#d22ceb",
  disabledColor = "#2F3136",
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <div
        className="relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out"
        style={{ backgroundColor: checked ? enabledColor : disabledColor }}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <span
          className={`absolute left-1 top-1 w-4 h-4 bg-text rounded-full shadow-md transform transition-transform duration-200 ease-in-out`}
          style={{
            transform: checked ? "translateX(18px)" : "translateX(0)",
          }}
        />
      </div>
      {label && (
        <span className="ml-3 text-text text-sm select-none">{label}</span>
      )}
    </label>
  );
};

export default CheckboxInput;
