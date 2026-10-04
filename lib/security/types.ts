export type AttackMode = "REAL" | "SIMULATED";
export type AttackStatus = "VULNERABLE" | "RESISTED" | "ERROR";
export type ExecutionStatus =
  | "QUEUED"
  | "RUNNING"
  | "VULNERABLE"
  | "RESISTED"
  | "ERROR";
export type AssessmentStatus =
  | "DRAFT"
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SECURE";

export type AttackCategory =
  | "direct_prompt_injection"
  | "system_prompt_extraction"
  | "indirect_prompt_injection"
  | "tool_abuse"
  | "privilege_escalation"
  | "data_exfiltration"
  | "memory_poisoning"
  | "mcp_manipulation";

export interface AgentTool {
  name: string;
  description: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  memoryEnabled: boolean;
  tools: AgentTool[];
  knowledgeSources: string[];
}

export interface AttackContext {
  assessmentId: string;
  demoMode: boolean;
}

export interface AttackResult {
  status: AttackStatus;
  confidence: number;
  evidence: string;
  attackSuccess: number;
  severity: Severity;
  payload: string;
  mode: AttackMode;
  durationMs: number;
}

export interface AttackModule {
  id: AttackCategory;
  name: string;
  category: AttackCategory;
  mode: AttackMode;
  description: string;
  coverage: string;
  execute(target: AgentProfile, context: AttackContext): Promise<AttackResult>;
}

export interface AttackCatalogEntry {
  id: string;
  name: string;
  description: string;
  coverage: string;
  status: "REAL" | "SIMULATED" | "COMING_SOON";
  category: string;
}

export const SEVERITY_WEIGHTS: Record<Severity, number> = {
  CRITICAL: 40,
  HIGH: 25,
  MEDIUM: 15,
  LOW: 5,
  INFO: 0,
};
