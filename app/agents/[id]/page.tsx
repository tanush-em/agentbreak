import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { parseAgent } from "@/lib/agents/helpers";
import { PageHeader } from "@/components/shared/page-header";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { ScoreRing } from "@/components/shared/score-ring";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raw = await prisma.agent.findUnique({
    where: { id },
    include: {
      assessments: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { findings: true } } },
      },
    },
  });

  if (!raw) notFound();

  const agent = parseAgent(raw);
  const last = raw.assessments.find((a) => a.status === "COMPLETED");

  return (
    <div className="p-6">
      <PageHeader
        title={agent.name}
        description={agent.description}
        actions={
          <>
            <Link
              href={`/agents/${agent.id}/edit`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "inline-flex gap-1.5"
              )}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
            <Link
              href={`/assessments/new?agent=${agent.id}`}
              className={cn(buttonVariants({ size: "sm" }), "inline-flex gap-1.5")}
            >
              <Play className="h-3.5 w-3.5" />
              Run Security Assessment
            </Link>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-4 rounded-md border border-border bg-card p-4 sm:col-span-1">
          <ScoreRing score={last?.securityScore ?? 0} size={72} />
          <div>
            <div className="text-xs text-muted-foreground">Security Score</div>
            {last?.riskLevel ? (
              <div className="mt-1">
                <SeverityBadge value={last.riskLevel} />
              </div>
            ) : (
              <div className="mt-1 text-sm text-muted-foreground">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Model</div>
          <div className="font-mono-tech mt-1 text-sm">{agent.model}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Tools</div>
          <div className="mt-1 text-sm">{agent.tools.length} configured</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Last Assessment</div>
          <div className="mt-1 text-sm">
            {last ? formatDate(last.completedAt) : "Never"}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="history">Assessment History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="rounded-md border border-border bg-card p-4 text-sm">
            <p className="text-muted-foreground">{agent.description}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Attack surface: </span>
                Prompt layer, {agent.tools.length} tools
                {agent.memoryEnabled ? ", memory" : ""},{" "}
                {agent.knowledgeSources.length} knowledge sources
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="instructions" className="mt-4">
          <pre className="font-mono-tech overflow-x-auto rounded-md border border-border bg-card p-4 text-xs whitespace-pre-wrap">
            {agent.systemPrompt}
          </pre>
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          <div className="space-y-2">
            {agent.tools.length === 0 && (
              <p className="text-sm text-muted-foreground">No tools configured.</p>
            )}
            {agent.tools.map((t) => (
              <div
                key={t.name}
                className="rounded-md border border-border bg-card px-4 py-3"
              >
                <div className="font-mono-tech text-sm">{t.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {t.description}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-4">
          <div className="flex flex-wrap gap-2">
            {agent.knowledgeSources.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No knowledge sources configured.
              </p>
            )}
            {agent.knowledgeSources.map((k) => (
              <span
                key={k}
                className="rounded border border-border bg-card px-2.5 py-1 font-mono-tech text-xs"
              >
                {k}
              </span>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="memory" className="mt-4">
          <div className="rounded-md border border-border bg-card p-4 text-sm">
            Memory is{" "}
            <span className="font-medium">
              {agent.memoryEnabled ? "enabled" : "disabled"}
            </span>{" "}
            for this agent.
            {agent.memoryEnabled && (
              <p className="mt-2 text-muted-foreground">
                Persistent memory increases exposure to memory poisoning attacks.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Score</th>
                  <th className="px-3 py-2 font-medium">Risk</th>
                  <th className="px-3 py-2 font-medium">Findings</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {raw.assessments.map((a) => (
                  <tr key={a.id} className="border-b border-border/60">
                    <td className="px-3 py-2">
                      <Link
                        href={
                          a.status === "COMPLETED"
                            ? `/assessments/${a.id}/report`
                            : `/assessments/${a.id}/run`
                        }
                        className="hover:underline"
                      >
                        {formatDate(a.completedAt || a.createdAt)}
                      </Link>
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {a.securityScore ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      {a.riskLevel ? (
                        <SeverityBadge value={a.riskLevel} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {a._count.findings}
                    </td>
                    <td className="px-3 py-2">
                      <SeverityBadge value={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
