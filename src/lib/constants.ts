export const ISSUE_STATUSES = [
  { value: "backlog" as const, label: "Backlog", color: "#6b7280" },
  { value: "todo" as const, label: "Todo", color: "#a1a1aa" },
  { value: "in_progress" as const, label: "In Progress", color: "#facc15" },
  { value: "in_review" as const, label: "In Review", color: "#a78bfa" },
  { value: "done" as const, label: "Done", color: "#22c55e" },
  { value: "cancelled" as const, label: "Cancelled", color: "#6b7280" },
] as const;

export const ISSUE_PRIORITIES = [
  { value: "urgent" as const, label: "Urgent", color: "#ef4444", icon: "!!!" },
  { value: "high" as const, label: "High", color: "#f97316", icon: "!!" },
  { value: "medium" as const, label: "Medium", color: "#eab308", icon: "!" },
  { value: "low" as const, label: "Low", color: "#60a5fa", icon: "~" },
  { value: "none" as const, label: "No priority", color: "#71717a", icon: "" },
] as const;

export function getStatusConfig(status: string) {
  return ISSUE_STATUSES.find((s) => s.value === status) ?? ISSUE_STATUSES[0];
}

export function getPriorityConfig(priority: string) {
  return (
    ISSUE_PRIORITIES.find((p) => p.value === priority) ?? ISSUE_PRIORITIES[4]
  );
}
