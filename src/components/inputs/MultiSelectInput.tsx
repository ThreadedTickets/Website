import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react-dom";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  max?: number;
}

const SelectMultiCheckbox: React.FC<SelectInputProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className = "",
  inputClassName = "",
  dropdownClassName = "",
  max = Infinity,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // refs for input and dropdown
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // useFloating hook for positioning dropdown
  const { x, y, strategy, refs, update } = useFloating({
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // Sync refs with floating-ui
  useEffect(() => {
    if (inputRef.current) refs.setReference(inputRef.current);
    if (dropdownRef.current) refs.setFloating(dropdownRef.current);
  }, [refs, isOpen]);

  // Update floating position on open or query change
  useEffect(() => {
    if (isOpen) update();
  }, [isOpen, query, update]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        inputRef.current &&
        dropdownRef.current &&
        !inputRef.current.contains(target) &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    }

    if (isOpen) {
      setQuery("");
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Filter options based on query
  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      o.value.includes(query)
  );

  // Check if max selected reached and option is disabled
  const isAtMax = value?.length >= max;

  // Toggle a value in the selected array
  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else if (value.length < max) {
      onChange([...value, val]);
    }
  };

  // Label to show in input when closed
  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label)
    .join(", ");

  // Clear all selections
  const clearSelection = () => {
    onChange([]);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={refs.setReference} className={`relative w-full ${className}`}>
      <input
        ref={inputRef}
        type="text"
        className={`bg-[#131320] text-text cursor-pointer py-1 px-2 pr-8 rounded w-full outline-none border border-transparent focus:border-accent/30 transition-colors ${inputClassName}`}
        placeholder={placeholder}
        value={isOpen ? query : selectedLabels}
        onFocus={() => {
          setQuery("");
          setIsOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onClick={() => {
          if (!isOpen) setIsOpen(true);
        }}
        autoComplete="off"
        readOnly={false}
      />
      {max !== undefined && (
        <div
          className={`absolute right-2 top-1/2 -translate-y-1/2 transform text-xs px-1 py-0.5 rounded bg-background ${
            value.length >= max
              ? "text-red-400"
              : value.length >= max * 0.75
              ? "text-yellow-400"
              : "text-green-400"
          }`}
        >
          {value.length}/{max}
        </div>
      )}

      {/* Clear button */}
      {value.length > 0 && !isOpen && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text/70 hover:text-primary cursor-pointer"
          onClick={clearSelection}
          aria-label="Clear all selections"
        >
          &#x2715; {/* simple X mark, you can replace with icon */}
        </button>
      )}

      {/* Dropdown rendered in portal */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: inputRef.current?.offsetWidth ?? "auto",
              border: "1px solid",
              borderRadius: 4,
              maxHeight: 240,
              overflowY: "auto",
              zIndex: 9999,
            }}
            className={`bg-background border-foreground ${dropdownClassName}`}
          >
            {filtered.length > 0 ? (
              filtered.map((option) => {
                const checked = value.includes(option.value);
                const disabled = isAtMax && !checked;

                return (
                  <label
                    key={option.value}
                    className={`flex items-center p-2 gap-2 cursor-pointer select-none ${
                      disabled
                        ? "text-text/80 cursor-not-allowed opacity-50"
                        : "hover:bg-foreground text-text"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!disabled) toggleValue(option.value);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      readOnly
                      className="sr-only"
                      aria-checked={checked}
                    />
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        checked ? "border-accent" : "border-accent"
                      }`}
                      aria-hidden="true"
                    >
                      <span
                        className={`bg-accent/80 rounded-full w-3.5 h-3.5 transform transition-transform origin-center ${
                          checked ? "scale-100" : "scale-0"
                        }`}
                        style={{
                          transitionTimingFunction:
                            "cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </span>
                    <span>{option.label}</span>
                  </label>
                );
              })
            ) : (
              <div className="p-2 text-text/80 select-none">
                No options found
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default SelectMultiCheckbox;
