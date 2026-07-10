import { ISSUE_STATUSES } from "../lib/constants";
import type { Issue } from "../server/db-schema";

export function BoardView({
  issues,
  onIssueClick,
}: {
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
}) {
  const columns = ISSUE_STATUSES.map((status) => ({
    ...status,
    issues: issues
      .filter((i) => i.status === status.value)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  return (
    <div className="flex gap-4 overflow-x-auto p-4 h-full">
      {columns.map((col) => (
        <div
          key={col.value}
          className="flex min-w-[280px] w-[280px] flex-col rounded-lg border border-zinc-800 bg-zinc-900/30"
        >
          {/* Column header */}
          <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2.5">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: col.color }}
            />
            <span className="text-xs font-semibold text-zinc-300">
              {col.label}
            </span>
            <span className="ml-auto text-xs text-zinc-500">
              {col.issues.length}
            </span>
          </div>

          {/* Issues */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {col.issues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => onIssueClick?.(issue)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-left hover:border-zinc-700 hover:bg-zinc-800/80 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {issue.number}
                  </span>
                </div>
                <p className="text-sm text-zinc-200 leading-snug">
                  {issue.title}
                </p>
                {issue.labels && issue.labels.length > 0 && (
                  <div className="mt-1.5 flex gap-1">
                    {issue.labels.slice(0, 2).map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
