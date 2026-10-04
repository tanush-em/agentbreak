import { PageHeader } from "@/components/shared/page-header";
import { AgentForm } from "@/components/agents/agent-form";

export default function NewAgentPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Create Agent"
        description="Define a target agent profile and its attack surface"
      />
      <AgentForm />
    </div>
  );
}
