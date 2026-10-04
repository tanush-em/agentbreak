"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/shared/severity-badge";

type AttackOption = {
  id: string;
  name: string;
  mode: "REAL" | "SIMULATED";
  description: string;
};

export function AssessmentConfigForm({
  agents,
  selectedAgentId,
  attacks,
}: {
  agents: { id: string; name: string }[];
  selectedAgentId?: string;
  attacks: AttackOption[];
}) {
  const router = useRouter();
  const [agentId, setAgentId] = useState(selectedAgentId || agents[0]?.id || "");
  const [selected, setSelected] = useState<string[]>(attacks.map((a) => a.id));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function launch() {
    if (!agentId || selected.length === 0) {
      setError("Select an agent and at least one attack category.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, attackTypes: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create assessment");
        setLoading(false);
        return;
      }
      router.push(`/assessments/${data.id}/run`);
    } catch {
      setError("Failed to create assessment");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-md border border-border bg-card p-4">
        <label className="text-xs text-muted-foreground">Target Agent</label>
        <select
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <div className="mb-3 text-sm font-medium">Attack Categories</div>
        <div className="space-y-2">
          {attacks.map((a) => (
            <label
              key={a.id}
              className="flex cursor-pointer items-start gap-3 rounded border border-border/60 px-3 py-2.5 hover:bg-muted/30"
            >
              <input
                type="checkbox"
                checked={selected.includes(a.id)}
                onChange={() => toggle(a.id)}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{a.name}</span>
                  <SeverityBadge value={a.mode} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Assessment Mode</div>
          <div className="mt-1 text-sm">Standard</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">LLM</div>
          <div className="mt-1 text-sm">OpenAI</div>
        </div>
      </div>

      {error && (
        <div className="rounded border border-critical/40 bg-critical/10 px-3 py-2 text-sm text-critical">
          {error}
        </div>
      )}

      <Button onClick={launch} disabled={loading} className="w-full sm:w-auto">
        {loading ? "Launching..." : "Launch Assessment"}
      </Button>
    </div>
  );
}
