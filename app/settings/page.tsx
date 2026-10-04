import { PageHeader } from "@/components/shared/page-header";
import { isDemoMode, getOpenAIModel } from "@/lib/openai/client";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const demo = isDemoMode();
  const model = getOpenAIModel();

  return (
    <div className="p-6">
      <PageHeader
        title="Settings"
        description="Local POC configuration"
      />

      <div className="mx-auto max-w-xl space-y-4">
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Execution Mode</div>
          <div className="mt-1 text-sm font-medium">
            {demo ? "Demo Mode" : "Live AI Tests"}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {demo
              ? "No OPENAI_API_KEY configured. Real attack modules use deterministic demo responses."
              : "OpenAI API key detected. Direct prompt injection and system prompt extraction run live."}
          </p>
        </div>

        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">OpenAI Model</div>
          <div className="font-mono-tech mt-1 text-sm">{model}</div>
          <p className="mt-2 text-xs text-muted-foreground">
            Configure via OPENAI_MODEL in .env
          </p>
        </div>

        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Database</div>
          <div className="mt-1 text-sm">SQLite (Prisma)</div>
          <p className="mt-2 text-xs text-muted-foreground">
            Local file database — no authentication required for this POC.
          </p>
        </div>

        <div className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
          Authentication, multi-tenancy, and team settings are out of scope for
          this portfolio POC.
        </div>
      </div>
    </div>
  );
}
