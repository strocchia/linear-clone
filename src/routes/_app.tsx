import { Outlet, createFileRoute } from "@tanstack/react-router";
import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import Sidebar from "../components/Sidebar";

const authCheck = createServerFn({ method: "GET" }).handler(async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/sign-in" },
    });
  }
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
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
