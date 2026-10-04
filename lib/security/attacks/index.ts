import { directPromptInjection } from "./direct-prompt-injection";
import { systemPromptExtraction } from "./system-prompt-extraction";
import {
  dataExfiltration,
  indirectPromptInjection,
  mcpManipulation,
  memoryPoisoning,
  privilegeEscalation,
  toolAbuse,
} from "./simulated";
import {
  AttackCatalogEntry,
  AttackCategory,
  AttackModule,
} from "@/lib/security/types";

export const attackModules: AttackModule[] = [
  directPromptInjection,
  systemPromptExtraction,
  indirectPromptInjection,
  toolAbuse,
  privilegeEscalation,
  dataExfiltration,
  memoryPoisoning,
  mcpManipulation,
];

export const attackModuleMap = Object.fromEntries(
  attackModules.map((m) => [m.id, m])
) as Record<AttackCategory, AttackModule>;

export function getAttackModules(ids?: string[]): AttackModule[] {
  if (!ids || ids.length === 0) return attackModules;
  return attackModules.filter((m) => ids.includes(m.id));
}

export const attackCatalog: AttackCatalogEntry[] = [
  {
    id: "direct_prompt_injection",
    name: "Direct Prompt Injection",
    description:
      "Tests whether an agent can be manipulated into ignoring higher-priority instructions.",
    coverage: "Prompt Layer",
    status: "REAL",
    category: "Prompt Attacks",
  },
  {
    id: "system_prompt_extraction",
    name: "System Prompt Extraction",
    description:
      "Attempts to extract protected system instructions using multiple strategies.",
    coverage: "Prompt Layer",
    status: "REAL",
    category: "Prompt Attacks",
  },
  {
    id: "indirect_prompt_injection",
    name: "Indirect Prompt Injection",
    description:
      "Malicious content arriving through retrieved documents, web pages, or knowledge bases.",
    coverage: "Knowledge Retrieval Layer",
    status: "SIMULATED",
    category: "Prompt Attacks",
  },
  {
    id: "tool_abuse",
    name: "Tool Abuse",
    description:
      "Induce unauthorized or excessive use of available agent tools.",
    coverage: "Tool Layer",
    status: "SIMULATED",
    category: "Tool Security",
  },
  {
    id: "privilege_escalation",
    name: "Privilege Escalation",
    description:
      "Low-privilege users attempt to make the agent perform privileged actions.",
    coverage: "Authorization Layer",
    status: "SIMULATED",
    category: "Authorization",
  },
  {
    id: "data_exfiltration",
    name: "Data Exfiltration",
    description:
      "Extraction of internal documents, customer information, secrets, or hidden context.",
    coverage: "Data Layer",
    status: "SIMULATED",
    category: "Data Security",
  },
  {
    id: "memory_poisoning",
    name: "Memory Poisoning",
    description:
      "Malicious instructions persisted into long-term memory influencing future behavior.",
    coverage: "Memory Layer",
    status: "SIMULATED",
    category: "Memory Security",
  },
  {
    id: "mcp_manipulation",
    name: "MCP Tool Manipulation",
    description:
      "Risks around malicious or over-privileged MCP tools.",
    coverage: "MCP / Tool Protocol Layer",
    status: "SIMULATED",
    category: "MCP Security",
  },
  // Coming soon / roadmap
  {
    id: "excessive_agency",
    name: "Excessive Agency",
    description:
      "Detect agents that take high-impact actions beyond user intent.",
    coverage: "Agency Layer",
    status: "COMING_SOON",
    category: "Agency",
  },
  {
    id: "context_poisoning",
    name: "Context Poisoning",
    description:
      "Corrupt shared context windows across sessions or agents.",
    coverage: "Context Layer",
    status: "COMING_SOON",
    category: "Context",
  },
  {
    id: "infinite_loop",
    name: "Infinite Loop / Resource Exhaustion",
    description:
      "Induce unbounded tool loops or context growth to exhaust resources.",
    coverage: "Runtime Layer",
    status: "COMING_SOON",
    category: "Availability",
  },
  {
    id: "cost_amplification",
    name: "Cost Amplification",
    description:
      "Force expensive model/tool chains to inflate operational cost.",
    coverage: "Economic Layer",
    status: "COMING_SOON",
    category: "Availability",
  },
  {
    id: "cross_agent_attacks",
    name: "Cross-Agent Attacks",
    description:
      "Abuse inter-agent messaging to pivot across agent boundaries.",
    coverage: "Multi-Agent Layer",
    status: "COMING_SOON",
    category: "Multi-Agent",
  },
  {
    id: "tool_chain_attacks",
    name: "Tool Chain Attacks",
    description:
      "Chain legitimate tools into an unintended harmful workflow.",
    coverage: "Tool Layer",
    status: "COMING_SOON",
    category: "Tool Security",
  },
  {
    id: "a2a_privilege_escalation",
    name: "Agent-to-Agent Privilege Escalation",
    description:
      "Escalate privileges by exploiting trust between collaborating agents.",
    coverage: "Multi-Agent Layer",
    status: "COMING_SOON",
    category: "Multi-Agent",
  },
  {
    id: "persistent_prompt_injection",
    name: "Persistent Prompt Injection",
    description:
      "Injections that survive across sessions via memory or stored artifacts.",
    coverage: "Persistence Layer",
    status: "COMING_SOON",
    category: "Persistence",
  },
];
