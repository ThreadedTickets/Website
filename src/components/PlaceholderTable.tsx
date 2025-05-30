"use client";
import React, { useState } from "react";

export interface Placeholder {
  key: string;
  description: string;
}

interface PlaceholderTableProps {
  placeholders: Placeholder[];
}

export default function PlaceholderTable({
  placeholders,
}: PlaceholderTableProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(`{${text}}`);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500); // Hide popup after 1s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-foreground">
      <table className="text-sm text-left table-auto">
        <thead className="bg-midground">
          <tr>
            <th className="px-4 py-2 font-semibold text-text whitespace-nowrap">
              Placeholder
            </th>
            <th className="px-4 py-2 font-semibold text-text w-full">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-foreground">
          {placeholders.map((placeholder) => (
            <tr key={placeholder.key} className="relative">
              <td
                className="px-4 py-2 font-mono text-accent cursor-pointer whitespace-nowrap hover:underline relative"
                onClick={() =>
                  copyToClipboard(placeholder.key, placeholder.key)
                }
              >
                {placeholder.key}
                {copiedKey === placeholder.key && (
                  <span className="absolute top-0 left-full ml-2 px-2 py-0.5 text-xs bg-secondary text-white rounded shadow animate-fade">
                    Copied!
                  </span>
                )}
              </td>
              <td className="px-4 py-2 text-text">{placeholder.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tailwind animation */}
      <style jsx>{`
        .animate-fade {
          animation: fadeout 3s ease-out forwards;
        }
        @keyframes fadeout {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
