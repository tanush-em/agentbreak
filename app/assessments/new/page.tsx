import { prisma } from "@/lib/db";
import { attackModules } from "@/lib/security/attacks";
import { PageHeader } from "@/components/shared/page-header";
import { AssessmentConfigForm } from "@/components/assessments/config-form";

export const dynamic = "force-dynamic";

export default async function NewAssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ agent?: string }>;
}) {
  const { agent: agentParam } = await searchParams;
  const agents = await prisma.agent.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const attacks = attackModules.map((m) => ({
    id: m.id,
    name: m.name,
    mode: m.mode,
    description: m.description,
  }));

  return (
    <div className="p-6">
      <PageHeader
        title="Configure Assessment"
        description="Select target agent and attack categories to execute"
      />
      {agents.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Create an agent before launching an assessment.
        </div>
      ) : (
        <AssessmentConfigForm
          agents={agents}
          selectedAgentId={agentParam}
          attacks={attacks}
        />
      )}
    </div>
  );
}
