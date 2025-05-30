import React from "react";

interface TextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  error?: string;
  errorClassName?: string;
  max?: number;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = "",
  name,
  id,
  className = "",
  inputClassName = "w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors",
  disabled = false,
  error,
  errorClassName = "text-red-500 text-sm mt-1",
  max = undefined,
}) => {
  return (
    <div className={`w-full flex flex-col justify-center ${className}`}>
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        maxLength={max}
        placeholder={placeholder}
        disabled={disabled}
        className={`${inputClassName} ${error ? "border-red-500" : ""}`}
      />
      {error && <div className={errorClassName}>{error}</div>}
    </div>
  );
};

export default TextInput;
