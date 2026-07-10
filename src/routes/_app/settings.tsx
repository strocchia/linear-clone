import { createFileRoute } from "@tanstack/react-router";
import { UserButton } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-zinc-100 mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Account */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-5">
          <h2 className="text-sm font-semibold text-zinc-100 mb-4">
            Account
          </h2>
          <div className="flex items-center gap-4">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-12 w-12",
                },
              }}
            />
            <div>
              <p className="text-sm text-zinc-300">
                Manage your account settings
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Click your avatar to manage your profile
              </p>
            </div>
          </div>
        </section>

        {/* Keyboard shortcuts */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-5">
          <h2 className="text-sm font-semibold text-zinc-100 mb-4">
            Keyboard Shortcuts
          </h2>
          <div className="space-y-2">
            {[
              { key: "C", description: "Create new issue" },
              { key: "⌘ + K", description: "Open command palette" },
              { key: "G then I", description: "Go to My Issues" },
              { key: "G then P", description: "Go to Projects" },
            ].map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-sm text-zinc-400">
                  {shortcut.description}
                </span>
                <kbd className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 font-mono">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
