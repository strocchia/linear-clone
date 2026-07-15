import { Link, useLocation } from "@tanstack/react-router";
import { UserButton } from "@clerk/tanstack-react-start";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../server/queries/projects";
import {
  Inbox,
  FolderKanban,
  Plus,
  Search,
  Settings,
  Command,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="flex h-full w-60 flex-col border-r border-zinc-800 bg-zinc-900/50">
      {/* Header */}
      <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-3">
        <Link to="/">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-violet-600 text-[13px] font-bold text-white">
            L
          </div>
        </Link>
        <span className="text-sm font-semibold text-zinc-100">
          Linear Clone
        </span>
        <div className="ml-auto">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-6 w-6",
              },
            }}
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-2 pt-2">
        <button
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          onClick={() => {
            // TODO: open command palette
          }}
        >
          <Search className="h-4 w-4" />
          Search
          <span className="ml-auto flex items-center gap-0.5 text-[10px] text-zinc-500">
            <Command className="h-2.5 w-2.5" />K
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pt-2">
        <div className="mb-1">
          <SidebarLink
            to="/issues"
            icon={<Inbox className="h-4 w-4" />}
            label="My Issues"
            active={isActive("/issues")}
          />
        </div>

        <SidebarLink
          to="/projects"
          icon={<FolderKanban className="h-4 w-4" />}
          label="All Projects"
          active={isActive("/projects")}
        />

        {/* Projects */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Projects
            </span>
            <Link
              to="/projects"
              search={{ new: true }}
              className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>
          {projects.map((project) => (
            <SidebarLink
              key={project.id}
              to="/projects/$slug"
              params={{ slug: project.slug }}
              icon={<span className="text-sm">{project.icon}</span>}
              label={project.name}
              active={location.pathname.includes(project.slug)}
            />
          ))}
          {projects.length === 0 && (
            <p className="px-2 py-1 text-xs text-zinc-600">No projects yet</p>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800 px-2 py-2">
        <SidebarLink
          to="/settings"
          icon={<Settings className="h-4 w-4" />}
          label="Settings"
          active={isActive("/settings")}
        />
      </div>
    </aside>
  );
}

function SidebarLink({
  to,
  search,
  params,
  icon,
  label,
  active,
}: {
  to: string;
  search?: Record<string, string | boolean | undefined>;
  params?: Record<string, string>;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      search={search}
      params={params}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
        active
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
