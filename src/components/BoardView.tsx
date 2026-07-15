import { useState } from "react";
import { ISSUE_STATUSES } from "../lib/constants";
import type { Issue } from "../server/db-schema";
import { deleteIssue, moveIssue } from "#/server/queries/issues";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function BoardView({
  issues,
  selectedIssueId,
  onIssueClick,
}: {
  issues: Issue[];
  selectedIssueId?: string;
  onIssueClick?: (issue: Issue) => void;
}) {
  const columns = ISSUE_STATUSES.map((status) => ({
    ...status,
    issues: issues
      .filter((i) => i.status === status.value)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  const queryClient = useQueryClient();

  const handleMove = useMutation({
    mutationFn: (data: {
      id: string;
      projectId: string;
      status:
        "backlog" | "todo" | "in_progress" | "in_review" | "done" | "cancelled";
    }) => moveIssue({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  return (
    <div className="flex gap-4 overflow-x-auto p-4 h-full">
      {columns.map((col) => (
        <div
          key={col.value}
          className="flex min-w-1/6 w-1/6 flex-col rounded-lg border border-zinc-800 bg-zinc-900/30"
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
              <>
                <div
                  key={issue.id}
                  // onClick={() => onIssueClick?.(issue)}
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
                  <IssueMoveButton
                    issue={issue}
                    onIssueMove={(data) =>
                      handleMove.mutate({
                        id: data.id,
                        projectId: data.projectId,
                        status: data.status,
                      })
                    }
                  />
                  <IssueButtons
                    issue={issue}
                    selectedIssueId={selectedIssueId}
                    onIssueClick={onIssueClick}
                  />
                </div>
              </>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const IssueButtons = ({
  issue,
  selectedIssueId,
  onIssueClick,
}: {
  issue: Issue;
  selectedIssueId?: string;
  onIssueClick?: (issue: Issue) => void;
}) => {
  const queryClient = useQueryClient();

  const [showDelete, setShowDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteIssue({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  return (
    <div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onIssueClick?.(issue);
          setShowDelete(true);
        }}
        className="text-sm text-zinc-500 mt-2 hover:text-zinc-300 transition-colors"
      >
        Delete
      </button>
      {showDelete && issue.id === selectedIssueId && (
        <div className="relative mt-2">
          <button
            onClick={() => {
              deleteMutation.mutate(issue.id);
              setShowDelete(false);
            }}
            className="rounded px-1 text-xs text-red-500 hover:bg-amber-500 hover:text-zinc-900 transition-colors italic"
          >
            Confirm
          </button>
          <span className="mx-2 text-sm">|</span>
          <button
            onClick={() => setShowDelete(false)}
            className="rounded px-1 text-xs text-red-500 hover:bg-amber-500 hover:text-zinc-900 transition-colors italic"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const IssueMoveButton = ({
  issue,
  onIssueMove,
}: {
  issue: Issue;
  onIssueMove: (issue: Issue) => void;
}) => {
  const nextStatusRight = () => {
    switch (issue.status) {
      case "backlog":
        return "todo";
      case "todo":
        return "in_progress";
      case "in_progress":
        return "in_review";
      case "in_review":
        return "done";
      case "done":
        return "cancelled";
      case "cancelled":
        return null;
    }
  };

  const nextStatusLeft = () => {
    switch (issue.status) {
      case "backlog":
        return null;
      case "todo":
        return "backlog";
      case "in_progress":
        return "todo";
      case "in_review":
        return "in_progress";
      case "done":
        return "in_review";
      case "cancelled":
        return "done";
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {issue.status !== "backlog" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIssueMove?.({
              ...issue,
              status: nextStatusLeft() as Issue["status"],
            });
          }}
          className="text-sm text-zinc-500 mt-2 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft />
        </button>
      )}
      {issue.status !== "cancelled" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIssueMove?.({
              ...issue,
              status: nextStatusRight() as Issue["status"],
            });
          }}
          className="text-sm text-zinc-500 mt-2 hover:text-zinc-300 transition-colors"
        >
          <ArrowRight />
        </button>
      )}
    </div>
  );
};
