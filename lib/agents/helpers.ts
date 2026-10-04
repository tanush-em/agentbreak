import { Agent } from "@prisma/client";
import { AgentProfile, AgentTool } from "@/lib/security/types";

export function parseAgent(agent: Agent): AgentProfile & {
  createdAt: Date;
  updatedAt: Date;
} {
  let tools: AgentTool[] = [];
  let knowledgeSources: string[] = [];
  try {
    tools = JSON.parse(agent.toolsJson);
  } catch {
    tools = [];
  }
  try {
    knowledgeSources = JSON.parse(agent.knowledgeSourcesJson);
  } catch {
    knowledgeSources = [];
  }
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    model: agent.model,
    systemPrompt: agent.systemPrompt,
    memoryEnabled: agent.memoryEnabled,
    tools,
    knowledgeSources,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  };
}
