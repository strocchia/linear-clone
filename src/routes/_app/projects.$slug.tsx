import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProjectBySlug } from "../../server/queries/projects";
import { getIssuesByProject } from "../../server/queries/issues";
import { IssueRow } from "../../components/IssueRow";
import { BoardView } from "../../components/BoardView";
import { CreateIssueDialog } from "../../components/CreateIssueDialog";
import { Plus, LayoutList, LayoutGrid } from "lucide-react";

export const Route = createFileRoute("/_app/projects/$slug")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { slug } = Route.useParams();
  const [view, setView] = useState<"board" | "list">("board");
  const [showCreate, setShowCreate] = useState(false);
  const [, setSelectedIssueId] = useState<string | null>(null);

  const { data: project } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => getProjectBySlug({ data: { slug } }),
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["issues", "project", project?.id],
    queryFn: () =>
      project ? getIssuesByProject({ data: { projectId: project.id } }) : [],
    enabled: !!project,
  });

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-zinc-500">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Project header */}
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{project.icon}</span>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-xs text-zinc-500 mt-0.5">
                {project.description}
              </p>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/50 p-0.5">
              <button
                onClick={() => setView("list")}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  view === "list"
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <LayoutList className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setView("board")}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  view === "board"
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Issue
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {view === "list" ? (
        <div className="flex-1 overflow-y-auto">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 mx-6 my-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <div className="w-0" />
              <div className="w-2" />
              <div className="w-8">ID</div>
              <div className="flex-1">Title</div>
              <div>Labels</div>
            </div>
            {issues.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-zinc-400">
                  No issues in this project
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
                >
                  <Plus className="h-3 w-3" />
                  Create one
                </button>
              </div>
            ) : (
              issues.map((issue) => <IssueRow key={issue.id} issue={issue} />)
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <BoardView
            issues={issues}
            onIssueClick={(issue) => setSelectedIssueId(issue.id)}
          />
        </div>
      )}

      <CreateIssueDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        defaultProjectId={project.id}
      />
    </div>
  );
}
