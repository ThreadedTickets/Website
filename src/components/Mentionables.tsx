"use client";
import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useCallback,
  useLayoutEffect,
  useMemo,
} from "react";
import { useFloating, offset, shift, autoUpdate } from "@floating-ui/react-dom";

type MentionableItem = {
  id: string;
  name: string;
  type: "channel" | "role" | "placeholder";
  colour?: string;
};

type MentionTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  channels?: { id: string; name: string; type: number }[];
  roles?: { id: string; name: string; colour: string }[];
  placeholder?: string;
  maxLength?: number;
  style?: string;
};

const placeholders = [
  { name: "Server ID", id: "server.id" },
  { name: "Server Name", id: "server.name" },
  { name: "Server Boosts", id: "server.boosts" },
  { name: "Server Member Count", id: "server.members" },
  { name: "User ID", id: "user.id" },
  { name: "User Name", id: "user.username" },
  { name: "User Displayname", id: "user.displayname" },
  { name: "User Avatar URL", id: "user.avatar" },
  { name: "User Role IDs", id: "member.roles.ids" },
  { name: "User Role Mentions", id: "member.roles.mentions" },
  { name: "User Role Names", id: "member.roles.names" },
  { name: "User Flat Role Names", id: "member.roles.flat" },
  { name: "User Highest Role Mention", id: "member.roles.highest.mention" },
  { name: "User Highest Role ID", id: "member.roles.highest.id" },
  { name: "User Highest Role Name", id: "member.roles.highest.name" },
  { name: "User Highest Role Flattened", id: "member.roles.highest.flat" },
  { name: "User Nickname", id: "member.nickname" },
  { name: "Channel ID", id: "channel.id" },
  { name: "Channel Name", id: "channel.name" },
];

export default function MentionTextarea({
  value = "",
  onChange,
  placeholder,
  channels = [],
  roles = [],
  maxLength,
  style = "w-full min-h-[100px] p-2 text-text rounded",
}: MentionTextareaProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionableItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [triggerPosition, setTriggerPosition] = useState(0);
  const [triggerChar, setTriggerChar] = useState<"#" | "@" | "{">("#");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const cursorPointRef = useRef<HTMLSpanElement>(null); // New ref for the cursor point in the mirror

  // All mentionable items
  const allMentionables: MentionableItem[] = useMemo(
    () => [
      ...channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        type: "channel" as const,
      })),
      ...roles.map((role) => ({
        id: role.id,
        name: role.name,
        type: "role" as const,
        colour: role.colour,
      })),
      ...placeholders.map((placeholder) => ({
        id: placeholder.id,
        name: placeholder.name,
        type: "placeholder" as const,
      })),
    ],
    [channels, roles]
  );

  // Filter suggestions based on trigger char and search term
  const filteredSuggestions = useMemo(() => {
    if (!showSuggestions) return [];

    return allMentionables
      .filter((item) => {
        if (triggerChar === "#" && item.type !== "channel") return false;
        if (triggerChar === "@" && item.type !== "role") return false;
        if (triggerChar === "{" && item.type !== "placeholder") return false;
        return item.name
          .toLowerCase()
          .replace(/ /g, "")
          .includes(searchTerm.toLowerCase());
      })
      .slice(0, 10);
  }, [showSuggestions, allMentionables, triggerChar, searchTerm]);

  useEffect(() => {
    setSuggestions((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(filteredSuggestions))
        return prev;
      return filteredSuggestions;
    });
    setSelectedIndex(0);
  }, [filteredSuggestions]);

  // Floating UI positioning setup
  const { x, y, strategy, update, refs } = useFloating({
    placement: "bottom", // Changed from "bottom-start" to "bottom"
    middleware: [
      offset(({ rects }) => {
        // Offset by the height of the reference (the span at cursor) to get it below the line
        return rects.reference.height;
      }),
      // Removed flip() middleware
      shift(),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Effect to update the mirror and set the reference for Floating UI
  useLayoutEffect(() => {
    if (!textareaRef.current || !mirrorRef.current || !cursorPointRef.current)
      return;

    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;

    // Get the textarea styles that affect layout and replicate them for mirror
    const style = window.getComputedStyle(textarea);
    mirror.style.width = style.width;
    mirror.style.fontSize = style.fontSize;
    mirror.style.fontFamily = style.fontFamily;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.padding = style.padding;
    mirror.style.border = style.border;
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.boxSizing = style.boxSizing; // Important for padding/border to be included in width

    // Get cursor position
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value
      .substring(0, cursorPos)
      .replace(/ /g, "\u00a0") // Use non-breaking space
      .replace(/\n/g, "<br/>"); // Preserve line breaks

    // Set the mirror's content
    mirror.innerHTML = `${textBeforeCursor}<span id="cursor-point-marker" style="display: inline-block;"></span>`;

    // Find the newly created span by its ID
    const dynamicCursorPoint = mirror.querySelector(
      "#cursor-point-marker"
    ) as HTMLElement;

    if (dynamicCursorPoint) {
      refs.setReference(dynamicCursorPoint);
    } else {
      // Fallback: if for some reason the span isn't found, use the textarea itself
      refs.setReference(textarea);
    }

    // Force an update to Floating UI's position if suggestions are shown
    if (showSuggestions) {
      update();
    }
  }, [value, showSuggestions, update, refs.setReference]); // Added value to dependencies

  // Handle textarea input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    const cursorPos = e.target.selectionStart;
    checkForMentionTrigger(newValue, cursorPos);
  };

  // Detect mention triggers (#, @, {) and set up suggestion dropdown
  const checkForMentionTrigger = (text: string, cursorPos: number) => {
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastHash = textBeforeCursor.lastIndexOf("#");
    const lastAt = textBeforeCursor.lastIndexOf("@");
    const lastBracket = textBeforeCursor.lastIndexOf("{");
    const lastTrigger = Math.max(lastHash, lastAt, lastBracket);

    if (lastTrigger === -1) {
      setShowSuggestions(false);
      return;
    }

    // Valid if trigger is at start or preceded by whitespace
    const isTriggerValid =
      lastTrigger === 0 || /\s/.test(text[lastTrigger - 1]);
    if (!isTriggerValid) {
      setShowSuggestions(false);
      return;
    }

    const char = text[lastTrigger] as "#" | "@" | "{";
    if (char !== "#" && char !== "@" && char !== "{") {
      setShowSuggestions(false);
      return;
    }

    // Abort if the current search contains spaces (mention can't contain spaces)
    const currentSearch = textBeforeCursor.substring(lastTrigger + 1);
    if (currentSearch.includes(" ")) {
      setShowSuggestions(false);
      return;
    }

    setTriggerChar(char);
    setShowSuggestions(true);
    setSearchTerm(currentSearch);
    setTriggerPosition(lastTrigger);
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
      scrollIntoView(selectedIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      scrollIntoView(selectedIndex - 1);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (suggestions.length > 0) {
        // Only select if there are suggestions
        selectSuggestion(selectedIndex);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowSuggestions(false);
    }
  };

  // Scroll suggestion item into view if needed
  const scrollIntoView = (index: number) => {
    if (refs.floating.current && index >= 0 && index < suggestions.length) {
      const item = refs.floating.current.children[index] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  };

  // Insert selected suggestion into textarea value
  const selectSuggestion = (index: number) => {
    if (index < 0 || index >= suggestions.length) return;

    const selected = suggestions[index];
    const textBefore = value.substring(0, triggerPosition);
    const textAfter = value.substring(triggerPosition + 1 + searchTerm.length);

    let mentionText = "";
    if (selected.type === "channel") {
      mentionText = `<#${selected.id}>`;
    } else if (selected.type === "role") {
      mentionText = `<@&${selected.id}>`;
    } else if (selected.type === "placeholder") {
      mentionText = `{${selected.id}}`;
    }

    const newValue = `${textBefore}${mentionText} ${textAfter}`;
    onChange(newValue);

    // Move caret to after inserted mention + space
    const caretPos = (textBefore + mentionText + " ").length;
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(caretPos, caretPos);
    });

    setShowSuggestions(false);
  };

  // Click on suggestion
  const handleSuggestionClick = (index: number) => {
    selectSuggestion(index);
  };

  // Click outside to close suggestions
  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node) &&
        refs.floating.current &&
        !refs.floating.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [refs.floating]);

  // Set textarea ref and also provide it to Floating UI as a fallback reference
  const setTextareaRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      textareaRef.current = el;
      // While we set cursorPointRef as the primary reference,
      // it's good practice to also provide the textarea as a fallback if needed
      // (e.g., if cursorPointRef isn't immediately available)
      refs.setReference(el);
    },
    [refs.setReference]
  );

  return (
    <div className="relative w-full">
      {/* Mirror div for measuring line position */}
      <div
        ref={mirrorRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -1,
          top: 0,
          left: 0,
        }}
      >
        {/* This span will be dynamically placed and act as our Floating UI reference */}
        <span ref={cursorPointRef} id="cursor-point" />
      </div>

      <textarea
        ref={setTextareaRef}
        className={style}
        placeholder={placeholder}
        maxLength={maxLength}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        rows={4}
        style={{ resize: "vertical" }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul
          ref={refs.setFloating}
          className="max-h-48 overflow-y-auto rounded border border-foreground bg-foreground bg-bg p-1 text-text shadow-lg"
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: textareaRef.current?.clientWidth, // Set width to textarea's clientWidth
            zIndex: 9999,
          }}
          role="listbox"
          aria-activedescendant={`mention-item-${selectedIndex}`}
        >
          {suggestions.map((item, index) => (
            <li
              key={item.id + item.type}
              id={`mention-item-${index}`}
              role="option"
              aria-selected={selectedIndex === index}
              className={`cursor-pointer select-none rounded px-2 py-1 ${
                selectedIndex === index ? "bg-primary text-text-inverted" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(index);
              }}
            >
              {item.type === "channel" && <span>#</span>}
              {item.type === "role" && <span>@</span>}
              <span
                className="ml-1"
                style={item.colour ? { color: item.colour } : undefined}
              >
                {item.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
