import { attackCatalog } from "@/lib/security/attacks";
import { PageHeader } from "@/components/shared/page-header";
import { SeverityBadge } from "@/components/shared/severity-badge";

export default function AttackLibraryPage() {
  const groups = {
    REAL: attackCatalog.filter((a) => a.status === "REAL"),
    SIMULATED: attackCatalog.filter((a) => a.status === "SIMULATED"),
    COMING_SOON: attackCatalog.filter((a) => a.status === "COMING_SOON"),
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Attack Library"
        description="Supported attack categories and roadmap coverage"
      />

      {(
        [
          ["Implemented — Real", groups.REAL],
          ["Implemented — Simulated", groups.SIMULATED],
          ["Coming Soon", groups.COMING_SOON],
        ] as const
      ).map(([title, items]) => (
        <section key={title} className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            {title}
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((a) => (
              <div
                key={a.id}
                className="rounded-md border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium">{a.name}</h3>
                  <SeverityBadge value={a.status} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {a.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Coverage: {a.coverage}</span>
                  <span>{a.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
