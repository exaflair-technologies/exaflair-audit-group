import type { IssueStatus, Severity } from "@/data/audits";

// Plain module (no "use client") so server components can read these too.
export const severities: { key: Severity; label: string; short: string; bar: string; text: string; soft: string }[] = [
  { key: "critical", label: "Critical", short: "C", bar: "bg-sev-c", text: "text-sev-c", soft: "bg-sev-c/10" },
  { key: "high", label: "High", short: "H", bar: "bg-sev-h", text: "text-sev-h", soft: "bg-sev-h/10" },
  { key: "medium", label: "Medium", short: "M", bar: "bg-sev-m", text: "text-sev-m", soft: "bg-sev-m/10" },
  { key: "low", label: "Low", short: "L", bar: "bg-sev-l", text: "text-sev-l", soft: "bg-sev-l/10" },
  { key: "info", label: "Info", short: "I", bar: "bg-sev-i", text: "text-sev-i", soft: "bg-sev-i/10" },
];

export const severityStyle = (s: Severity) => severities.find((x) => x.key === s)!;

export const statusStyles: Record<IssueStatus, { label: string; cls: string }> = {
  resolved: { label: "Resolved", cls: "bg-ok/10 text-ok" },
  partial: { label: "Partially fixed", cls: "bg-sev-m/10 text-sev-m" },
  acknowledged: { label: "Acknowledged", cls: "bg-sev-i/10 text-sev-i" },
  open: { label: "Open", cls: "bg-sev-c/10 text-sev-c" },
};
