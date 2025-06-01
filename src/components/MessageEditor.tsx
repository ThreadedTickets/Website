"use client";
import { useState, useRef, ChangeEvent, useEffect } from "react";
import MarkdownPreview from "./MarkdownPreview";
import EmbedEditor from "./EmbedEditor";
import EmbedPreview from "./EmbedPreview";
import MentionTextarea from "./Mentionables";
import Image from "next/image";
import { FiFile } from "react-icons/fi";
import ExportStatusOverlay from "./overlays/ExportOverlay";
import ExportButton from "./buttons/Export";

type Attachment = {
  id: string;
  file: File;
  url: string;
  type: string;
  // New fields for export
  name?: string;
  mimeType?: string;
  base64?: string;
};

export default function MessageEditor({ id }: { id: string }) {
  const [exportStatus, setExportStatus] = useState<
    "NULL" | "LOADING" | "SUCCESSFUL" | "ERROR"
  >("NULL");
  const [exportError, setExportError] = useState<string | null>(null);

  const [channels, setChannels] = useState<
    { id: string; name: string; type: number }[]
  >([]);
  const [roles, setRoles] = useState<
    { id: string; name: string; colour: string }[]
  >([]);
  const [server, setServer] = useState(null);

  const [message, setMessage] = useState({
    content:
      "Welcome to the Threaded message editor! After you have made your message, click on export and we will get it sent on over to your server!",
    embeds: [] as any[],
    attachments: [] as Attachment[],
    components: [] as any[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async (id: string) => {
    const res = await fetch(`/api/create/message/check?id=${id}`);
    if (!res.ok) throw new Error("Failed to fetch message");
    const data = await res.json();

    if (data.data) {
      setServer(data.data);
      setRoles(data.data.metadata.roles);
      setChannels(data.data.metadata.channels);
      if (data.data.existingMessage) {
        const message = { ...data.data.existingMessage };

        // Ensure `embeds` is an array and has at least X elements
        const X = 0; // or any other index you need
        if (Array.isArray(message.embeds) && message.embeds[X]) {
          message.embeds[X].fields = message.embeds[X].fields ?? [];
        }

        setMessage(message);
      }
    } else {
      setExportError(
        "Invalid editor, please use the Threaded create command for a valid link: Error 0002"
      );
      setExportStatus("ERROR");
    }
  };
  useEffect(() => {
    fetchData(id);
  }, [id]);

  const createEmptyEmbed = () => ({
    title: "New Embed",
    description: "",
    color: "#5865F2",
    fields: [],
    author: { name: "", url: "", icon_url: "" },
    footer: { text: "", icon_url: "" },
    thumbnail: { url: "" },
    image: { url: "" },
    timestamp: false,
  });

  const handleEmbedChange = (index: number, field: string, value: any) => {
    const updatedEmbeds = [...message.embeds];
    updatedEmbeds[index][field] = value;
    setMessage({ ...message, embeds: updatedEmbeds });
  };

  const addNewEmbed = () => {
    if (message.embeds.length < 10) {
      setMessage({
        ...message,
        embeds: [...message.embeds, createEmptyEmbed()],
      });
    }
  };

  const removeEmbed = (index: number) => {
    const updatedEmbeds = [...message.embeds];
    updatedEmbeds.splice(index, 1);
    setMessage({ ...message, embeds: updatedEmbeds });
  };

  // const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  //   if (!e.target.files?.length) return;

  //   const newAttachments = await Promise.all(
  //     Array.from(e.target.files).map(async (file) => {
  //       const base64 = await new Promise<string>((resolve, reject) => {
  //         const reader = new FileReader();
  //         reader.onload = () =>
  //           resolve((reader.result as string).split(",")[1]);
  //         reader.onerror = reject;
  //         reader.readAsDataURL(file);
  //       });

  //       return {
  //         id: Math.random().toString(36).substring(2, 9),
  //         file,
  //         url: URL.createObjectURL(file),
  //         type: file.type.startsWith("image/") ? "image" : "file",

  //         // For export
  //         name: file.name,
  //         mimeType: file.type,
  //         base64,
  //       };
  //     })
  //   );

  //   setMessage((prev) => ({
  //     ...prev,
  //     attachments: [...prev.attachments, ...newAttachments],
  //   }));

  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = "";
  //   }
  // };

  // const removeAttachment = (id: string) => {
  //   const attachmentToRemove = message.attachments.find((att) => att.id === id);
  //   if (attachmentToRemove) {
  //     URL.revokeObjectURL(attachmentToRemove.url);
  //   }
  //   setMessage({
  //     ...message,
  //     attachments: message.attachments.filter((att) => att.id !== id),
  //   });
  // };

  const handleExport = async () => {
    setExportStatus("LOADING");
    setExportError(null);

    try {
      const sanitizedAttachments = message.attachments.map((att) => ({
        id: att.id,
        name: att.name,
        mimeType: att.mimeType,
        base64: att.base64,
        type: att.type,
      }));

      const exportPayload = {
        ...message,
        attachments: sanitizedAttachments,
      };

      const res = await fetch(`/api/create/message/save?id=${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message =
          errorData?.message ||
          errorData?.error ||
          res.statusText ||
          "Unknown error occurred";
        throw new Error(message);
      }

      setExportStatus("SUCCESSFUL");
    } catch (err: any) {
      setExportStatus("ERROR");
      setExportError(err.message || "Something went wrong.");
    }
  };

  if (!server)
    return (
      <div className="flex items-center bg-background justify-center h-screnn">
        {exportStatus === "NULL" && (
          <span className="text-text">Loading message editor...</span>
        )}
        {exportStatus === "ERROR" && (
          <span className="text-text">{exportError}</span>
        )}
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      <ExportStatusOverlay
        error={exportError}
        setStatus={setExportStatus}
        status={exportStatus}
      />
      {/* Editor Panel */}
      <div className="flex-1 p-4 rounded-lg flex flex-col gap-4 h-full min-h-0 overflow-hidden">
        <div className="bg-midground rounded-lg p-4 overflow-visible flex flex-wrap gap-2 justify-between">
          <p className="font-extrabold text-3xl my-auto text-center">
            Message Editor
          </p>
          <div className="grow hidden lg:block" />
          <div className="my-auto flex gap-2">
            {/* <button
              className="bg-red-600 px-3 py-1 rounded cursor-pointer"
              onClick={clearMessage}
            >
              Clear
            </button> */}
            <ExportButton handleExport={handleExport} />
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto gap-4">
          <div
            id="message"
            className="bg-midground rounded-lg overflow-visible p-4"
          >
            {/* <p className="font-extrabold text-3xl">General Settings</p> */}
            <div className="grid grid-cols-1 my-2 gap-4">
              <div className="bg-foreground z-0 relative grid grid-cols-1 rounded-lg drop-shadow-2xl drop-shadow-midground/30 p-4">
                <div className="grow">
                  <p className="text-2xl font-bold">Message Content</p>
                </div>
                <MentionTextarea
                  onChange={(newValue) =>
                    setMessage({ ...message, content: newValue })
                  }
                  value={message.content}
                  placeholder="Type your message here (use @ or # to mention)"
                  channels={channels!}
                  roles={roles!}
                  maxLength={2000}
                  style="w-full py-1 px-2 bg-background text-white rounded border border-transparent focus:border-accent/30 transition-colors min-h-10"
                />
              </div>
            </div>
          </div>

          {/* Attachments
          <div className="mb-4 hidden">
            <label className="block mb-2 font-medium text-gray-300">
              Attachments
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
              accept="*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 px-3 py-2 rounded flex items-center gap-1 mb-2"
              disabled={message.attachments.length >= 4}
            >
              <FiUpload /> Upload Files
            </button>
            <div className="space-y-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-2 bg-[#40444b] rounded"
                >
                  <div className="flex items-center gap-2">
                    {attachment.type === "image" ? (
                      <FiImage className="text-gray-300" />
                    ) : (
                      <FiFile className="text-gray-300" />
                    )}
                    <span className="truncate max-w-xs">
                      {attachment.file.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          </div> */}

          {/* Embeds */}
          <div
            id="embeds"
            className="bg-midground rounded-lg overflow-visible p-4"
          >
            {/* <p className="font-extrabold text-3xl">General Settings</p> */}
            <div className="grid grid-cols-1 my-2 gap-4">
              <div className="bg-midground rounded-lg overflow-visible flex flex-wrap gap-2 justify-between">
                <p className="font-extrabold text-3xl my-auto text-center">
                  Embeds
                </p>
                <div className="grow hidden lg:block" />
                <div className="my-auto flex gap-2">
                  <button
                    onClick={addNewEmbed}
                    disabled={message.embeds.length >= 10}
                    className="bg-primary/90 cursor-pointer hover:bg-primary px-7 py-3 rounded-2xl text-text-inverted disabled:opacity-50"
                  >
                    Add Embed
                  </button>
                </div>
              </div>
            </div>
          </div>
          {message.embeds.length > 0 && (
            <div className="bg-midground rounded-lg overflow-visible p-4">
              <div className="space-y-4">
                {message.embeds.map((embed, index) => (
                  <EmbedEditor
                    key={index}
                    embed={embed}
                    index={index}
                    onChange={handleEmbedChange}
                    onRemove={removeEmbed}
                    channels={channels}
                    roles={roles}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 bg-background p-4 rounded-lg flex flex-col h-full min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 bg-[#2f3136] rounded-lg">
            {/* Simulated Discord message author */}
            <div className="flex items-start mb-1">
              <Image
                alt=""
                height={40}
                width={40}
                src={"/threaded.webp"}
                className="h-10 w-10 min-h-10 min-w-10 mr-3 rounded-full"
              />
              <div>
                <div className="flex items-baseline">
                  <span className="font-semibold text-white mr-2">
                    Threaded
                  </span>
                  <span className="text-xs text-gray-400">
                    Today at{" "}
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="text-gray-100">
                  <MarkdownPreview
                    content={message.content}
                    channels={channels}
                    roles={roles}
                  />

                  {/* Attachments preview */}
                  {message.attachments.length > 0 && (
                    <div className="mt-2">
                      {/* Image attachments grid */}
                      {message.attachments.some((a) => a.type === "image") && (
                        <div
                          className={`grid gap-2 mb-2 ${
                            message.attachments.filter(
                              (a) => a.type === "image"
                            ).length > 1
                              ? "grid-cols-2"
                              : "grid-cols-1"
                          }`}
                        >
                          {message.attachments
                            .filter((a) => a.type === "image")
                            .map((attachment) => (
                              <div
                                key={attachment.id}
                                className="relative group"
                              >
                                <img
                                  src={attachment.url}
                                  alt={attachment.file.name}
                                  className="rounded-md max-w-full max-h-60 object-contain"
                                />
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Non-image attachments */}
                      {message.attachments
                        .filter((a) => a.type !== "image")
                        .map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center p-2 bg-[#36393f] rounded-md mb-2"
                          >
                            <FiFile className="text-gray-400 mr-2 flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="text-blue-400 block truncate">
                                {attachment.file.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {attachment.file.size > 1024 * 1024
                                  ? `${(
                                      attachment.file.size /
                                      (1024 * 1024)
                                    ).toFixed(1)} MB`
                                  : `${Math.round(
                                      attachment.file.size / 1024
                                    )} KB`}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {message.embeds.map((embed, index) => (
                    <EmbedPreview
                      key={index}
                      embed={embed}
                      channels={channels}
                      roles={roles}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
