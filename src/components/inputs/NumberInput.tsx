import React from "react";

interface NumberInputProps {
  value: number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  inputClassName?: string;
  error?: string;
  errorClassName?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  placeholder = "",
  min,
  max,
  step,
  className = "",
  inputClassName = "w-full py-1 px-2 bg-background text-text rounded border focus:border-accent/30 transition-colors",
  error,
  errorClassName = "text-red-500 text-sm mt-1",
}) => {
  return (
    <div className={`w-full flex flex-col justify-center ${className}`}>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`${inputClassName} ${
          error ? "border-red-500" : "border-transparent"
        }`}
      />
      {error && <div className={errorClassName}>{error}</div>}
    </div>
  );
};

export default NumberInput;
