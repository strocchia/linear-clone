import { getStatusConfig, getPriorityConfig } from "../lib/constants";
import type { Issue } from "../server/db-schema";

export function IssueRow({ issue }: { issue: Issue }) {
  const status = getStatusConfig(issue.status);
  const priority = getPriorityConfig(issue.priority);

  return (
    <div className="flex items-center gap-3 border-b border-zinc-800/50 px-4 py-2.5 hover:bg-zinc-800/30 transition-colors group">
      {/* Status icon */}
      <div
        className="flex h-5 w-5 items-center justify-center rounded-full border"
        style={{ borderColor: status.color + "60" }}
        title={status.label}
      >
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: status.color }}
        />
      </div>

      {/* Priority icon */}
      {priority.value !== "none" && (
        <span
          className="text-xs font-bold"
          style={{ color: priority.color }}
          title={priority.label}
        >
          {priority.icon}
        </span>
      )}

      {/* Issue identifier + title */}
      <span className="text-xs text-zinc-500 font-mono whitespace-nowrap">
        {issue.number}
      </span>
      <span className="flex-1 pl-2 truncate text-sm text-zinc-200 group-hover:text-zinc-100">
        {issue.title}
      </span>

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex gap-1">
          {issue.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 border border-zinc-700/50"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
