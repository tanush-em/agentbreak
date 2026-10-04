import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { parseAgent } from "@/lib/agents/helpers";
import { PageHeader } from "@/components/shared/page-header";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await prisma.agent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assessments: {
        where: { status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Agents"
        description="Target agent profiles and their security posture"
        actions={
          <Link
            href="/agents/new"
            className={cn(buttonVariants({ size: "sm" }), "inline-flex gap-1.5")}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Agent
          </Link>
        }
      />

      {agents.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No agents yet.</p>
          <Link
            href="/agents/new"
            className={cn(buttonVariants({ size: "sm" }), "mt-4 inline-flex")}
          >
            Create your first agent
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((raw) => {
            const agent = parseAgent(raw);
            const last = raw.assessments[0];
            return (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="rounded-md border border-border bg-card p-4 transition-colors hover:border-muted-foreground/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{agent.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {agent.description}
                    </p>
                  </div>
                  {last?.riskLevel && <SeverityBadge value={last.riskLevel} />}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Model</div>
                    <div className="font-mono-tech mt-0.5">{agent.model}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Security Score</div>
                    <div className="mt-0.5 tabular-nums">
                      {last?.securityScore ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tools</div>
                    <div className="mt-0.5">{agent.tools.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Memory</div>
                    <div className="mt-0.5">
                      {agent.memoryEnabled ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
                  Last assessment:{" "}
                  {last ? formatDate(last.completedAt) : "Never"}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
