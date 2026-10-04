import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseAgent } from "@/lib/agents/helpers";
import { PageHeader } from "@/components/shared/page-header";
import { AgentForm } from "@/components/agents/agent-form";

export const dynamic = "force-dynamic";

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raw = await prisma.agent.findUnique({ where: { id } });
  if (!raw) notFound();
  const agent = parseAgent(raw);

  return (
    <div className="p-6">
      <PageHeader
        title="Edit Agent"
        description={`Update configuration for ${agent.name}`}
      />
      <AgentForm
        agentId={agent.id}
        initial={{
          name: agent.name,
          description: agent.description,
          model: agent.model,
          systemPrompt: agent.systemPrompt,
          memoryEnabled: agent.memoryEnabled,
          tools: agent.tools,
          knowledgeSources: agent.knowledgeSources,
        }}
      />
    </div>
  );
}
