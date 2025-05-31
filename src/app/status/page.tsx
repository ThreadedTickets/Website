// app/status/page.tsx
"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

type MachineHealth = {
  name: string;
  lastUpdated: number;
  status: "online" | "unreachable";
  data?: {
    clusterId: number[];
    shardIds: number[];
    uptime: string;
    ram: number;
    cpu: number;
    guildCount: number;
  };
};

function formatShardRanges(shards: number[]): string {
  if (!shards.length) return "";
  const sorted = [...shards].sort((a, b) => a - b);
  const ranges: string[] = [];

  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}–${end}`);
      start = end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}–${end}`);
  return ranges.join(", ");
}

export default function StatusPage() {
  const [machines, setMachines] = useState<MachineHealth[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/bot-status");
        const data = await res.json();
        setMachines(data);
      } catch (e) {
        console.error("Failed to fetch bot status:", e);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-col">
        <p className="text-3xl font-bold">Threaded Status</p>
        <p>This updates automatically every minute</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {machines.map((m, i) => (
          <div
            key={i}
            className={clsx(
              "p-4 rounded-xl shadow border transition-all",
              m.status === "online"
                ? "border-green-400 bg-foreground"
                : "border-red-400 bg-foreground"
            )}
          >
            <div className="flex justify-between items-center">
              <div className="font-semibold text-lg">
                {m.name ?? "-"} | Cluster: {m.data?.clusterId ?? "N/A"}
              </div>
              <div
                className={clsx(
                  "text-sm font-medium px-2 py-1 rounded",
                  m.status === "online"
                    ? "bg-green-500 text-text"
                    : "bg-red-500 text-text"
                )}
              >
                {m.status.toUpperCase()}
              </div>
            </div>

            {m.status === "online" && m.data && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Shard IDs:</strong>{" "}
                  {formatShardRanges(m.data.shardIds)}
                </div>
                <div>
                  <strong>Uptime:</strong> {m.data.uptime}
                </div>
                <div>
                  <strong>Servers:</strong> {m.data.guildCount}
                </div>
                <div>
                  <strong>RAM:</strong> {m.data.ram.toFixed(1)} MB
                </div>
                <div>
                  <strong>CPU:</strong> {m.data.cpu.toFixed(1)}%
                </div>
                <div>
                  <strong>Last Updated:</strong>{" "}
                  {new Date(m.lastUpdated).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
