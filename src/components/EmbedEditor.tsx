import { useEffect, useRef, useState } from "react";
import MentionTextarea from "./Mentionables";
import { FaTrash } from "react-icons/fa";
import CheckboxInput from "./inputs/CheckboxInput";
import DateTimeInput from "./inputs/DateTimeInput";

export default function EmbedEditor({
  embed,
  index,
  onChange,
  onRemove,
  channels,
  roles,
}: {
  embed: any;
  index: any;
  onChange: any;
  onRemove: any;
  channels: { id: string; name: string; type: number }[];
  roles: { id: string; name: string; colour: string }[];
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [localTimestamp, setLocalTimestamp] = useState("");
  const dateInputRef = useRef<any>(null);

  const handleFieldChange = (field: string, value: any) => {
    onChange(index, field, value);
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    const updated = { ...embed[parent], [field]: value };
    onChange(index, parent, updated);
  };

  const addField = () => {
    const updatedFields = [
      ...embed.fields,
      { name: "", value: "", inline: false },
    ];
    onChange(index, "fields", updatedFields);
  };

  const removeField = (fieldIndex: any) => {
    const updatedFields = [...embed.fields];
    updatedFields.splice(fieldIndex, 1);
    onChange(index, "fields", updatedFields);
  };

  const updateField = (fieldIndex: any, field: string, value: any) => {
    const updatedFields = [...embed.fields];
    updatedFields[fieldIndex][field] = value;
    onChange(index, "fields", updatedFields);
  };

  useEffect(() => {
    if (embed.timestamp) {
      const date = new Date(embed.timestamp);
      const offset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - offset);
      setLocalTimestamp(localDate.toISOString().slice(0, 16));
    } else {
      setLocalTimestamp("");
    }
  }, [embed.timestamp]);

  const handleTimestampChange = (e: any) => {
    const value = e.target.value;
    setLocalTimestamp(value);

    if (value) {
      // Convert local datetime string to UTC ISO string (Discord format)
      const date = new Date(value);
      const offset = date.getTimezoneOffset() * 60000;
      const utcDate = new Date(date.getTime() + offset);
      const discordTimestamp = utcDate.toISOString().replace(/\.\d{3}Z$/, "");
      onChange(index, "timestamp", discordTimestamp);
    } else {
      onChange(index, "timestamp", null);
    }
  };

  const handleSetNow = () => {
    const now = new Date();
    const discordTimestamp = now.toISOString().replace(/\.\d{3}Z$/, "");
    onChange(index, "timestamp", discordTimestamp);

    // Force immediate update of input field
    const offset = now.getTimezoneOffset() * 60000;
    const localNow = new Date(now.getTime() - offset);
    if (dateInputRef.current) {
      dateInputRef.current.value = localNow.toISOString().slice(0, 16);
    }
  };

  return (
    <div className="bg-foreground rounded-lg overflow-hidden text-text">
      <div
        className="flex justify-between items-center p-2 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center">
          <h4 className="font-medium">Embed #{index + 1}</h4>
          {embed.title && (
            <span className="ml-2 text-text/60 truncate max-w-xs">
              {embed.title}
            </span>
          )}
        </div>
        <div className="flex items-center">
          <FaTrash
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="text-text hover:text-primary mr-3"
          />
          <svg
            className={`w-5 h-5 transition-transform ${
              isCollapsed ? "" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4 pt-0">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 text-sm">Title</label>
              <MentionTextarea
                onChange={(e) => handleFieldChange("title", e)}
                value={embed.title || ""}
                maxLength={100}
                channels={channels}
                roles={roles}
                style="w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors max-h-10 resize-none"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">URL</label>
              <MentionTextarea
                onChange={(e) => handleFieldChange("url", e)}
                value={embed.url || ""}
                maxLength={1000}
                style="w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors max-h-10 resize-none"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm">Colour</label>
            <div className="flex items-center">
              <input
                type="color"
                value={embed.color}
                onChange={(e) => handleFieldChange("color", e.target.value)}
                className="w-8 h-8 cursor-pointer outline-background"
              />
              <input
                type="text"
                value={embed.color}
                onChange={(e) => handleFieldChange("color", e.target.value)}
                className="ml-4 w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors max-h-10 resize-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm">Description</label>
            <MentionTextarea
              onChange={(e) => handleFieldChange("description", e)}
              value={embed.description}
              channels={channels}
              roles={roles}
              maxLength={1500}
              placeholder="My embed!"
              style="w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors min-h-10"
            />
          </div>

          {/* Author */}
          <div className="mb-4 p-3 bg-foreground-further rounded-lg">
            <h5 className="font-medium mb-2">Author</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm">Name</label>
                <MentionTextarea
                  onChange={(e) => handleNestedChange("author", "name", e)}
                  value={embed.author?.name}
                  maxLength={100}
                  style="w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors max-h-10 resize-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">URL</label>
                <MentionTextarea
                  onChange={(e) => handleNestedChange("author", "url", e)}
                  value={embed.author?.url}
                  maxLength={1000}
                  style="w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors max-h-10 resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm">Icon URL</label>
                <MentionTextarea
                  onChange={(e) => handleNestedChange("author", "icon_url", e)}
                  value={embed.author?.icon_url}
                  maxLength={1000}
                  style="w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors max-h-10 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex justify-between items-center bg-foreground-further p-4 rounded-lg">
              <h5 className="font-medium">Fields</h5>
              <button
                onClick={addField}
                disabled={embed.fields?.length >= 25}
                className="bg-primary/80 hover:bg-primary px-5 py-1 cursor-pointer rounded-2xl text-text-inverted disabled:opacity-50"
              >
                Add Field
              </button>
            </div>

            {embed.fields &&
              embed.fields.length &&
              embed.fields.map((field: any, fieldIndex: number) => (
                <div
                  key={fieldIndex}
                  className="p-3 bg-foreground-further rounded"
                >
                  <div className="flex justify-between">
                    <p className="text-text truncate font-bold">
                      Field #{fieldIndex + 1}{" "}
                      <span className="text-text/60">{field.name}</span>
                    </p>
                    <FaTrash
                      onClick={() => removeField(fieldIndex)}
                      className="text-text hover:text-primary cursor-pointer text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block mb-1 text-sm">Name</label>
                      <MentionTextarea
                        onChange={(e) => updateField(fieldIndex, "name", e)}
                        value={field.name}
                        maxLength={100}
                        style="w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors max-h-10 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Value</label>
                      <MentionTextarea
                        onChange={(e) => updateField(fieldIndex, "value", e)}
                        value={field.value}
                        channels={channels}
                        roles={roles}
                        maxLength={1000}
                        style="w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors h-10 min-h-10 resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <p>Inline</p>
                    <CheckboxInput
                      checked={field.inline}
                      onChange={(e) => updateField(fieldIndex, "inline", e)}
                    />
                  </div>
                </div>
              ))}
          </div>

          {/* Footer & Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-foreground-further rounded">
              <h5 className="font-medium mb-2">Footer</h5>
              <div className="mb-2">
                <label className="block mb-1 text-sm">Text</label>
                <MentionTextarea
                  onChange={(e) => handleNestedChange("footer", "text", e)}
                  value={embed.footer?.text}
                  maxLength={100}
                  style="w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors max-h-10 resize-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Icon URL</label>
                <MentionTextarea
                  onChange={(e) => handleNestedChange("footer", "icon_url", e)}
                  value={embed.footer?.icon_url}
                  maxLength={1000}
                  style="w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors max-h-10 resize-none"
                />
              </div>
            </div>
            <div className="p-3 bg-foreground-further rounded">
              <h5 className="font-medium mb-2">Images</h5>
              <div className="mb-2">
                <label className="block mb-1 text-sm">Thumbnail URL</label>
                <MentionTextarea
                  onChange={(e) => handleNestedChange("thumbnail", "url", e)}
                  value={embed.thumbnail?.url}
                  maxLength={1000}
                  style="w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors max-h-10 resize-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Image URL</label>
                <MentionTextarea
                  onChange={(e) => handleNestedChange("image", "url", e)}
                  value={embed.image?.url}
                  maxLength={1000}
                  style="w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors max-h-10 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Timestamp Section */}
          <div className="mt-4">
            <div className="flex gap-2">
              <p>Show Timestamp</p>
              <CheckboxInput
                checked={!!embed.timestamp}
                onChange={(e) => {
                  if (e) {
                    handleSetNow();
                  } else {
                    onChange(index, "timestamp", null);
                  }
                }}
              />
            </div>

            {embed.timestamp && (
              <div className="mt-2">
                <DateTimeInput
                  value={localTimestamp}
                  onChange={handleTimestampChange}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
