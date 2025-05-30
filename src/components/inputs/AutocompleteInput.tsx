import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useCallback,
} from "react";

interface Item {
  id: string;
  name: string;
}

interface TagProps {
  item: Item;
  index: number;
  onRemove: (index: number) => void;
  className?: string;
  removeClassName?: string;
}

interface DropdownItemProps {
  item: Item;
  isHighlighted: boolean;
  isCustom: boolean;
  className?: string;
  customIndicator?: React.ReactNode;
  onClick: () => void;
  onMouseEnter: () => void;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

interface AutocompleteInputProps {
  items: Item[];
  onSelectionChange: (selected: Item[]) => void;
  allowCustom?: boolean;
  minSelected?: number;
  maxSelected?: number;
  allowDuplicates?: boolean;
  placeholder?: string;
  validateInput?: (value: string) => ValidationResult;
  validateSelection?: (selected: Item[]) => ValidationResult;
  className?: string;
  inputClassName?: string;
  tagClassName?: string;
  tagRemoveClassName?: string;
  dropdownClassName?: string;
  dropdownItemClassName?: string;
  highlightedItemClassName?: string;
  customIndicator?: React.ReactNode;
  errorClassName?: string;
  caseSensitive?: boolean;
  alwaysShowDropdown?: boolean;
  selected?: string[];
}

const Tag: React.FC<TagProps> = ({
  item,
  index,
  onRemove,
  className = "",
  removeClassName = "",
}) => (
  <div
    className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${className}`}
    onClick={() => onRemove(index)}
  >
    {item.name}
    <span className={`ml-2 cursor-pointer ${removeClassName}`}>×</span>
  </div>
);

const DropdownItem: React.FC<DropdownItemProps> = ({
  item,
  isHighlighted,
  isCustom,
  className = "",
  customIndicator = null,
  onClick,
  onMouseEnter,
}) => (
  <div
    className={`p-2 cursor-pointer ${className} ${
      isHighlighted ? "bg-gray-100" : ""
    }`}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
  >
    {item.name}
    {isCustom &&
      (customIndicator || (
        <span className="ml-2 text-xs text-gray-500">(Custom)</span>
      ))}
  </div>
);

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  items,
  onSelectionChange,
  allowCustom = false,
  maxSelected = Infinity,
  allowDuplicates = false,
  placeholder = "Type and select...",
  validateInput,
  validateSelection,
  className = "",
  inputClassName = "flex-grow p-1 outline-none min-w-[100px]",
  tagClassName = "bg-blue-100 text-blue-800 hover:bg-blue-200",
  tagRemoveClassName = "text-blue-500",
  dropdownClassName = "absolute z-10 w-full mt-1 bg-gray-500 border-1 border-gray-500 rounded-md shadow-lg max-h-60 overflow-auto",
  dropdownItemClassName = "p-2 cursor-pointer hover:bg-gray-600",
  highlightedItemClassName = "bg-gray-500",
  customIndicator = null,
  errorClassName = "text-red-500 text-sm mt-1",
  caseSensitive = false,
  alwaysShowDropdown = false,
  selected = [],
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [inputError, setInputError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter function with proper memoization
  const filterItems = useCallback(
    (value: string, itemsToFilter: Item[]) => {
      if (value.trim() === "") {
        return itemsToFilter;
      }

      return itemsToFilter.filter((item) =>
        caseSensitive
          ? item.name.includes(value)
          : item.name.toLowerCase().includes(value.toLowerCase()) ||
            item.id.includes(value)
      );
    },
    [caseSensitive]
  );

  useEffect(() => {
    if (!selected) return;

    // Avoid unnecessary updates by checking if they're already selected
    const newSelected = selected
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is Item => !!item); // filter out nulls

    // Only update if changed
    const currentIds = selectedItems.map((i) => i.id).join(",");
    const newIds = newSelected.map((i) => i.id).join(",");
    if (currentIds !== newIds) {
      setSelectedItems(newSelected);

      if (validateSelection) {
        const validation = validateSelection(newSelected);
        setSelectionError(
          validation.isValid ? null : validation.message || null
        );
      } else {
        setSelectionError(null);
      }

      onSelectionChange(newSelected);
    }
  }, [selected?.join(","), items, validateSelection]);

  // Validate input value
  const validateCurrentInput = useCallback(
    (value: string): boolean => {
      if (!validateInput) return true;

      const validation = validateInput(value);
      setInputError(validation.isValid ? null : validation.message || null);
      return validation.isValid;
    },
    [validateInput]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      if (validateInput) {
        validateCurrentInput(value);
      }

      if (validateSelection) {
        const validation = validateSelection(selectedItems);
        setSelectionError(
          validation.isValid ? null : validation.message || null
        );
      } else {
        setSelectionError(null);
      }

      setShowDropdown(true);
      setHighlightedIndex(0);

      const filtered = filterItems(value, items);

      const isCustomValue =
        value.trim() !== "" &&
        !items.some((item) =>
          caseSensitive
            ? item.name === value
            : item.name.toLowerCase() === value.toLowerCase()
        );
      const isValidCustom =
        allowCustom &&
        isCustomValue &&
        (!validateInput || validateCurrentInput(value));

      // Add custom item at the start with id same as name (or some unique id)
      setFilteredItems(
        isValidCustom
          ? [{ id: value, name: value }, ...filtered]
          : isCustomValue
          ? filtered // typing something not valid/custom — no need to inject
          : filtered
      );
    },
    [
      allowCustom,
      caseSensitive,
      filterItems,
      items,
      selectedItems,
      validateInput,
      validateSelection,
      validateCurrentInput,
    ]
  );

  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        !allowCustom &&
        !(
          filteredItems[highlightedIndex] &&
          items.some(
            (item) =>
              item.id === filteredItems[highlightedIndex].id &&
              item.name === filteredItems[highlightedIndex].name
          )
        )
      ) {
        setSelectionError("Custom items are not allowed.");
        return;
      }
      if (filteredItems.length > 0 && highlightedIndex >= 0 && !inputError) {
        selectItem(filteredItems[highlightedIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      selectedItems.length > 0
    ) {
      removeItem(selectedItems.length - 1); // Remove last item by index
    }
  };

  const selectItem = (item: Item) => {
    if (selectedItems.length >= maxSelected) {
      setSelectionError(`Maximum ${maxSelected} items allowed`);
      return;
    }

    if (
      !allowDuplicates &&
      selectedItems.some((selected) => selected.id === item.id)
    ) {
      setSelectionError("Duplicate items are not allowed");
      return;
    }

    if (
      !allowCustom &&
      !items.some(
        (allowedItem) =>
          allowedItem.id === item.id && allowedItem.name === item.name
      )
    ) {
      setSelectionError("Custom items are not allowed");
      return;
    }

    const updated = [...selectedItems, item];
    setSelectedItems(updated);

    if (validateSelection) {
      const validation = validateSelection(updated);
      setSelectionError(validation.isValid ? null : validation.message || null);
    } else {
      setSelectionError(null);
    }

    onSelectionChange(updated);
    setInputValue("");
    setShowDropdown(alwaysShowDropdown);
    setFilteredItems([]);
    inputRef.current?.focus();
  };

  const removeItem = (index: number) => {
    const updated = [...selectedItems];
    updated.splice(index, 1);

    setSelectedItems(updated);

    if (validateSelection) {
      const validation = validateSelection(updated);
      setSelectionError(validation.isValid ? null : validation.message || null);
    } else {
      setSelectionError(null);
    }

    onSelectionChange(updated);
  };

  const handleItemClick = (item: Item) => {
    selectItem(item);
  };

  const shouldShowDropdown =
    showDropdown && (alwaysShowDropdown || filteredItems.length > 0);

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className={`flex flex-wrap items-center gap-2 p-2 border rounded-md bg-gray-700 min-h-12 ${
          inputError || selectionError ? "border-red-500" : "border-gray-800"
        }`}
      >
        {selectedItems.map((item, index) => (
          <Tag
            key={`${item.id}-${index}`}
            item={item}
            index={index}
            onRemove={removeItem}
            className={tagClassName}
            removeClassName={tagRemoveClassName}
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          className={inputClassName}
          placeholder={selectedItems.length === 0 ? placeholder : ""}
        />
      </div>

      {inputError && <div className={errorClassName}>{inputError}</div>}
      {selectionError && <div className={errorClassName}>{selectionError}</div>}

      {shouldShowDropdown && (
        <div ref={dropdownRef} className={dropdownClassName}>
          {filteredItems.map((item, index) => (
            <DropdownItem
              key={`${item.id}-${index}`}
              item={item}
              isHighlighted={index === highlightedIndex}
              isCustom={
                index === 0 &&
                allowCustom &&
                !items.some(
                  (origItem) =>
                    origItem.id === item.id && origItem.name === item.name
                )
              }
              className={`${dropdownItemClassName} ${
                index === highlightedIndex ? highlightedItemClassName : ""
              }`}
              customIndicator={customIndicator}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
