import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react-dom";
import { FaTrash } from "react-icons/fa";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  required?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className = "",
  inputClassName = "",
  dropdownClassName = "",
  required = false,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // refs for input and dropdown
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // useFloating hook for positioning
  const { x, y, strategy, refs, update } = useFloating({
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // sync refs when elements mount or open state changes
  useEffect(() => {
    if (inputRef.current) refs.setReference(inputRef.current);
    if (dropdownRef.current) refs.setFloating(dropdownRef.current);
  }, [refs, isOpen]);

  // recompute position when query or open changes
  useEffect(() => {
    if (isOpen) update();
  }, [isOpen, query, update]);

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

  // filtered options based on query
  const filteredOptions = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      o.value.includes(query)
  );

  // label of current selected value
  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  // handle clearing selection
  const clearSelection = () => {
    if (!required) {
      onChange("");
    }
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div
      ref={refs.setReference}
      className={`relative w-full ${className} flex flex-col justify-center`}
    >
      <input
        ref={inputRef}
        className={`bg-background text-text cursor-pointer py-1 px-2 pr-8 rounded w-full outline-none border border-transparent focus:border-accent/30 transition-colors ${inputClassName}`}
        placeholder={placeholder}
        value={isOpen ? query : selectedLabel}
        onFocus={() => {
          setQuery(selectedLabel);
          setIsOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onClick={() => {
          if (!isOpen) {
            setQuery(selectedLabel);
            setIsOpen(true);
          }
        }}
        autoComplete="off"
      />
      {/* Clear button */}
      {value && !isOpen && !required && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text/70 hover:text-primary cursor-pointer"
          onClick={clearSelection}
          aria-label="Clear selection"
        >
          <FaTrash size={14} />
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
            className={`bg-background border-accent/30 ${dropdownClassName}`}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="p-2 hover:bg-midground text-text cursor-pointer"
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="p-2 text-text/70 select-none">
                No options found
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default SelectInput;
