"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Execution = {
  id: string;
  attackType: string;
  attackName: string;
  mode: string;
  status: string;
  severity: string | null;
  attackSuccess: number | null;
  confidence: number | null;
  evidence: string | null;
  payload: string | null;
  durationMs: number | null;
};

type Assessment = {
  id: string;
  status: string;
  securityScore: number | null;
  riskLevel: string | null;
  agent: { name: string };
  executions: Execution[];
};

function logLine(msg: string): string {
  const now = new Date();
  const ts = now.toLocaleTimeString("en-GB", { hour12: false });
  return `${ts} ${msg}`;
}

export function LiveRunner({
  assessmentId,
  initial,
}: {
  assessmentId: string;
  initial: Assessment;
}) {
  const router = useRouter();
  const [assessment, setAssessment] = useState(initial);
  const [logs, setLogs] = useState<string[]>(() => {
    const base = [logLine("Initializing assessment"), logLine("Loading attack modules")];
    if (initial.status === "QUEUED" || initial.status === "DRAFT") {
      base.push(logLine("Starting security assessment"));
    }
    return base;
  });
  const started = useRef(false);
  const seenStatus = useRef<Record<string, string>>({});
  const logEndRef = useRef<HTMLDivElement>(null);

  const pushLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, logLine(msg)]);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (
      initial.status === "QUEUED" ||
      initial.status === "DRAFT" ||
      initial.status === "RUNNING"
    ) {
      fetch(`/api/assessments/${assessmentId}/run`, { method: "POST" }).catch(
        () => pushLog("Failed to start assessment")
      );
    }
  }, [assessmentId, initial.status, pushLog]);

  useEffect(() => {
    if (assessment.status === "COMPLETED" || assessment.status === "FAILED") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/assessments/${assessmentId}`);
        if (!res.ok) return;
        const data: Assessment = await res.json();

        for (const exec of data.executions) {
          const prev = seenStatus.current[exec.id];
          if (prev !== exec.status) {
            seenStatus.current[exec.id] = exec.status;
            if (exec.status === "RUNNING") {
              pushLog(`Running ${exec.attackName.toLowerCase()}`);
            } else if (exec.status === "VULNERABLE") {
              pushLog(`Vulnerability detected — ${exec.attackName}`);
            } else if (exec.status === "RESISTED") {
              pushLog(`Attack resisted — ${exec.attackName}`);
            } else if (exec.status === "ERROR") {
              pushLog(`Error during ${exec.attackName}`);
            }
          }
        }

        setAssessment(data);

        if (data.status === "COMPLETED") {
          pushLog("Assessment complete — generating report");
          setTimeout(() => {
            router.push(`/assessments/${assessmentId}/report`);
          }, 1200);
        } else if (data.status === "FAILED") {
          pushLog("Assessment failed");
        }
      } catch {
        // ignore transient poll errors
      }
    }, 700);

    return () => clearInterval(interval);
  }, [assessment.status, assessmentId, pushLog, router]);

  const done = assessment.executions.filter((e) =>
    ["VULNERABLE", "RESISTED", "ERROR"].includes(e.status)
  ).length;
  const total = assessment.executions.length || 1;
  const pct = Math.round((done / total) * 100);

  const current =
    assessment.executions.find((e) => e.status === "RUNNING") ||
    [...assessment.executions]
      .reverse()
      .find((e) => ["VULNERABLE", "RESISTED", "ERROR"].includes(e.status)) ||
    assessment.executions[0];

  const statusIcon = useMemo(
    () => ({
      VULNERABLE: "✓",
      RESISTED: "✓",
      ERROR: "!",
      RUNNING: "→",
      QUEUED: "○",
    }),
    []
  );

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Security Assessment
        </div>
        <div className="mt-1 text-lg font-medium">{assessment.agent.name}</div>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>
              {done} / {total} attacks executed
            </span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-4">
          <div className="mb-3 text-sm font-medium">Attack Queue</div>
          <ul className="space-y-1.5">
            {assessment.executions.map((e) => (
              <li
                key={e.id}
                className={cn(
                  "flex items-center justify-between rounded px-2 py-1.5 text-sm",
                  e.status === "RUNNING" && "bg-muted/50"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono-tech w-3 text-muted-foreground">
                    {statusIcon[e.status as keyof typeof statusIcon] || "○"}
                  </span>
                  {e.attackName}
                </span>
                <SeverityBadge value={e.status} />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border border-border bg-card p-4">
          <div className="mb-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            Current Attack
          </div>
          {current ? (
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Attack</div>
                <div className="font-medium">{current.attackName}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Mode</div>
                  <SeverityBadge value={current.mode} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Result</div>
                  <SeverityBadge value={current.status} />
                </div>
              </div>
              {current.attackSuccess != null &&
                ["VULNERABLE", "RESISTED"].includes(current.status) && (
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Success Rate
                    </div>
                    <div className="tabular-nums">{current.attackSuccess}%</div>
                  </div>
                )}
              {current.payload && (
                <div>
                  <div className="text-xs text-muted-foreground">Payload</div>
                  <pre className="font-mono-tech mt-1 max-h-24 overflow-auto rounded border border-border bg-background p-2 text-[11px] whitespace-pre-wrap">
                    {current.payload.slice(0, 400)}
                  </pre>
                </div>
              )}
              {current.evidence && (
                <div>
                  <div className="text-xs text-muted-foreground">Evidence</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {current.evidence}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Waiting...</p>
          )}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <div className="mb-2 text-sm font-medium">Execution Log</div>
        <div className="font-mono-tech max-h-48 overflow-y-auto rounded border border-border bg-background p-3 text-[11px] leading-relaxed text-muted-foreground">
          {logs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
