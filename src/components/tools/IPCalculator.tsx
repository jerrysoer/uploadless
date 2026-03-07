"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Network, Copy, Check } from "lucide-react";
import ToolPageHeader from "@/components/tools/ToolPageHeader";
import { trackEvent } from "@/lib/analytics";

/* -- Helpers -------------------------------------- */

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!) >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
}

function prefixToMask(prefix: number): number {
  if (prefix === 0) return 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

function maskToPrefix(mask: number): number {
  let count = 0;
  let m = mask;
  while (m & 0x80000000) {
    count++;
    m = (m << 1) >>> 0;
  }
  return count;
}

function getIpClass(firstOctet: number): string {
  if (firstOctet < 128) return "A";
  if (firstOctet < 192) return "B";
  if (firstOctet < 224) return "C";
  if (firstOctet < 240) return "D (Multicast)";
  return "E (Reserved)";
}

function isPrivate(ip: number): boolean {
  const first = (ip >>> 24) & 0xff;
  const second = (ip >>> 16) & 0xff;
  if (first === 10) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  return false;
}

interface SubnetResult {
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  wildcardMask: string;
  firstUsable: string;
  lastUsable: string;
  usableHosts: number;
  totalAddresses: number;
  ipClass: string;
  isPrivate: boolean;
  cidr: string;
  binaryMask: string;
}

function calculateSubnet(ip: string, prefix: number): SubnetResult | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  for (const p of parts) {
    const n = Number(p);
    if (isNaN(n) || n < 0 || n > 255) return null;
  }
  if (prefix < 0 || prefix > 32) return null;

  const ipInt = ipToInt(ip);
  const mask = prefixToMask(prefix);
  const wildcard = (~mask) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;

  const usableHosts = prefix <= 30 ? Math.pow(2, 32 - prefix) - 2 : prefix === 31 ? 2 : 1;
  const totalAddresses = Math.pow(2, 32 - prefix);

  const firstOctet = (ipInt >>> 24) & 0xff;

  const binaryMask = Array.from({ length: 32 }, (_, i) => (mask >>> (31 - i)) & 1)
    .join("")
    .replace(/(.{8})/g, "$1.")
    .slice(0, -1);

  return {
    networkAddress: intToIp(network),
    broadcastAddress: intToIp(broadcast),
    subnetMask: intToIp(mask),
    wildcardMask: intToIp(wildcard),
    firstUsable: prefix <= 30 ? intToIp(network + 1) : intToIp(network),
    lastUsable: prefix <= 30 ? intToIp(broadcast - 1) : intToIp(broadcast),
    usableHosts: Math.max(usableHosts, 0),
    totalAddresses,
    ipClass: getIpClass(firstOctet),
    isPrivate: isPrivate(ipInt),
    cidr: `${intToIp(network)}/${prefix}`,
    binaryMask,
  };
}

function parseCidr(input: string): { ip: string; prefix: number } | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
  if (!match) return null;
  return { ip: match[1]!, prefix: parseInt(match[2]!, 10) };
}

/* -- Presets -------------------------------------- */

const PRESETS = [
  { label: "/8 (Class A)", cidr: "10.0.0.0/8" },
  { label: "/16 (Class B)", cidr: "172.16.0.0/16" },
  { label: "/24 (Class C)", cidr: "192.168.1.0/24" },
  { label: "/28 (16 hosts)", cidr: "192.168.1.0/28" },
  { label: "/30 (P2P link)", cidr: "10.0.0.0/30" },
  { label: "/32 (single host)", cidr: "10.0.0.1/32" },
];

/* -- Component ------------------------------------ */

export default function IPCalculator() {
  const [cidrInput, setCidrInput] = useState("192.168.1.0/24");
  const [ipInput, setIpInput] = useState("192.168.1.0");
  const [maskInput, setMaskInput] = useState("255.255.255.0");
  const [mode, setMode] = useState<"cidr" | "separate">("cidr");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("tool_opened", { tool: "ip_calc" });
  }, []);

  const result = useMemo<SubnetResult | null>(() => {
    if (mode === "cidr") {
      const parsed = parseCidr(cidrInput);
      if (!parsed) return null;
      return calculateSubnet(parsed.ip, parsed.prefix);
    } else {
      const maskInt = ipToInt(maskInput);
      const prefix = maskToPrefix(maskInt);
      return calculateSubnet(ipInput, prefix);
    }
  }, [mode, cidrInput, ipInput, maskInput]);

  const copyValue = useCallback(async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    trackEvent("tool_used", { tool: "ip_calc", action: "copy" });
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const applyPreset = useCallback((cidr: string) => {
    setCidrInput(cidr);
    setMode("cidr");
    trackEvent("tool_used", { tool: "ip_calc", action: "preset" });
  }, []);

  const CopyBtn = ({ value, field }: { value: string; field: string }) => (
    <button
      onClick={() => copyValue(value, field)}
      className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors shrink-0"
      title={`Copy ${field}`}
    >
      {copiedField === field ? (
        <Check className="w-3.5 h-3.5 text-grade-a" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-text-tertiary" />
      )}
    </button>
  );

  const rows: { label: string; value: string; field: string }[] = result
    ? [
        { label: "Network Address", value: result.networkAddress, field: "network" },
        { label: "Broadcast Address", value: result.broadcastAddress, field: "broadcast" },
        { label: "Subnet Mask", value: result.subnetMask, field: "mask" },
        { label: "Wildcard Mask", value: result.wildcardMask, field: "wildcard" },
        { label: "First Usable Host", value: result.firstUsable, field: "first" },
        { label: "Last Usable Host", value: result.lastUsable, field: "last" },
        { label: "Usable Hosts", value: result.usableHosts.toLocaleString(), field: "hosts" },
        { label: "Total Addresses", value: result.totalAddresses.toLocaleString(), field: "total" },
        { label: "IP Class", value: result.ipClass, field: "class" },
        { label: "Private Address", value: result.isPrivate ? "Yes" : "No", field: "private" },
        { label: "CIDR Notation", value: result.cidr, field: "cidr" },
        { label: "Binary Mask", value: result.binaryMask, field: "binary" },
      ]
    : [];

  return (
    <div>
      <ToolPageHeader
        icon={Network}
        title="IP / Subnet Calculator"
        description="Calculate subnet details from CIDR notation or IP + mask. Get network range, usable hosts, broadcast address, and more."
      />

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("cidr")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            mode === "cidr"
              ? "bg-accent text-accent-fg"
              : "bg-bg-elevated text-text-secondary hover:text-text-primary border border-border"
          }`}
        >
          CIDR Notation
        </button>
        <button
          onClick={() => setMode("separate")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            mode === "separate"
              ? "bg-accent text-accent-fg"
              : "bg-bg-elevated text-text-secondary hover:text-text-primary border border-border"
          }`}
        >
          IP + Mask
        </button>
      </div>

      {/* Input */}
      {mode === "cidr" ? (
        <div className="mb-6">
          <label className="block text-xs text-text-tertiary mb-1.5 font-medium uppercase tracking-wider">
            CIDR Notation
          </label>
          <input
            type="text"
            value={cidrInput}
            onChange={(e) => setCidrInput(e.target.value)}
            placeholder="192.168.1.0/24"
            className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50"
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs text-text-tertiary mb-1.5 font-medium uppercase tracking-wider">
              IP Address
            </label>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="192.168.1.0"
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50"
              spellCheck={false}
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1.5 font-medium uppercase tracking-wider">
              Subnet Mask
            </label>
            <input
              type="text"
              value={maskInput}
              onChange={(e) => setMaskInput(e.target.value)}
              placeholder="255.255.255.0"
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {result ? (
        <div className="bg-bg-surface border border-border rounded-xl divide-y divide-border mb-6">
          {rows.map((row) => (
            <div key={row.field} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-text-secondary">{row.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-text-primary">{row.value}</span>
                <CopyBtn value={row.value} field={row.field} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-bg-surface border border-border rounded-xl px-4 py-8 text-center mb-6">
          <p className="text-sm text-text-tertiary">
            Enter a valid CIDR notation (e.g., 192.168.1.0/24) or IP + subnet mask to see results.
          </p>
        </div>
      )}

      {/* Presets */}
      <div className="bg-bg-surface border border-border rounded-xl p-5">
        <h2 className="font-heading font-semibold text-sm mb-3">Common Subnets</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.cidr}
              onClick={() => applyPreset(preset.cidr)}
              className={`flex flex-col items-start px-3 py-2 rounded-lg text-sm transition-colors ${
                cidrInput === preset.cidr && mode === "cidr"
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "bg-bg-elevated border border-border hover:border-border-hover"
              }`}
            >
              <span className="font-mono font-semibold">{preset.cidr}</span>
              <span className="text-xs text-text-tertiary">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
