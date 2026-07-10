import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllIssues } from "../../server/queries/issues";
import { IssueRow } from "../../components/IssueRow";
import { Plus } from "lucide-react";
import { CreateIssueDialog } from "../../components/CreateIssueDialog";

export const Route = createFileRoute("/_app/issues")({
  component: IssuesPage,
});

function IssuesPage() {
  const [showCreate, setShowCreate] = useState(false);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["issues", "all"],
    queryFn: () => getAllIssues(),
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">My Issues</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {issues.length} issue{issues.length !== 1 ? "s" : ""} across all
            projects
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Issue
        </button>
      </div>

      {/* Issues list */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/30">
        {/* Table header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          <div className="w-0" />
          <div className="w-2" />
          <div className="w-8">ID</div>
          <div className="flex-1">Title</div>
          <div>Labels</div>
        </div>

        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-zinc-500">
            Loading issues...
          </div>
        ) : issues.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-zinc-400">No issues yet</p>
            <p className="text-xs text-zinc-600 mt-1">
              Create a project and add issues to get started
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 inline-flex items-center gap-1 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Issue
            </button>
          </div>
        ) : (
          issues.map((issue) => <IssueRow key={issue.id} issue={issue} />)
        )}
      </div>

      <CreateIssueDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
