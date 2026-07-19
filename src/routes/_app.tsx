import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { ensureUser } from "#/server/queries/projects";
import { SidebarProvider, SidebarTrigger } from "#/components/ui/sidebar";
import AppSidebar from "#/components/AppSidebar";

const authCheck = createServerFn({ method: "GET" }).handler(async () => {
  const { userId } = await auth();
  if (!userId) {
    throw redirect({ to: "/sign-in/$" });
  }
  // Sync Clerk user data into our database if needed
  await ensureUser();
  return { userId };
});

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    await authCheck();
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "14rem",
            "--sidebar-width-mobile": "20rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}
