import React from "react";

interface DateTimeInputProps {
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
  error?: string;
  errorClassName?: string;
}

const DateTimeInput: React.FC<DateTimeInputProps> = ({
  value,
  onChange,
  placeholder = "",
  name,
  id,
  className = "",
  inputClassName = "w-full py-1 px-2 bg-background text-text rounded border focus:border-accent/30 transition-colors",
  error,
  errorClassName = "text-red-500 text-sm mt-1",
}) => {
  return (
    <div className={`w-full flex flex-col justify-center ${className}`}>
      <input
        id={id}
        name={name}
        type="datetime-local"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClassName} ${
          error ? "border-red-500" : "border-transparent"
        }`}
      />
      {error && <div className={errorClassName}>{error}</div>}
    </div>
  );
};

export default DateTimeInput;
