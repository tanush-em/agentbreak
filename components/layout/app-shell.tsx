import { Sidebar } from "@/components/layout/sidebar";
import { DemoBanner } from "@/components/layout/demo-banner";
import { isDemoMode } from "@/lib/openai/client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const demoMode = isDemoMode();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar demoMode={demoMode} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DemoBanner demoMode={demoMode} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
