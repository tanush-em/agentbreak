"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SeverityBadge } from "@/components/shared/severity-badge";

export type FindingDetail = {
  id: string;
  title: string;
  severity: string;
  description: string;
  impact: string;
  recommendation: string;
  attackName?: string | null;
  attackType?: string | null;
  mode?: string | null;
  attackSuccess?: number | null;
  confidence?: number | null;
  payload?: string | null;
  evidence?: string | null;
  agentName?: string;
};

export function FindingDrawer({
  finding,
  open,
  onOpenChange,
}: {
  finding: FindingDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!finding) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-6 text-base">{finding.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <SeverityBadge value={finding.severity} />
            {finding.mode && <SeverityBadge value={finding.mode} />}
            {finding.attackName && (
              <span className="text-xs text-muted-foreground">
                {finding.attackName}
              </span>
            )}
          </div>

          <Field label="Execution Mode" value={finding.mode || "—"} />
          <Field label="Target" value={finding.agentName || "Agent"} />
          <Field
            label="Attack Objective"
            value={finding.attackName || finding.title}
          />

          {finding.payload && (
            <div>
              <div className="mb-1 text-xs text-muted-foreground">Payload</div>
              <pre className="font-mono-tech max-h-32 overflow-auto rounded border border-border bg-background p-2 text-[11px] whitespace-pre-wrap">
                {finding.payload}
              </pre>
            </div>
          )}

          <Field
            label="Observed Response / Evidence"
            value={finding.evidence || finding.description}
          />
          <Field label="Why It Matters / Impact" value={finding.impact} />
          <Field label="Remediation" value={finding.recommendation} />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Attack Success"
              value={
                finding.attackSuccess != null
                  ? `${finding.attackSuccess}%`
                  : "—"
              }
            />
            <Field
              label="Confidence"
              value={
                finding.confidence != null
                  ? `${Math.round(finding.confidence * 100)}%`
                  : "—"
              }
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            Execution Mode: {finding.mode || "UNKNOWN"} —{" "}
            {finding.mode === "REAL"
              ? "Executed via live/demo OpenAI adversarial prompts."
              : "Deterministic simulated result for demo reproducibility."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-0.5 text-xs text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
