import { NextResponse } from "next/server";

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

// 💾 In-memory cache of all machines' health
const machineHealthCache: Record<string, MachineHealth> = {};

// 🧠 Define your cluster machine IPs here
const MACHINE_IPS = process.env.MACHINES?.split(",") ?? [];

const MACHINE_NAMES: Record<string, string> = (() => {
  try {
    return JSON.parse(process.env.MACHINE_NAMES || "{}");
  } catch {
    return {};
  }
})();

// Polling interval (ms)
const POLL_INTERVAL = 60000;

async function pollMachineHealth(machineIp: string) {
  try {
    const res = await fetch(`http://${machineIp}/api/health`, {
      headers: {
        authorization: `Bearer ${process.env["HEALTH_API_TOKEN"]}`,
      },
      //timeout: 3000,
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);

    const data = await res.json();

    machineHealthCache[MACHINE_NAMES[machineIp]] = {
      name: MACHINE_NAMES[machineIp],
      lastUpdated: Date.now(),
      status: "online",
      data: {
        clusterId: data.clusterId,
        shardIds: data.shardIds,
        uptime: data.uptime,
        ram: data.ramUsage, //in mb
        cpu: data.cpuUsage,
        guildCount: data.guildCount,
      },
    };
  } catch (err) {
    machineHealthCache[MACHINE_NAMES[machineIp]] = {
      name: MACHINE_NAMES[machineIp],
      lastUpdated: Date.now(),
      status: "unreachable",
    };
  }
}

if (!globalThis.__machineHealthPollerInitialized) {
  globalThis.__machineHealthPollerInitialized = true;

  setInterval(() => {
    MACHINE_IPS.forEach((ip) => {
      pollMachineHealth(ip);
    });
  }, POLL_INTERVAL);

  // Initial poll on boot
  MACHINE_IPS.forEach((ip) => pollMachineHealth(ip));
}

export async function GET() {
  return NextResponse.json(Object.values(machineHealthCache));
}
