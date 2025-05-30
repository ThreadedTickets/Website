import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaTrash } from "react-icons/fa";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react-dom";

interface TagOption {
  label: string;
  value: string;
}

interface TagSelectInputProps {
  options: TagOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
  className?: string;
  max?: number;
}

const TagSelectInput: React.FC<TagSelectInputProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Add tags...",
  allowCustom = false,
  className = "",
  max,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Use floating-ui for positioning
  const { x, y, strategy, refs, update } = useFloating({
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // Refs for container and input
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync refs with floating-ui
  useEffect(() => {
    if (inputRef.current) refs.setReference(inputRef.current);
    if (containerRef.current) refs.setFloating(containerRef.current);
  }, [refs, isOpen]);

  // Update position when query or open changes
  useEffect(() => {
    if (isOpen) update();
  }, [isOpen, query, update]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // If click target is outside both input and dropdown container, close dropdown
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedQuery = query.toLowerCase().trim();
  const isAtMax = max !== undefined && selected.length >= max;

  const filtered = options.filter(
    (o) =>
      (o.label.toLowerCase().includes(normalizedQuery) ||
        o.value.includes(normalizedQuery)) &&
      !selected.includes(o.value)
  );

  const isCustom =
    allowCustom &&
    normalizedQuery.length > 0 &&
    !options.some((o) => o.label.toLowerCase() === normalizedQuery) &&
    !selected.includes(normalizedQuery);

  const handleAdd = (value: string) => {
    if (!value || selected.includes(value) || isAtMax) return;
    onChange([...selected, value]);
    setQuery("");
    setHighlightedIndex(0);
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((v) => v !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && query === "") {
      onChange(selected.slice(0, -1));
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filtered.length - 1 + (isCustom ? 1 : 0) ? prev + 1 : prev
      );
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlightedIndex]) {
        handleAdd(filtered[highlightedIndex].value);
      } else if (isCustom && highlightedIndex === filtered.length) {
        handleAdd(query);
      }
    }
  };

  return (
    <div
      className={`relative w-full flex flex-col justify-center ${className}`}
    >
      <div
        className={`flex flex-wrap items-center gap-1 bg-background py-1 px-2 pr-10 rounded w-full outline-none border relative ${
          isAtMax ? "border-red-500" : "border-transparent"
        } focus-within:border-accent/30 transition-colors`}
        onClick={() => !isAtMax && setIsOpen(true)}
      >
        <div className="flex gap-1 flex-wrap mr-2.5">
          {selected.map((val) => {
            const label = options.find((o) => o.value === val)?.label || val;
            return (
              <span
                key={val}
                className="bg-secondary/70 text-text text-sm px-2 py-0.5 rounded flex items-center gap-1"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(val);
                  }}
                  className="text-xs hover:text-primary my-auto cursor-pointer"
                >
                  <FaTrash />
                </button>
                {label}
              </span>
            );
          })}
        </div>
        <input
          ref={inputRef}
          className="bg-transparent text-text flex-1 outline-none disabled:opacity-40"
          placeholder={placeholder}
          value={query}
          disabled={isAtMax}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          style={{
            display: isAtMax ? "none" : "block",
          }}
          onFocus={() => !isAtMax && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
      </div>

      {isOpen && !isAtMax && (filtered.length > 0 || isCustom)
        ? createPortal(
            <div
              ref={containerRef}
              role="listbox"
              tabIndex={-1}
              className="bg-background border-foreground"
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                width: inputRef.current?.offsetWidth ?? "auto",
                zIndex: 99999,
                border: "1px solid",
                borderRadius: "0.375rem",
                maxHeight: "15rem",
                overflowY: "auto",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
              }}
            >
              {filtered.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => handleAdd(option.value)}
                  className={`p-2 cursor-pointer text-text ${
                    index === highlightedIndex
                      ? "bg-midground"
                      : "hover:bg-foreground"
                  }`}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleAdd(option.value);
                    }
                  }}
                >
                  {option.label}
                </div>
              ))}
              {isCustom && (
                <div
                  onClick={() => handleAdd(query)}
                  className={`p-2 cursor-pointer italic text-text ${
                    highlightedIndex === filtered.length
                      ? "bg-midground"
                      : "hover:bg-foreground"
                  }`}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleAdd(query);
                    }
                  }}
                >
                  Add &quot;{query}&quot;
                </div>
              )}
            </div>,
            document.body
          )
        : null}

      {max !== undefined && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 right-2 text-xs px-1 py-0.5 rounded bg-foreground pointer-events-none ${
            selected.length >= max
              ? "text-red-400"
              : selected.length >= max * 0.75
              ? "text-yellow-400"
              : "text-green-400"
          }`}
        >
          {selected.length}/{max}
        </div>
      )}
    </div>
  );
};

export default TagSelectInput;
